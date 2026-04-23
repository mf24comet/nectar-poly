mod api;
mod auth;
mod config;
mod domain;
mod ingestion;
mod logging;
mod storage;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let settings = config::Settings::load().map_err(|e| {
        eprintln!("failed to load configuration: {e}");
        e
    })?;

    logging::init(&settings.log_level);

    tracing::info!(
        host = %settings.host,
        port = settings.port,
        log_level = %settings.log_level,
        "starting nectar-poly"
    );

    let db = storage::connect(&settings).await.map_err(|e| {
        tracing::error!(error = %e, "database connection failed");
        e
    })?;

    sqlx::migrate!("./migrations").run(&db).await.map_err(|e| {
        tracing::error!(error = %e, "migration failed");
        e
    })?;

    tracing::info!("migrations applied");

    let state = storage::AppState::new(db, settings.clone());
    let app = api::build_router(state);

    let addr = format!("{}:{}", settings.host, settings.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!(%addr, "server listening");

    axum::serve(listener, app).await?;

    Ok(())
}
