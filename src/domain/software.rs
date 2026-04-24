use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Per-version device count for the software compliance overview.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ComplianceSummary {
    pub version: String,
    pub device_count: i64,
}

#[derive(Debug, Deserialize, Default)]
pub struct SoftwareFilters {
    /// Restrict to a single device's version history.
    pub device_id: Option<Uuid>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

impl SoftwareFilters {
    pub fn page(&self) -> i64 {
        self.page.unwrap_or(1).max(1)
    }

    pub fn per_page(&self) -> i64 {
        self.per_page.unwrap_or(25).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        (self.page() - 1) * self.per_page()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_clamps_to_minimum_one() {
        let f = SoftwareFilters {
            page: Some(0),
            ..Default::default()
        };
        assert_eq!(f.page(), 1);
    }

    #[test]
    fn per_page_clamps_to_100() {
        let f = SoftwareFilters {
            per_page: Some(200),
            ..Default::default()
        };
        assert_eq!(f.per_page(), 100);
    }

    #[test]
    fn offset_at_page_two() {
        let f = SoftwareFilters {
            page: Some(2),
            per_page: Some(10),
            ..Default::default()
        };
        assert_eq!(f.offset(), 10);
    }
}
