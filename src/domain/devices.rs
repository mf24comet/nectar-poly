use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{alerts::AlertSummary, pagination::SortOrder};

/// Device row enriched with joined tenant/site/room names, returned by list and detail endpoints.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Device {
    pub id: Uuid,
    pub name: String,
    pub model: Option<String>,
    pub serial_number: Option<String>,
    pub ip_address: Option<String>,
    pub mac_address: Option<String>,
    pub firmware_version: Option<String>,
    pub status: String,
    pub last_seen_at: Option<DateTime<Utc>>,
    pub tenant_id: Option<Uuid>,
    pub site_id: Option<Uuid>,
    pub room_id: Option<Uuid>,
    pub tenant_name: Option<String>,
    pub site_name: Option<String>,
    pub room_name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DeviceSoftwareVersion {
    pub id: Uuid,
    pub version: String,
    pub is_current: bool,
    pub updated_at: DateTime<Utc>,
}

/// Full device detail: flat device fields plus tags, recent alerts, and software versions.
#[derive(Debug, Serialize)]
pub struct DeviceDetail {
    #[serde(flatten)]
    pub device: Device,
    pub tags: Vec<String>,
    pub recent_alerts: Vec<AlertSummary>,
    pub software_versions: Vec<DeviceSoftwareVersion>,
}

#[derive(Debug, Deserialize, Default, Clone)]
#[serde(rename_all = "snake_case")]
pub enum DeviceSortField {
    #[default]
    Name,
    Status,
    LastSeenAt,
    Model,
}

impl DeviceSortField {
    /// Maps to the qualified SQL column used in ORDER BY. Only static strings — never user input.
    pub fn as_column(&self) -> &'static str {
        match self {
            Self::Name => "d.name",
            Self::Status => "d.status",
            Self::LastSeenAt => "d.last_seen_at",
            Self::Model => "d.model",
        }
    }
}

#[derive(Debug, Deserialize, Default)]
pub struct DeviceFilters {
    pub tenant_id: Option<Uuid>,
    pub site_id: Option<Uuid>,
    pub room_id: Option<Uuid>,
    pub model: Option<String>,
    pub firmware_version: Option<String>,
    pub status: Option<String>,
    pub sort: Option<DeviceSortField>,
    pub order: Option<SortOrder>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

impl DeviceFilters {
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
            .unwrap_or(&DeviceSortField::Name)
            .as_column()
    }

    pub fn sort_direction(&self) -> &'static str {
        self.order.as_ref().unwrap_or(&SortOrder::Asc).as_sql()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_sort_is_name_asc() {
        let f = DeviceFilters::default();
        assert_eq!(f.sort_column(), "d.name");
        assert_eq!(f.sort_direction(), "ASC");
    }

    #[test]
    fn page_clamps_to_minimum_one() {
        let f = DeviceFilters {
            page: Some(0),
            ..Default::default()
        };
        assert_eq!(f.page(), 1);
    }

    #[test]
    fn per_page_clamps_to_100() {
        let f = DeviceFilters {
            per_page: Some(999),
            ..Default::default()
        };
        assert_eq!(f.per_page(), 100);
    }

    #[test]
    fn per_page_clamps_to_minimum_one() {
        let f = DeviceFilters {
            per_page: Some(0),
            ..Default::default()
        };
        assert_eq!(f.per_page(), 1);
    }

    #[test]
    fn offset_calculated_from_page_and_per_page() {
        let f = DeviceFilters {
            page: Some(3),
            per_page: Some(10),
            ..Default::default()
        };
        assert_eq!(f.offset(), 20);
    }

    #[test]
    fn device_sort_field_maps_to_columns() {
        assert_eq!(DeviceSortField::Name.as_column(), "d.name");
        assert_eq!(DeviceSortField::Status.as_column(), "d.status");
        assert_eq!(DeviceSortField::LastSeenAt.as_column(), "d.last_seen_at");
        assert_eq!(DeviceSortField::Model.as_column(), "d.model");
    }
}
