use axum::{
    extract::{Extension, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json, Response},
};
use serde_json::json;
use std::sync::Arc;

use crate::{
    domain::{AuthenticatedUser, IngestResponse, PolyEventRequest},
    ingestion::{IngestError, IngestService},
    logging::RequestId,
    storage::AppState,
};

pub async fn ingest(
    State(state): State<Arc<AppState>>,
    Extension(RequestId(request_id)): Extension<RequestId>,
    Extension(AuthenticatedUser(user)): Extension<AuthenticatedUser>,
    headers: HeaderMap,
    Json(body): Json<PolyEventRequest>,
) -> Response {
    let source_ip = extract_source_ip(&headers);

    tracing::info!(
        %request_id,
        event_type = %body.event_type,
        tenant_id = ?body.tenant_id,
        site_id = ?body.site_id,
        device_id = ?body.device_id,
        source_ip = ?source_ip,
        user = %user,
        "event received"
    );

    let service = IngestService::new(&state.events);

    match service.ingest(request_id, source_ip, user, body).await {
        Ok(event_id) => {
            tracing::info!(%request_id, %event_id, "event persisted");
            (
                StatusCode::CREATED,
                Json(IngestResponse {
                    event_id,
                    request_id,
                    status: "accepted",
                }),
            )
                .into_response()
        }
        Err(IngestError::Validation(e)) => {
            tracing::warn!(%request_id, error = %e, "validation failure");
            (
                StatusCode::UNPROCESSABLE_ENTITY,
                Json(json!({
                    "error": e.to_string(),
                    "code": "VALIDATION_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response()
        }
        Err(IngestError::Storage(e)) => {
            tracing::error!(%request_id, error = %e, "storage failure");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response()
        }
    }
}

fn extract_source_ip(headers: &HeaderMap) -> Option<String> {
    if let Some(v) = headers.get("x-real-ip").and_then(|v| v.to_str().ok()) {
        return Some(v.to_string());
    }
    if let Some(v) = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok()) {
        return v.split(',').next().map(|s| s.trim().to_string());
    }
    None
}
