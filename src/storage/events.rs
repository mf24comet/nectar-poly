use sqlx::PgPool;
use uuid::Uuid;

use super::StorageError;
use crate::domain::RawEvent;

pub struct EventRepository {
    pool: PgPool,
}

impl EventRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn insert(&self, event: &RawEvent) -> Result<Uuid, StorageError> {
        let id: Uuid = sqlx::query_scalar(
            r#"
            INSERT INTO events (
                id, request_id, received_at,
                tenant_id, site_id, device_id,
                event_type, payload, source_ip, authenticated_as
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
            "#,
        )
        .bind(event.id)
        .bind(event.request_id)
        .bind(event.received_at)
        .bind(&event.tenant_id)
        .bind(&event.site_id)
        .bind(&event.device_id)
        .bind(&event.event_type)
        .bind(&event.payload)
        .bind(&event.source_ip)
        .bind(&event.authenticated_as)
        .fetch_one(&self.pool)
        .await?;

        Ok(id)
    }
}
