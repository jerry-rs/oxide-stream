use std::io::Read;
use crate::state::AppState;
use axum::Json;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde::Serialize;
use tracing::{error, info, instrument};

#[derive(Serialize)]
pub(crate) struct VideoDetailInfoResponse {
    pub(crate) filename: String,
    pub(crate) size: Option<u64>,
    pub(crate) mime_type: String,
    pub(crate) blake3: String,
    pub(crate) sha256: Option<String>
}

#[instrument(skip(state))]
pub(crate) async fn video_detail_info_handler(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Path(path): axum::extract::Path<String>,
) -> impl IntoResponse {
    let safe_video_path = match std::fs::canonicalize(state.config.data_dir.join(&path)) {
        Ok(v_path) => v_path,
        Err(e) => {
            error!("{e}");
            return StatusCode::NOT_FOUND.into_response();
        }
    };
    info!(
        "starting to get video info from {}",
        safe_video_path.display()
    );

    let filename = safe_video_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".to_string());
    let size = safe_video_path.metadata().ok().map(|meta| meta.len());
    let mime_type = mime_guess::from_path(&path)
        .first_or_octet_stream()
        .to_string();

    let b3 = std::fs::File::open(&safe_video_path)
        .ok()
        .map(|file| {
            let buf_reader = std::io::BufReader::new(file);
            let mut hash = blake3::Hasher::new();
            if let Err(e) = hash.update_reader(buf_reader) {
                error!("{e}");
                return "".to_string();
            }
            hash.finalize().to_string()
        })
        .unwrap_or_default();
    let hasher = ring::digest::Context::new(&ring::digest::SHA256);


    let sha256 = std::fs::File::open(&safe_video_path)
        .ok()
        .map(
            |mut file| {
                let mut buf_reader = std::io::BufReader::new(file);
                let mut hasher = ring::digest::Context::new(&ring::digest::SHA256);
                let mut buf = vec![0u8;1024];
                let is_success = true;
                loop {
                   match buf_reader.read(&mut buf){
                       Ok(0) => break,
                       Ok(n) => {
                           hasher.update(&buf[0..n]);
                       },
                       Err(e) => {
                           error!("{e}");
                           return "".to_string();
                       }
                   }
                }
                hex::encode(hasher.finish())
            }
        );
    info!(
        "success to get video info from {}",
        safe_video_path.display()
    );
    (
        StatusCode::OK,
        Json(VideoDetailInfoResponse {
            filename,
            size,
            mime_type,
            blake3: b3,
            sha256
        }),
    )
        .into_response()
}
