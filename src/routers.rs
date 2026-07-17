use crate::state::AppState;
use crate::videos::routers::build_videos_routers;
use axum::Router;
use axum::http::{StatusCode, Uri};
use axum::response::IntoResponse;
use axum::routing::get;
use rust_embed::Embed;

#[derive(Embed)]
#[folder = "dist/"]
struct Assets;

async fn index_handler(uri: Uri) -> impl IntoResponse {
    let path = match uri.path().trim_start_matches('/') {
        "" => "index.html",
        p => p,
    };

    match Assets::get(path) {
        Some(content) => {
            let mime_type = content.metadata.mimetype().to_string();
            axum::response::Response::builder()
                .status(StatusCode::OK)
                .header(axum::http::header::CONTENT_TYPE, mime_type)
                .body(axum::body::Body::from(content.data))
                .unwrap()
        }
        None => {
            if let Some(index) = Assets::get("index.html") {
                axum::response::Response::builder()
                    .header(axum::http::header::CONTENT_TYPE, "text/html")
                    .body(axum::body::Body::from(index.data))
                    .unwrap()
            } else {
                axum::response::Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(axum::body::Body::from("404 Not Found"))
                    .unwrap()
            }
        }
    }
}

pub(crate) fn build_global_routers(state: AppState) -> Router {
    Router::new()
        .route("/", get(index_handler))
        .route("/{*path}", get(index_handler))
        .merge(build_videos_routers())
        .with_state(state)
}
