use axum::{
    extract::State,
    http::{Request, StatusCode, header},
    middleware::Next,
    response::{IntoResponse, Json, Response},
};
use base64::{Engine, engine::general_purpose::STANDARD};
use constant_time_eq::constant_time_eq;
use serde_json::json;
use std::sync::Arc;

use crate::{domain::AuthenticatedUser, logging::redact::redact_auth_header, storage::AppState};

pub async fn require_basic_auth(
    State(state): State<Arc<AppState>>,
    mut request: Request<axum::body::Body>,
    next: Next,
) -> Response {
    let auth_header = request.headers().get(header::AUTHORIZATION);

    let Some(raw) = auth_header else {
        tracing::warn!(reason = "missing Authorization header", "auth failure");
        return unauthorized_response();
    };

    let raw_str = match raw.to_str() {
        Ok(s) => s,
        Err(_) => {
            tracing::warn!(reason = "non-UTF8 Authorization header", "auth failure");
            return unauthorized_response();
        }
    };

    tracing::debug!(header = redact_auth_header(raw_str), "auth attempt");

    let Some((username, password)) = extract_credentials(raw_str) else {
        tracing::warn!(reason = "malformed Basic credentials", "auth failure");
        return unauthorized_response();
    };

    let expected_user = state.settings.auth_username.as_bytes();
    let expected_pass = state.settings.auth_password.as_bytes();

    // Evaluate both sides unconditionally before branching to limit timing leakage.
    let user_ok = constant_time_eq(username.as_bytes(), expected_user);
    let pass_ok = constant_time_eq(password.as_bytes(), expected_pass);

    if !(user_ok && pass_ok) {
        tracing::warn!(reason = "invalid credentials", "auth failure");
        return unauthorized_response();
    }

    request
        .extensions_mut()
        .insert(AuthenticatedUser(username.clone()));

    tracing::debug!(user = %username, "auth success");
    next.run(request).await
}

fn extract_credentials(header: &str) -> Option<(String, String)> {
    let encoded = header.strip_prefix("Basic ")?;
    let decoded = STANDARD.decode(encoded).ok()?;
    let text = String::from_utf8(decoded).ok()?;
    let (user, pass) = text.split_once(':')?;
    Some((user.to_string(), pass.to_string()))
}

fn unauthorized_response() -> Response {
    (
        StatusCode::UNAUTHORIZED,
        [(
            header::WWW_AUTHENTICATE,
            r#"Basic realm="nectar-poly", charset="UTF-8""#,
        )],
        Json(json!({
            "error": "authentication required",
            "code": "AUTH_REQUIRED",
        })),
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_valid_credentials() {
        // "user:pass" base64 encoded
        let encoded = STANDARD.encode("user:pass");
        let header = format!("Basic {encoded}");
        let result = extract_credentials(&header);
        assert_eq!(result, Some(("user".into(), "pass".into())));
    }

    #[test]
    fn rejects_missing_basic_prefix() {
        assert!(extract_credentials("Bearer token123").is_none());
    }

    #[test]
    fn rejects_invalid_base64() {
        assert!(extract_credentials("Basic not!valid!base64!!!").is_none());
    }

    #[test]
    fn rejects_no_colon_separator() {
        let encoded = STANDARD.encode("nocolon");
        let header = format!("Basic {encoded}");
        assert!(extract_credentials(&header).is_none());
    }

    #[test]
    fn password_may_contain_colon() {
        // RFC 7617: only the first colon splits user from password
        let encoded = STANDARD.encode("user:pass:with:colons");
        let header = format!("Basic {encoded}");
        let result = extract_credentials(&header);
        assert_eq!(result, Some(("user".into(), "pass:with:colons".into())));
    }

    #[test]
    fn empty_password_is_valid() {
        let encoded = STANDARD.encode("user:");
        let header = format!("Basic {encoded}");
        let result = extract_credentials(&header);
        assert_eq!(result, Some(("user".into(), "".into())));
    }
}
