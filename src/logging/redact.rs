/// Returns a fixed redaction marker so sensitive values never appear in logs.
#[allow(dead_code)]
pub fn redact(_value: &str) -> &'static str {
    "[REDACTED]"
}

/// Strips the credential from a `Basic <base64>` header value for safe logging.
pub fn redact_auth_header(header: &str) -> &str {
    if header.to_ascii_lowercase().starts_with("basic ") {
        "Basic [REDACTED]"
    } else if header.to_ascii_lowercase().starts_with("bearer ") {
        "Bearer [REDACTED]"
    } else {
        "[REDACTED]"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn redacts_basic_auth() {
        assert_eq!(redact_auth_header("Basic dXNlcjpwYXNz"), "Basic [REDACTED]");
    }

    #[test]
    fn redacts_bearer_token() {
        assert_eq!(redact_auth_header("Bearer abc.def.ghi"), "Bearer [REDACTED]");
    }

    #[test]
    fn redacts_unknown_scheme() {
        assert_eq!(redact_auth_header("Digest xyz"), "[REDACTED]");
    }

    #[test]
    fn redact_any_value() {
        assert_eq!(redact("super-secret-key"), "[REDACTED]");
    }
}
