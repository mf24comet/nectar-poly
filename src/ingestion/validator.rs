use thiserror::Error;

use crate::domain::PolyEventRequest;

const MAX_EVENT_TYPE_LEN: usize = 100;
const MAX_ID_FIELD_LEN: usize = 200;

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("event_type is required and must not be empty")]
    MissingEventType,
    #[error("event_type exceeds maximum length of {MAX_EVENT_TYPE_LEN} characters")]
    EventTypeTooLong,
    #[error("payload must be a JSON object")]
    PayloadNotObject,
    #[error("tenant_id must not be empty when present")]
    EmptyTenantId,
    #[error("site_id must not be empty when present")]
    EmptySiteId,
    #[error("device_id must not be empty when present")]
    EmptyDeviceId,
    #[error("{field} exceeds maximum length of {MAX_ID_FIELD_LEN} characters")]
    IdFieldTooLong { field: &'static str },
}

pub fn validate(event: &PolyEventRequest) -> Result<(), ValidationError> {
    if event.event_type.trim().is_empty() {
        return Err(ValidationError::MissingEventType);
    }
    if event.event_type.len() > MAX_EVENT_TYPE_LEN {
        return Err(ValidationError::EventTypeTooLong);
    }
    if !event.payload.is_object() {
        return Err(ValidationError::PayloadNotObject);
    }
    check_optional_id(&event.tenant_id, "tenant_id", ValidationError::EmptyTenantId)?;
    check_optional_id(&event.site_id, "site_id", ValidationError::EmptySiteId)?;
    check_optional_id(&event.device_id, "device_id", ValidationError::EmptyDeviceId)?;
    Ok(())
}

fn check_optional_id(
    field: &Option<String>,
    name: &'static str,
    empty_err: ValidationError,
) -> Result<(), ValidationError> {
    if let Some(v) = field {
        if v.trim().is_empty() {
            return Err(empty_err);
        }
        if v.len() > MAX_ID_FIELD_LEN {
            return Err(ValidationError::IdFieldTooLong { field: name });
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn event(
        event_type: &str,
        payload: serde_json::Value,
        tenant_id: Option<&str>,
    ) -> PolyEventRequest {
        PolyEventRequest {
            event_type: event_type.into(),
            tenant_id: tenant_id.map(String::from),
            site_id: None,
            device_id: None,
            payload,
        }
    }

    #[test]
    fn valid_minimal_event_passes() {
        let e = event("device.online", json!({"device": "d1"}), None);
        assert!(validate(&e).is_ok());
    }

    #[test]
    fn valid_event_with_tenant() {
        let e = event("call.started", json!({}), Some("tenant-abc"));
        assert!(validate(&e).is_ok());
    }

    #[test]
    fn empty_event_type_is_rejected() {
        let e = event("", json!({}), None);
        assert!(matches!(validate(&e), Err(ValidationError::MissingEventType)));
    }

    #[test]
    fn whitespace_event_type_is_rejected() {
        let e = event("   ", json!({}), None);
        assert!(matches!(validate(&e), Err(ValidationError::MissingEventType)));
    }

    #[test]
    fn event_type_exceeding_max_length_is_rejected() {
        let long = "a".repeat(MAX_EVENT_TYPE_LEN + 1);
        let e = event(&long, json!({}), None);
        assert!(matches!(validate(&e), Err(ValidationError::EventTypeTooLong)));
    }

    #[test]
    fn payload_must_be_object() {
        let e = event("device.online", json!([1, 2, 3]), None);
        assert!(matches!(validate(&e), Err(ValidationError::PayloadNotObject)));
    }

    #[test]
    fn null_payload_is_rejected() {
        let e = event("device.online", serde_json::Value::Null, None);
        assert!(matches!(validate(&e), Err(ValidationError::PayloadNotObject)));
    }

    #[test]
    fn empty_tenant_id_string_is_rejected() {
        let e = event("device.online", json!({}), Some(""));
        assert!(matches!(validate(&e), Err(ValidationError::EmptyTenantId)));
    }

    #[test]
    fn whitespace_tenant_id_is_rejected() {
        let e = event("device.online", json!({}), Some("   "));
        assert!(matches!(validate(&e), Err(ValidationError::EmptyTenantId)));
    }

    #[test]
    fn tenant_id_exceeding_max_length_is_rejected() {
        let long = "t".repeat(MAX_ID_FIELD_LEN + 1);
        let e = event("device.online", json!({}), Some(&long));
        assert!(matches!(
            validate(&e),
            Err(ValidationError::IdFieldTooLong { field: "tenant_id" })
        ));
    }
}
