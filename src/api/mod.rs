pub mod handlers;

use std::{sync::Arc, time::Duration};

use axum::{
    extract::Request,
    http::{header, HeaderValue},
    middleware::{self, Next},
    response::Response,
    routing::{get, post},
    Router,
};
use tower_http::{limit::RequestBodyLimitLayer, timeout::TimeoutLayer, trace::TraceLayer};
use uuid::Uuid;

use crate::{auth::require_basic_auth, logging::RequestId, storage::AppState};

pub fn build_router(state: Arc<AppState>) -> Router {
    let max_body_bytes = state.settings.max_body_bytes;
    let timeout_secs = state.settings.request_timeout_secs;

    let public = Router::new().route("/health", get(handlers::health::health));

    let protected = Router::new()
        .route("/v1/events", post(handlers::ingest::ingest))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            require_basic_auth,
        ));

    // Layer order: LAST added = outermost = first to process each request.
    //   add_request_id → add_security_headers → Timeout → BodyLimit → Trace → handler
    Router::new()
        .merge(public)
        .merge(protected)
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(max_body_bytes))
        .layer(TimeoutLayer::new(Duration::from_secs(timeout_secs)))
        .layer(middleware::from_fn(add_security_headers))
        .layer(middleware::from_fn(add_request_id))
        .with_state(state)
}

async fn add_request_id(mut request: Request, next: Next) -> Response {
    let id = RequestId(Uuid::new_v4());
    request.extensions_mut().insert(id);

    let mut response = next.run(request).await;
    if let Ok(v) = HeaderValue::from_str(&id.0.to_string()) {
        response.headers_mut().insert("x-request-id", v);
    }
    response
}

async fn add_security_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    let h = response.headers_mut();
    h.insert(header::X_CONTENT_TYPE_OPTIONS, HeaderValue::from_static("nosniff"));
    h.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    h.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    h.insert(
        header::STRICT_TRANSPORT_SECURITY,
        HeaderValue::from_static("max-age=31536000; includeSubDomains"),
    );
    response
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use base64::{engine::general_purpose::STANDARD, Engine};
    use http::{Method, Request, StatusCode};
    use sqlx::postgres::PgPoolOptions;
    use tower::ServiceExt;

    fn test_state() -> Arc<AppState> {
        let settings = crate::config::test_settings();
        // connect_lazy defers the TCP connection; tests that skip DB never touch it.
        let db = PgPoolOptions::new()
            .max_connections(1)
            .connect_lazy(&settings.database_url)
            .expect("lazy connect should not fail");
        AppState::new(db, settings)
    }

    fn basic_auth(user: &str, pass: &str) -> String {
        format!("Basic {}", STANDARD.encode(format!("{user}:{pass}")))
    }

    fn make_app() -> Router {
        build_router(test_state())
    }

    #[tokio::test]
    async fn health_returns_200() {
        let resp = make_app()
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn ingest_without_auth_returns_401() {
        let resp = make_app()
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"event_type":"x","payload":{}}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn ingest_with_wrong_password_returns_401() {
        let resp = make_app()
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .header("authorization", basic_auth("testuser", "wrong"))
                    .body(Body::from(r#"{"event_type":"x","payload":{}}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn ingest_with_invalid_json_returns_400() {
        let resp = make_app()
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .header("authorization", basic_auth("testuser", "testpass"))
                    .body(Body::from("not json"))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn ingest_with_array_payload_returns_422() {
        let body = r#"{"event_type":"device.online","payload":[1,2,3]}"#;
        let resp = make_app()
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .header("authorization", basic_auth("testuser", "testpass"))
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn ingest_with_empty_event_type_returns_422() {
        let body = r#"{"event_type":"","payload":{}}"#;
        let resp = make_app()
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .header("authorization", basic_auth("testuser", "testpass"))
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn response_includes_request_id_header() {
        let resp = make_app()
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert!(resp.headers().contains_key("x-request-id"));
    }

    #[tokio::test]
    async fn response_includes_security_headers() {
        let resp = make_app()
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.headers()["x-content-type-options"], "nosniff");
        assert_eq!(resp.headers()["x-frame-options"], "DENY");
        assert_eq!(resp.headers()["cache-control"], "no-store");
    }

    #[tokio::test]
    async fn unknown_route_returns_404() {
        let resp = make_app()
            .oneshot(Request::builder().uri("/not-found").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    #[ignore = "requires a running PostgreSQL instance — set APP_DATABASE_URL"]
    async fn ingest_valid_event_returns_201() {
        let settings = crate::config::Settings::load().expect("settings");
        let db = crate::storage::connect(&settings).await.expect("db connect");
        sqlx::migrate!("./migrations").run(&db).await.expect("migrate");
        let state = AppState::new(db, settings);

        let body = r#"{"event_type":"device.online","tenant_id":"t1","payload":{"key":"val"}}"#;
        let resp = build_router(state.clone())
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/v1/events")
                    .header("content-type", "application/json")
                    .header(
                        "authorization",
                        basic_auth(&state.settings.auth_username, &state.settings.auth_password),
                    )
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(resp.status(), StatusCode::CREATED);
    }
}
