use crate::state::AppState;
use crate::videos::handlers::delete::video_delete_handler;
use crate::videos::handlers::info::video_info_handler;
use crate::videos::handlers::list::video_list_handler;
use crate::videos::handlers::stream::video_stream_handler;
use axum::Router;
use axum::routing::{delete, get};

pub(crate) fn build_videos_routers() -> Router<AppState> {
    Router::new()
        .route("/api/videos/info/", get(video_info_handler))
        .route("/api/videos/info/{*path}", get(video_info_handler))
        .route("/api/videos/list/", get(video_list_handler))
        .route("/api/videos/list/{*path}", get(video_list_handler))
        .route("/api/videos/delete/{*path}", delete(video_delete_handler))
        .route("/api/videos/upload/{*path}", get(|| async { "upload" }))
        .route("/api/videos/stream/{*path}", get(video_stream_handler))
}
