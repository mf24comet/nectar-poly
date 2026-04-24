use axum::{http::StatusCode, response::Json};
use serde_json::{Value, json};

pub async fn health() -> (StatusCode, Json<Value>) {
    (StatusCode::OK, Json(json!({ "status": "ok" })))
}
