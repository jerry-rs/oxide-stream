use crate::config::AppConfig;
use crate::routers::build_global_routers;
use crate::state::AppState;
use local_ip_address::local_ip;
use std::sync::Arc;
use tracing::info;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

mod config;
mod routers;
mod state;
mod videos;

#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_ansi_sanitization(true)
                .with_line_number(true)
                .pretty(),
        )
        .init();
    let app_config = AppConfig::default();
    info!("{:#?}", &app_config);
    let app_addr = format!("{}:{}", app_config.ipv4, app_config.port);
    let app_listener = tokio::net::TcpListener::bind(&app_addr)
        .await
        .expect("TcpListener Bind Error");

    info!(
        "Listening on http://{}:{}",
        local_ip().map_or_else(|_| app_addr, |ip| ip.to_string()),
        &app_config.port
    );
    let app_state = AppState {
        config: Arc::new(app_config),
    };

    let app_routers = build_global_routers(app_state);
    axum::serve(
        app_listener,
        app_routers.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await
    .expect("Axum Server Start Error");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c().await.expect("Recv Ctrl+C Error");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Recv Signal Error")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
