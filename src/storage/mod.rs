pub mod alerts;
pub mod devices;
pub mod events;
pub mod software;

use sqlx::{PgPool, postgres::PgPoolOptions};
use std::sync::Arc;
use thiserror::Error;

use crate::config::Settings;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
}

pub struct AppState {
    #[allow(dead_code)]
    pub db: PgPool,
    pub settings: Settings,
    pub events: events::EventRepository,
    pub devices: devices::DeviceRepository,
    pub alerts: alerts::AlertRepository,
    pub software: software::SoftwareRepository,
}

impl AppState {
    pub fn new(db: PgPool, settings: Settings) -> Arc<Self> {
        let events = events::EventRepository::new(db.clone());
        let devices = devices::DeviceRepository::new(db.clone());
        let alerts = alerts::AlertRepository::new(db.clone());
        let software = software::SoftwareRepository::new(db.clone());
        Arc::new(Self {
            db,
            settings,
            events,
            devices,
            alerts,
            software,
        })
    }
}

pub async fn connect(settings: &Settings) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(settings.db_max_connections)
        .connect(&settings.database_url)
        .await
}
