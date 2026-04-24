use sqlx::PgPool;
use uuid::Uuid;

use super::StorageError;
use crate::domain::{
    alerts::AlertSummary,
    devices::{Device, DeviceFilters, DeviceSoftwareVersion},
};

pub struct DeviceRepository {
    pool: PgPool,
}

impl DeviceRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, filters: &DeviceFilters) -> Result<Vec<Device>, StorageError> {
        // ORDER BY column and direction come from validated Rust enums — never raw user input.
        let sql = format!(
            r#"
            SELECT
                d.id, d.name, d.model, d.serial_number, d.ip_address, d.mac_address,
                d.firmware_version, d.status, d.last_seen_at,
                d.tenant_id, d.site_id, d.room_id, d.created_at, d.updated_at,
                t.name AS tenant_name,
                s.name AS site_name,
                r.name AS room_name
            FROM devices d
            LEFT JOIN tenants t ON d.tenant_id = t.id
            LEFT JOIN sites s ON d.site_id = s.id
            LEFT JOIN rooms r ON d.room_id = r.id
            WHERE ($1::uuid IS NULL OR d.tenant_id = $1)
              AND ($2::uuid IS NULL OR d.site_id = $2)
              AND ($3::uuid IS NULL OR d.room_id = $3)
              AND ($4::text IS NULL OR d.model = $4)
              AND ($5::text IS NULL OR d.status = $5)
              AND ($6::text IS NULL OR d.firmware_version = $6)
            ORDER BY {} {}
            LIMIT $7 OFFSET $8
            "#,
            filters.sort_column(),
            filters.sort_direction(),
        );

        let rows = sqlx::query_as::<_, Device>(&sql)
            .bind(filters.tenant_id)
            .bind(filters.site_id)
            .bind(filters.room_id)
            .bind(&filters.model)
            .bind(&filters.status)
            .bind(&filters.firmware_version)
            .bind(filters.per_page())
            .bind(filters.offset())
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    pub async fn count(&self, filters: &DeviceFilters) -> Result<i64, StorageError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*)
            FROM devices d
            WHERE ($1::uuid IS NULL OR d.tenant_id = $1)
              AND ($2::uuid IS NULL OR d.site_id = $2)
              AND ($3::uuid IS NULL OR d.room_id = $3)
              AND ($4::text IS NULL OR d.model = $4)
              AND ($5::text IS NULL OR d.status = $5)
              AND ($6::text IS NULL OR d.firmware_version = $6)
            "#,
        )
        .bind(filters.tenant_id)
        .bind(filters.site_id)
        .bind(filters.room_id)
        .bind(&filters.model)
        .bind(&filters.status)
        .bind(&filters.firmware_version)
        .fetch_one(&self.pool)
        .await?;
        Ok(count)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Device>, StorageError> {
        let row = sqlx::query_as::<_, Device>(
            r#"
            SELECT
                d.id, d.name, d.model, d.serial_number, d.ip_address, d.mac_address,
                d.firmware_version, d.status, d.last_seen_at,
                d.tenant_id, d.site_id, d.room_id, d.created_at, d.updated_at,
                t.name AS tenant_name,
                s.name AS site_name,
                r.name AS room_name
            FROM devices d
            LEFT JOIN tenants t ON d.tenant_id = t.id
            LEFT JOIN sites s ON d.site_id = s.id
            LEFT JOIN rooms r ON d.room_id = r.id
            WHERE d.id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row)
    }

    pub async fn tags(&self, device_id: Uuid) -> Result<Vec<String>, StorageError> {
        let tags: Vec<String> =
            sqlx::query_scalar("SELECT tag FROM device_tags WHERE device_id = $1 ORDER BY tag")
                .bind(device_id)
                .fetch_all(&self.pool)
                .await?;
        Ok(tags)
    }

    pub async fn recent_alerts(&self, device_id: Uuid) -> Result<Vec<AlertSummary>, StorageError> {
        let rows = sqlx::query_as::<_, AlertSummary>(
            r#"
            SELECT id, severity, alert_type, message, first_seen, last_seen, resolved_at
            FROM alerts
            WHERE device_id = $1
            ORDER BY last_seen DESC
            LIMIT 10
            "#,
        )
        .bind(device_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    pub async fn software_versions(
        &self,
        device_id: Uuid,
    ) -> Result<Vec<DeviceSoftwareVersion>, StorageError> {
        let rows = sqlx::query_as::<_, DeviceSoftwareVersion>(
            r#"
            SELECT id, version, is_current, updated_at
            FROM software_versions
            WHERE device_id = $1
            ORDER BY updated_at DESC
            "#,
        )
        .bind(device_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }
}
