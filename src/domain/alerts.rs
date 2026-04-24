use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::pagination::SortOrder;

/// Full alert row, enriched with joined device info, returned by list/detail endpoints.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Alert {
    pub id: Uuid,
    pub device_id: Option<Uuid>,
    pub tenant_id: Option<Uuid>,
    pub site_id: Option<Uuid>,
    pub severity: String,
    pub alert_type: String,
    pub message: String,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub device_name: Option<String>,
    pub device_model: Option<String>,
}

/// Lightweight alert embedded in device detail responses (no join data needed).
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct AlertSummary {
    pub id: Uuid,
    pub severity: String,
    pub alert_type: String,
    pub message: String,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Default, Clone)]
#[serde(rename_all = "snake_case")]
pub enum AlertSortField {
    #[default]
    LastSeen,
    FirstSeen,
    Severity,
}

impl AlertSortField {
    pub fn as_column(&self) -> &'static str {
        match self {
            Self::LastSeen => "a.last_seen",
            Self::FirstSeen => "a.first_seen",
            Self::Severity => "a.severity",
        }
    }
}

#[derive(Debug, Deserialize, Default)]
pub struct AlertFilters {
    pub tenant_id: Option<Uuid>,
    pub site_id: Option<Uuid>,
    pub device_id: Option<Uuid>,
    pub severity: Option<String>,
    /// true = resolved only, false = active only, absent = all
    pub resolved: Option<bool>,
    pub sort: Option<AlertSortField>,
    pub order: Option<SortOrder>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

impl AlertFilters {
    pub fn page(&self) -> i64 {
        self.page.unwrap_or(1).max(1)
    }

    pub fn per_page(&self) -> i64 {
        self.per_page.unwrap_or(25).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        (self.page() - 1) * self.per_page()
    }

    pub fn sort_column(&self) -> &'static str {
        self.sort
            .as_ref()
            .unwrap_or(&AlertSortField::LastSeen)
            .as_column()
    }

    pub fn sort_direction(&self) -> &'static str {
        self.order.as_ref().unwrap_or(&SortOrder::Desc).as_sql()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_sort_is_last_seen_desc() {
        let f = AlertFilters::default();
        assert_eq!(f.sort_column(), "a.last_seen");
        assert_eq!(f.sort_direction(), "DESC");
    }

    #[test]
    fn page_clamps_to_minimum_one() {
        let f = AlertFilters {
            page: Some(0),
            ..Default::default()
        };
        assert_eq!(f.page(), 1);
    }

    #[test]
    fn per_page_clamps_to_100() {
        let f = AlertFilters {
            per_page: Some(999),
            ..Default::default()
        };
        assert_eq!(f.per_page(), 100);
    }

    #[test]
    fn per_page_clamps_to_minimum_one() {
        let f = AlertFilters {
            per_page: Some(0),
            ..Default::default()
        };
        assert_eq!(f.per_page(), 1);
    }

    #[test]
    fn offset_calculated_from_page_and_per_page() {
        let f = AlertFilters {
            page: Some(3),
            per_page: Some(10),
            ..Default::default()
        };
        assert_eq!(f.offset(), 20);
    }

    #[test]
    fn alert_sort_field_maps_to_columns() {
        assert_eq!(AlertSortField::LastSeen.as_column(), "a.last_seen");
        assert_eq!(AlertSortField::FirstSeen.as_column(), "a.first_seen");
        assert_eq!(AlertSortField::Severity.as_column(), "a.severity");
    }
}
