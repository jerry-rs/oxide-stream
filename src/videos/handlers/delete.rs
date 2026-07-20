use crate::state::AppState;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use tracing::{error, info, instrument};

#[instrument(skip(state))]
pub(crate) async fn video_delete_handler(
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
    info!("starting to delete {}", safe_video_path.display());
    if safe_video_path.is_dir() {
        if let Err(e) = tokio::fs::remove_dir_all(&safe_video_path).await {
            error!("{e}");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    } else {
        if let Err(e) = tokio::fs::remove_file(&safe_video_path).await {
            error!("{e}");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    }
    info!("success to delete {}", safe_video_path.display());
    StatusCode::OK.into_response()
}
