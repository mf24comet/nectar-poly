use sqlx::PgPool;
use uuid::Uuid;

use super::StorageError;
use crate::domain::alerts::{Alert, AlertFilters};

pub struct AlertRepository {
    pool: PgPool,
}

impl AlertRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, filters: &AlertFilters) -> Result<Vec<Alert>, StorageError> {
        // ORDER BY column and direction come from validated Rust enums — never raw user input.
        let sql = format!(
            r#"
            SELECT
                a.id, a.device_id, a.tenant_id, a.site_id,
                a.severity, a.alert_type, a.message,
                a.first_seen, a.last_seen, a.resolved_at, a.created_at,
                d.name AS device_name,
                d.model AS device_model
            FROM alerts a
            LEFT JOIN devices d ON a.device_id = d.id
            WHERE ($1::uuid IS NULL OR a.tenant_id = $1)
              AND ($2::uuid IS NULL OR a.site_id = $2)
              AND ($3::uuid IS NULL OR a.device_id = $3)
              AND ($4::text IS NULL OR a.severity = $4)
              AND ($5::boolean IS NULL OR (a.resolved_at IS NOT NULL) = $5)
            ORDER BY {} {}
            LIMIT $6 OFFSET $7
            "#,
            filters.sort_column(),
            filters.sort_direction(),
        );

        let rows = sqlx::query_as::<_, Alert>(&sql)
            .bind(filters.tenant_id)
            .bind(filters.site_id)
            .bind(filters.device_id)
            .bind(&filters.severity)
            .bind(filters.resolved)
            .bind(filters.per_page())
            .bind(filters.offset())
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    pub async fn count(&self, filters: &AlertFilters) -> Result<i64, StorageError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM alerts a
            WHERE ($1::uuid IS NULL OR a.tenant_id = $1)
              AND ($2::uuid IS NULL OR a.site_id = $2)
              AND ($3::uuid IS NULL OR a.device_id = $3)
              AND ($4::text IS NULL OR a.severity = $4)
              AND ($5::boolean IS NULL OR (a.resolved_at IS NOT NULL) = $5)
            "#,
        )
        .bind(filters.tenant_id)
        .bind(filters.site_id)
        .bind(filters.device_id)
        .bind(&filters.severity)
        .bind(filters.resolved)
        .fetch_one(&self.pool)
        .await?;
        Ok(count)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Alert>, StorageError> {
        let row = sqlx::query_as::<_, Alert>(
            r#"
            SELECT
                a.id, a.device_id, a.tenant_id, a.site_id,
                a.severity, a.alert_type, a.message,
                a.first_seen, a.last_seen, a.resolved_at, a.created_at,
                d.name AS device_name,
                d.model AS device_model
            FROM alerts a
            LEFT JOIN devices d ON a.device_id = d.id
            WHERE a.id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row)
    }
}
