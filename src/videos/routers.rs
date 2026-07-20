use axum::http::header::{AUTHORIZATION, COOKIE};
use axum::http::{StatusCode};
use crate::state::AppState;
use crate::videos::handlers::delete::video_delete_handler;
use crate::videos::handlers::info::video_info_handler;
use crate::videos::handlers::list::video_list_handler;
use crate::videos::handlers::stream::video_stream_handler;
use crate::videos::handlers::detail_info::video_detail_info_handler;
use axum::{Router};
use axum::response::IntoResponse;
use axum::routing::{delete, get};
use tracing::error;

const EXPECTED_TOKEN:&str = "oxide_stream_token";
const COOKIE_NAME: &str = "token"; // Cookie 中的 key 名称

pub(crate) fn build_videos_routers() -> Router<AppState> {
    Router::new()
        .merge(
            Router::new()
                .route("/api/videos/info/", get(video_info_handler))
                .route("/api/videos/info/{*path}", get(video_info_handler))
                .route("/api/videos/detail/info/{*path}", get(video_detail_info_handler))
                .route("/api/videos/list/", get(video_list_handler))
                .route("/api/videos/list/{*path}", get(video_list_handler))
                .route("/api/videos/delete/{*path}", delete(video_delete_handler))
                .route("/api/videos/upload/{*path}", get(|| async { "upload" }))
                .layer(
                    tower_http::validate_request::ValidateRequestHeaderLayer::custom(|req: &mut axum::http::Request<_>| {
                        // 1. 提取 Header Token（兼容纯 Token 或 Bearer 前缀）
                        let token_from_header = req.headers().get(AUTHORIZATION).and_then(|v| {
                            let s = v.to_str().ok()?;
                            Some(s.strip_prefix("Bearer ").unwrap_or(s))
                        });

                        // 2. 提取 Cookie Token
                        let token_from_cookie = req.headers().get(COOKIE)
                            .and_then(|v| v.to_str().ok())
                            .and_then(|cookies| {
                                cookies.split(';').find_map(|cookie| {
                                    let mut parts = cookie.trim().splitn(2, '=');
                                    let key = parts.next()?;
                                    let val = parts.next()?;
                                    if key == COOKIE_NAME {
                                        Some(val)
                                    } else {
                                        None
                                    }
                                })
                            });

                        // 3. 只要任意一个匹配即视为通过
                        if token_from_header == Some(EXPECTED_TOKEN) || token_from_cookie == Some(EXPECTED_TOKEN) {
                            Ok(())
                        } else {
                            // 4. 使用 match 优雅地精准记录失败日志
                            match (token_from_header, token_from_cookie) {
                                (Some(h), Some(c)) => error!("Invalid token - Header: '{h}', Cookie: '{c}'"),
                                (Some(h), None) => error!("Invalid token from Header: '{h}'"),
                                (None, Some(c)) => error!("Invalid token from Cookie: '{c}'"),
                                (None, None) => error!("Missing auth token in both Header and Cookie"),
                            }
                            Err(StatusCode::UNAUTHORIZED.into_response())
                        }
                    })
                )
        )
        .route("/api/videos/stream/{*path}", get(video_stream_handler))

}
