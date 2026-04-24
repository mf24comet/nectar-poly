use axum::{
    extract::{Extension, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json, Response},
};
use serde_json::json;
use std::sync::Arc;

use crate::{
    domain::{pagination::PaginatedResponse, software::SoftwareFilters},
    logging::RequestId,
    storage::AppState,
};

pub async fn list_software(
    State(state): State<Arc<AppState>>,
    Extension(RequestId(request_id)): Extension<RequestId>,
    Query(filters): Query<SoftwareFilters>,
) -> Response {
    let (rows, total) = tokio::join!(
        state.software.compliance_list(&filters),
        state.software.compliance_count(&filters),
    );

    let rows = match rows {
        Ok(r) => r,
        Err(e) => {
            tracing::error!(%request_id, error = %e, "software compliance query failed");
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
            tracing::error!(%request_id, error = %e, "software compliance count failed");
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

#[cfg(test)]
mod tests {
    use axum::body::Body;
    use base64::{Engine, engine::general_purpose::STANDARD};
    use http::{Request, StatusCode};
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
    async fn list_software_without_auth_returns_401() {
        let resp = build_router(test_state())
            .oneshot(
                Request::builder()
                    .uri("/v1/software")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    #[ignore = "requires a running PostgreSQL instance — set APP_DATABASE_URL"]
    async fn list_software_returns_200_with_paginated_body() {
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
                    .uri("/v1/software")
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
    }
}
