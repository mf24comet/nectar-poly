-- Raw events from Poly Lens integrations (append-only)
CREATE TABLE IF NOT EXISTS events (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id       UUID        NOT NULL,
    received_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id        TEXT,
    site_id          TEXT,
    device_id        TEXT,
    event_type       TEXT        NOT NULL,
    payload          JSONB       NOT NULL,
    source_ip        TEXT,
    authenticated_as TEXT        NOT NULL
);

CREATE INDEX IF NOT EXISTS events_tenant_id_idx   ON events (tenant_id);
CREATE INDEX IF NOT EXISTS events_site_id_idx     ON events (site_id);
CREATE INDEX IF NOT EXISTS events_device_id_idx   ON events (device_id);
CREATE INDEX IF NOT EXISTS events_event_type_idx  ON events (event_type);
CREATE INDEX IF NOT EXISTS events_received_at_idx ON events (received_at DESC);

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sites
CREATE TABLE IF NOT EXISTS sites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sites_tenant_id_idx ON sites (tenant_id);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id    UUID NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rooms_site_id_idx ON rooms (site_id);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID        REFERENCES tenants (id),
    site_id          UUID        REFERENCES sites (id),
    room_id          UUID        REFERENCES rooms (id),
    name             TEXT        NOT NULL,
    model            TEXT,
    serial_number    TEXT,
    ip_address       TEXT,
    mac_address      TEXT,
    firmware_version TEXT,
    status           TEXT        NOT NULL DEFAULT 'unknown',
    last_seen_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS devices_tenant_id_idx ON devices (tenant_id);
CREATE INDEX IF NOT EXISTS devices_site_id_idx   ON devices (site_id);
CREATE INDEX IF NOT EXISTS devices_status_idx    ON devices (status);
CREATE INDEX IF NOT EXISTS devices_model_idx     ON devices (model);

-- Device tags
CREATE TABLE IF NOT EXISTS device_tags (
    device_id UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    tag       TEXT NOT NULL,
    PRIMARY KEY (device_id, tag)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id    UUID        REFERENCES devices (id),
    tenant_id    UUID        REFERENCES tenants (id),
    site_id      UUID        REFERENCES sites (id),
    severity     TEXT        NOT NULL,
    alert_type   TEXT        NOT NULL,
    message      TEXT        NOT NULL,
    first_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alerts_device_id_idx   ON alerts (device_id);
CREATE INDEX IF NOT EXISTS alerts_tenant_id_idx   ON alerts (tenant_id);
CREATE INDEX IF NOT EXISTS alerts_severity_idx    ON alerts (severity);
CREATE INDEX IF NOT EXISTS alerts_resolved_at_idx ON alerts (resolved_at);

-- Software versions
CREATE TABLE IF NOT EXISTS software_versions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id  UUID        NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    version    TEXT        NOT NULL,
    is_current BOOLEAN     NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS software_versions_device_id_idx ON software_versions (device_id);

-- Utilisation records
CREATE TABLE IF NOT EXISTS utilization_records (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id    UUID        NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_sec INTEGER     NOT NULL,
    activity     TEXT        NOT NULL
);

CREATE INDEX IF NOT EXISTS utilization_device_id_idx  ON utilization_records (device_id);
CREATE INDEX IF NOT EXISTS utilization_recorded_at_idx ON utilization_records (recorded_at DESC);

-- Audit records
CREATE TABLE IF NOT EXISTS audit_records (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id   UUID        NOT NULL,
    performed_by TEXT        NOT NULL,
    action       TEXT        NOT NULL,
    target_type  TEXT,
    target_id    UUID,
    detail       JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_records_request_id_idx ON audit_records (request_id);
CREATE INDEX IF NOT EXISTS audit_records_created_at_idx ON audit_records (created_at DESC);
