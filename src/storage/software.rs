use sqlx::PgPool;

use super::StorageError;
use crate::domain::software::{ComplianceSummary, SoftwareFilters};

pub struct SoftwareRepository {
    pool: PgPool,
}

impl SoftwareRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Returns current firmware version distribution: each distinct version and how many
    /// devices are currently running it, sorted by device count descending.
    pub async fn compliance_list(
        &self,
        filters: &SoftwareFilters,
    ) -> Result<Vec<ComplianceSummary>, StorageError> {
        let rows = sqlx::query_as::<_, ComplianceSummary>(
            r#"
            SELECT version, COUNT(*) AS device_count
            FROM software_versions
            WHERE is_current = true
              AND ($1::uuid IS NULL OR device_id = $1)
            GROUP BY version
            ORDER BY device_count DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(filters.device_id)
        .bind(filters.per_page())
        .bind(filters.offset())
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    pub async fn compliance_count(&self, filters: &SoftwareFilters) -> Result<i64, StorageError> {
        let count: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(DISTINCT version)
            FROM software_versions
            WHERE is_current = true
              AND ($1::uuid IS NULL OR device_id = $1)
            "#,
        )
        .bind(filters.device_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(count)
    }
}
