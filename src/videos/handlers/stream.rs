use crate::state::AppState;
use axum::http::{ StatusCode};
use axum::response::IntoResponse;
use tower::ServiceExt;
use tracing::{error, info, instrument};

#[instrument(skip(state, req))]
pub(crate) async fn video_stream_handler(
    axum::extract::State(state): axum::extract::State<AppState>,
    axum::extract::Path(path): axum::extract::Path<String>,
    req: axum::extract::Request<axum::body::Body>,
) -> impl IntoResponse {
    let safe_video_path = match std::fs::canonicalize(state.config.data_dir.join(&path)) {
        Ok(v_path) => v_path,
        Err(e) => {
            error!("{e}");
            return StatusCode::NOT_FOUND.into_response();
        }
    };
    info!("playing video {} ", safe_video_path.display());
    match tower_http::services::ServeFile::new(&safe_video_path)
        .oneshot(req)
        .await
    {
        Ok(response) => response.into_response(),
        Err(e) => {
            error!("{e}");
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}
