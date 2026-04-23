pub mod validator;

use chrono::Utc;
use thiserror::Error;
use uuid::Uuid;

use crate::{
    domain::{PolyEventRequest, RawEvent},
    storage::events::{EventRepository, StorageError},
};

use validator::ValidationError;

#[derive(Debug, Error)]
pub enum IngestError {
    #[error("validation failed: {0}")]
    Validation(#[from] ValidationError),
    #[error("storage failure: {0}")]
    Storage(#[from] StorageError),
}

pub struct IngestService<'a> {
    repo: &'a EventRepository,
}

impl<'a> IngestService<'a> {
    pub fn new(repo: &'a EventRepository) -> Self {
        Self { repo }
    }

    pub async fn ingest(
        &self,
        request_id: Uuid,
        source_ip: Option<String>,
        authenticated_as: String,
        event: PolyEventRequest,
    ) -> Result<Uuid, IngestError> {
        validator::validate(&event)?;

        let raw = RawEvent {
            id: Uuid::new_v4(),
            request_id,
            received_at: Utc::now(),
            tenant_id: event.tenant_id,
            site_id: event.site_id,
            device_id: event.device_id,
            event_type: event.event_type,
            payload: event.payload,
            source_ip,
            authenticated_as,
        };

        let event_id = self.repo.insert(&raw).await?;
        Ok(event_id)
    }
}
