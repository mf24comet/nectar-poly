use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json, Response},
};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    domain::{
        devices::{DeviceDetail, DeviceFilters},
        pagination::PaginatedResponse,
    },
    logging::RequestId,
    storage::AppState,
};

pub async fn list_devices(
    State(state): State<Arc<AppState>>,
    Extension(RequestId(request_id)): Extension<RequestId>,
    Query(filters): Query<DeviceFilters>,
) -> Response {
    let (rows, total) = tokio::join!(state.devices.list(&filters), state.devices.count(&filters),);

    let rows = match rows {
        Ok(r) => r,
        Err(e) => {
            tracing::error!(%request_id, error = %e, "device list query failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    let total = match total {
        Ok(n) => n,
        Err(e) => {
            tracing::error!(%request_id, error = %e, "device count query failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    Json(PaginatedResponse {
        data: rows,
        total,
        page: filters.page(),
        per_page: filters.per_page(),
    })
    .into_response()
}

pub async fn get_device(
    State(state): State<Arc<AppState>>,
    Extension(RequestId(request_id)): Extension<RequestId>,
    Path(id): Path<Uuid>,
) -> Response {
    let device = match state.devices.find_by_id(id).await {
        Ok(Some(d)) => d,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({
                    "error": "device not found",
                    "code": "NOT_FOUND",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
        Err(e) => {
            tracing::error!(%request_id, %id, error = %e, "device lookup failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    let device_id = device.id;

    let (tags, recent_alerts, software_versions) = tokio::join!(
        state.devices.tags(device_id),
        state.devices.recent_alerts(device_id),
        state.devices.software_versions(device_id),
    );

    let tags = match tags {
        Ok(t) => t,
        Err(e) => {
            tracing::error!(%request_id, %device_id, error = %e, "device tags query failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    let recent_alerts = match recent_alerts {
        Ok(a) => a,
        Err(e) => {
            tracing::error!(%request_id, %device_id, error = %e, "device alerts query failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    let software_versions = match software_versions {
        Ok(v) => v,
        Err(e) => {
            tracing::error!(%request_id, %device_id, error = %e, "device software query failed");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal server error",
                    "code": "STORAGE_ERROR",
                    "request_id": request_id,
                })),
            )
                .into_response();
        }
    };

    Json(DeviceDetail {
        device,
        tags,
        recent_alerts,
        software_versions,
    })
    .into_response()
}

#[cfg(test)]
mod tests {
    use axum::body::Body;
    use base64::{Engine, engine::general_purpose::STANDARD};
    use http::{Method, Request, StatusCode};
    use sqlx::postgres::PgPoolOptions;
    use std::sync::Arc;
    use tower::ServiceExt;

    use crate::{api::build_router, config, storage::AppState};

    fn test_state() -> Arc<AppState> {
        let settings = config::test_settings();
        let db = PgPoolOptions::new()
            .max_connections(1)
            .connect_lazy(&settings.database_url)
            .expect("lazy connect");
        AppState::new(db, settings)
    }

    fn basic_auth(user: &str, pass: &str) -> String {
        format!("Basic {}", STANDARD.encode(format!("{user}:{pass}")))
    }

    #[tokio::test]
    async fn list_devices_without_auth_returns_401() {
        let resp = build_router(test_state())
            .oneshot(
                Request::builder()
                    .uri("/v1/devices")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn get_device_without_auth_returns_401() {
        let id = uuid::Uuid::new_v4();
        let resp = build_router(test_state())
            .oneshot(
                Request::builder()
                    .uri(format!("/v1/devices/{id}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn list_devices_invalid_uuid_filter_returns_400() {
        let settings = config::test_settings();
        let resp = build_router(test_state())
            .oneshot(
                Request::builder()
                    .uri("/v1/devices?tenant_id=not-a-uuid")
                    .header(
                        "authorization",
                        basic_auth(&settings.auth_username, &settings.auth_password),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    #[ignore = "requires a running PostgreSQL instance — set APP_DATABASE_URL"]
    async fn list_devices_returns_200_with_paginated_body() {
        let settings = config::Settings::load().expect("settings");
        let db = crate::storage::connect(&settings).await.expect("db");
        sqlx::migrate!("./migrations")
            .run(&db)
            .await
            .expect("migrate");
        let state = AppState::new(db, settings.clone());

        let resp = build_router(state.clone())
            .oneshot(
                Request::builder()
                    .method(Method::GET)
                    .uri("/v1/devices?per_page=5")
                    .header(
                        "authorization",
                        basic_auth(&state.settings.auth_username, &state.settings.auth_password),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(resp.status(), StatusCode::OK);

        let body = http_body_util::BodyExt::collect(resp.into_body())
            .await
            .unwrap()
            .to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();

        assert!(json.get("data").unwrap().is_array());
        assert!(json.get("total").unwrap().is_number());
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 5);
    }

    #[tokio::test]
    #[ignore = "requires a running PostgreSQL instance — set APP_DATABASE_URL"]
    async fn get_device_unknown_id_returns_404() {
        let settings = config::Settings::load().expect("settings");
        let db = crate::storage::connect(&settings).await.expect("db");
        sqlx::migrate!("./migrations")
            .run(&db)
            .await
            .expect("migrate");
        let state = AppState::new(db, settings.clone());
        let id = uuid::Uuid::new_v4();

        let resp = build_router(state.clone())
            .oneshot(
                Request::builder()
                    .uri(format!("/v1/devices/{id}"))
                    .header(
                        "authorization",
                        basic_auth(&state.settings.auth_username, &state.settings.auth_password),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(resp.status(), StatusCode::NOT_FOUND);
    }
}
