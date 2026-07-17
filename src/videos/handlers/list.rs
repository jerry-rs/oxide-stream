use crate::state::AppState;
use axum::Json;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde::Serialize;
use std::option::Option;
use std::time::UNIX_EPOCH;
use tracing::{error, info, instrument};

fn is_video_ext(ext: &str) -> bool {
    matches!(
        ext.to_lowercase().as_str(),
        "mp4" | "mkv" | "webm" | "avi" | "mov" | "wmv" | "flv" | "m4v" | "ts" | "m3u8" | "srt"
    )
}

#[derive(Serialize)]
pub(crate) struct VideoItem {
    pub(crate) filename: String,
    pub(crate) r#type: Option<String>,
    pub(crate) created: Option<u64>,
    pub(crate) modified: Option<u64>,
    pub(crate) accessed: Option<u64>,
    pub(crate) size: u64,
}

#[derive(Serialize)]
#[serde(transparent)]
pub(crate) struct VideoListResponse {
    pub(crate) items: Vec<VideoItem>,
}

#[instrument(skip(state))]
pub(crate) async fn video_list_handler(
    axum::extract::State(state): axum::extract::State<AppState>,
    option_path: Option<axum::extract::Path<String>>,
) -> impl IntoResponse {
    let safe_video_dir = match option_path {
        Some(axum::extract::Path(p)) => {
            match tokio::fs::canonicalize(state.config.data_dir.join(&p)).await {
                Ok(v_path) => v_path,
                Err(e) => {
                    error!("{e}");
                    return StatusCode::NOT_FOUND.into_response();
                }
            }
        }
        None => state.config.data_dir.clone(),
    };
    info!("starting to list entry from {}", safe_video_dir.display());

    match tokio::fs::read_dir(&safe_video_dir).await {
        Ok(mut entries) => {
            let mut items = Vec::new();
            while let Ok(Some(entry)) = entries.next_entry().await {
                // 性能优化：无损转换为 String，避免 to_string_lossy 带来的强制复制开
                let filename = entry
                    .file_name()
                    .into_string()
                    .unwrap_or_else(|os_str| os_str.to_string_lossy().into_owned());

                // 核心性能优化：只读取 1 次 metadata
                let metadata = match entry.metadata().await {
                    Ok(meta) => meta,
                    Err(e) => {
                        error!("Failed to read metadata for {filename}: {e}");
                        continue; // 读取属性失败则跳过该文件
                    }
                };

                let is_dir = metadata.is_dir();

                if !is_dir
                    && !is_video_ext(
                        std::path::Path::new(&filename)
                            .extension()
                            .and_then(|e| e.to_str())
                            .unwrap_or(""),
                    )
                {
                    continue;
                }

                let r#type = entry.file_type().await.ok().map(|ft| {
                    if ft.is_dir() {
                        "d".to_string()
                    } else if ft.is_file() {
                        "f".to_string()
                    } else {
                        "o".to_string()
                    }
                });

                let created = metadata
                    .created()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok().map(|d| d.as_secs()));

                let modified = metadata
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok().map(|d| d.as_secs()));
                let accessed = metadata
                    .accessed()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok().map(|d| d.as_secs()));

                let size = metadata.len();
                items.push(VideoItem {
                    filename,
                    r#type,
                    created,
                    modified,
                    accessed,
                    size,
                });
            }
            items.sort_by(|a, b| a.r#type.cmp(&b.r#type));
            (StatusCode::OK, Json(VideoListResponse { items })).into_response()
        }
        Err(e) => {
            error!("{e}");
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}
