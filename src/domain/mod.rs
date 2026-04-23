use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Inbound event payload sent by a Poly Lens integration.
#[derive(Debug, Deserialize)]
pub struct PolyEventRequest {
    pub event_type: String,
    pub tenant_id: Option<String>,
    pub site_id: Option<String>,
    pub device_id: Option<String>,
    pub payload: serde_json::Value,
}

/// Normalised event ready for persistence.
pub struct RawEvent {
    pub id: Uuid,
    pub request_id: Uuid,
    pub received_at: DateTime<Utc>,
    pub tenant_id: Option<String>,
    pub site_id: Option<String>,
    pub device_id: Option<String>,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub source_ip: Option<String>,
    pub authenticated_as: String,
}

/// Returned to the caller after a successful ingest.
#[derive(Debug, Serialize)]
pub struct IngestResponse {
    pub event_id: Uuid,
    pub request_id: Uuid,
    pub status: &'static str,
}

/// Authenticated principal injected into request extensions by the auth middleware.
#[derive(Clone, Debug)]
pub struct AuthenticatedUser(pub String);
