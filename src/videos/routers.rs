use axum::http::header::AUTHORIZATION;
use axum::http::{StatusCode};
use crate::state::AppState;
use crate::videos::handlers::delete::video_delete_handler;
use crate::videos::handlers::info::video_info_handler;
use crate::videos::handlers::list::video_list_handler;
use crate::videos::handlers::stream::video_stream_handler;
use axum::{Router};
use axum::response::IntoResponse;
use axum::routing::{delete, get};
use tracing::error;

const EXPECTED_TOKEN:&str = "Bearer oxide_stream_token";

pub(crate) fn build_videos_routers() -> Router<AppState> {
    Router::new()
        .route("/api/videos/info/", get(video_info_handler))
        .route("/api/videos/info/{*path}", get(video_info_handler))
        .route("/api/videos/list/", get(video_list_handler))
        .route("/api/videos/list/{*path}", get(video_list_handler))
        .route("/api/videos/delete/{*path}", delete(video_delete_handler))
        .route("/api/videos/upload/{*path}", get(|| async { "upload" }))
        .route("/api/videos/stream/{*path}", get(video_stream_handler))
        .layer(
            tower_http::validate_request::ValidateRequestHeaderLayer::custom(|req:&mut axum::http::Request<_>| {
                let auth_header = req.headers().get(AUTHORIZATION).and_then(|v| v.to_str().ok());
                if auth_header == Some(EXPECTED_TOKEN) {
                    Ok(())
                } else {
                    error!("Invalid token: {}",auth_header.unwrap_or("Unknown"));
                    Err(StatusCode::UNAUTHORIZED.into_response())
                }
            })
        )
}
