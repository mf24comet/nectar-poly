pub mod events;

use sqlx::{postgres::PgPoolOptions, PgPool};
use std::sync::Arc;

use crate::config::Settings;

pub struct AppState {
    // Retained for health checks and future metric queries.
    #[allow(dead_code)]
    pub db: PgPool,
    pub settings: Settings,
    pub events: events::EventRepository,
}

impl AppState {
    pub fn new(db: PgPool, settings: Settings) -> Arc<Self> {
        let events = events::EventRepository::new(db.clone());
        Arc::new(Self { db, settings, events })
    }
}

pub async fn connect(settings: &Settings) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(settings.db_max_connections)
        .connect(&settings.database_url)
        .await
}
