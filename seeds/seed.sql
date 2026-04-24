-- nectar-poly seed data
-- Run with: psql $DATABASE_URL -f seeds/seed.sql
-- Or: cargo run --bin seed
--
-- Idempotent: all inserts use ON CONFLICT (id) DO NOTHING.
-- Re-running is safe.

BEGIN;

-- ─── Tenant ────────────────────────────────────────────────────────────────

INSERT INTO tenants (id, name, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Nectar Corporation', now() - interval '180 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Sites ─────────────────────────────────────────────────────────────────

INSERT INTO sites (id, tenant_id, name, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'New York HQ',          now() - interval '180 days'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'San Francisco Office', now() - interval '150 days'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'London Office',        now() - interval '120 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Rooms ─────────────────────────────────────────────────────────────────

INSERT INTO rooms (id, site_id, name, created_at) VALUES
  -- New York HQ
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Main Conference',    now() - interval '180 days'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Executive Suite',    now() - interval '180 days'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Innovation Lab',     now() - interval '180 days'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Training Room',      now() - interval '180 days'),
  -- San Francisco Office
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Sunset Conference',  now() - interval '150 days'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Bay View Room',      now() - interval '150 days'),
  -- London Office
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'Thames Room',        now() - interval '120 days'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Westminster Suite',  now() - interval '120 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Devices ───────────────────────────────────────────────────────────────
-- 22 devices: 10 in New York HQ, 7 in San Francisco, 5 in London
-- Firmware baseline: 4.1.2  |  4.1.1 = slightly behind  |  4.0.8 = one minor behind  |  3.9.4 = outdated
-- Statuses: online(14)  warning(4)  offline(2)  error(2)

-- New York HQ ───────────────────────────────────────────────────────────────

INSERT INTO devices (
  id, tenant_id, site_id, room_id,
  name, model, serial_number, ip_address, mac_address,
  firmware_version, status, last_seen_at, created_at, updated_at
) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'NYC-CONF-X70-01', 'Poly Studio X70', 'SN-HQ-00001', '10.10.1.101', 'AA:BB:CC:DD:01:01',
   '4.1.2', 'online', now() - interval '2 minutes', now() - interval '180 days', now() - interval '2 minutes'),

  ('d0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
   'NYC-EXEC-X50-01', 'Poly Studio X50', 'SN-HQ-00002', '10.10.1.102', 'AA:BB:CC:DD:01:02',
   '4.1.1', 'online', now() - interval '5 minutes', now() - interval '175 days', now() - interval '5 minutes'),

  ('d0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003',
   'NYC-LAB-G7500-01', 'Poly G7500', 'SN-HQ-00003', '10.10.1.103', 'AA:BB:CC:DD:01:03',
   '3.9.4', 'warning', now() - interval '8 hours', now() - interval '170 days', now() - interval '8 hours'),

  ('d0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
   'NYC-TRAIN-TRIO-01', 'Poly Trio C60', 'SN-HQ-00004', '10.10.1.104', 'AA:BB:CC:DD:01:04',
   '4.0.8', 'online', now() - interval '10 minutes', now() - interval '165 days', now() - interval '10 minutes'),

  ('d0000000-0000-0000-0000-000000000005',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'NYC-CONF-X50-02', 'Poly Studio X50', 'SN-HQ-00005', '10.10.1.105', 'AA:BB:CC:DD:01:05',
   '4.1.2', 'online', now() - interval '1 minute', now() - interval '160 days', now() - interval '1 minute'),

  ('d0000000-0000-0000-0000-000000000006',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
   'NYC-EXEC-SYNC-01', 'Poly Sync 40', 'SN-HQ-00006', '10.10.1.106', 'AA:BB:CC:DD:01:06',
   '4.1.2', 'online', now() - interval '3 minutes', now() - interval '155 days', now() - interval '3 minutes'),

  ('d0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003',
   'NYC-LAB-EDGE-01', 'Poly Edge E550', 'SN-HQ-00007', '10.10.1.107', 'AA:BB:CC:DD:01:07',
   '4.0.8', 'error', now() - interval '2 days', now() - interval '150 days', now() - interval '2 days'),

  ('d0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
   'NYC-TRAIN-X70-02', 'Poly Studio X70', 'SN-HQ-00008', '10.10.1.108', 'AA:BB:CC:DD:01:08',
   '3.9.4', 'offline', now() - interval '3 days', now() - interval '145 days', now() - interval '3 days'),

  ('d0000000-0000-0000-0000-000000000009',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'NYC-CONF-TRIO-02', 'Poly Trio C60', 'SN-HQ-00009', '10.10.1.109', 'AA:BB:CC:DD:01:09',
   '4.1.2', 'online', now() - interval '7 minutes', now() - interval '140 days', now() - interval '7 minutes'),

  ('d0000000-0000-0000-0000-000000000010',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
   'NYC-TRAIN-SYNC-02', 'Poly Sync 40', 'SN-HQ-00010', '10.10.1.110', 'AA:BB:CC:DD:01:0A',
   '4.0.8', 'warning', now() - interval '6 hours', now() - interval '135 days', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- San Francisco Office ──────────────────────────────────────────────────────

INSERT INTO devices (
  id, tenant_id, site_id, room_id,
  name, model, serial_number, ip_address, mac_address,
  firmware_version, status, last_seen_at, created_at, updated_at
) VALUES
  ('d0000000-0000-0000-0000-000000000011',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
   'SFO-SUNSET-X70-01', 'Poly Studio X70', 'SN-SF-00001', '10.10.2.101', 'AA:BB:CC:DD:02:01',
   '4.1.2', 'online', now() - interval '4 minutes', now() - interval '150 days', now() - interval '4 minutes'),

  ('d0000000-0000-0000-0000-000000000012',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
   'SFO-SUNSET-TRIO-01', 'Poly Trio C60', 'SN-SF-00002', '10.10.2.102', 'AA:BB:CC:DD:02:02',
   '4.1.2', 'online', now() - interval '6 minutes', now() - interval '145 days', now() - interval '6 minutes'),

  ('d0000000-0000-0000-0000-000000000013',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
   'SFO-BAY-X50-01', 'Poly Studio X50', 'SN-SF-00003', '10.10.2.103', 'AA:BB:CC:DD:02:03',
   '4.0.8', 'online', now() - interval '9 minutes', now() - interval '140 days', now() - interval '9 minutes'),

  ('d0000000-0000-0000-0000-000000000014',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
   'SFO-BAY-EDGE-01', 'Poly Edge E550', 'SN-SF-00004', '10.10.2.104', 'AA:BB:CC:DD:02:04',
   '3.9.4', 'warning', now() - interval '4 hours', now() - interval '135 days', now() - interval '4 hours'),

  ('d0000000-0000-0000-0000-000000000015',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
   'SFO-SUNSET-G7500-01', 'Poly G7500', 'SN-SF-00005', '10.10.2.105', 'AA:BB:CC:DD:02:05',
   '4.1.1', 'online', now() - interval '2 minutes', now() - interval '130 days', now() - interval '2 minutes'),

  ('d0000000-0000-0000-0000-000000000016',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006',
   'SFO-BAY-SYNC-01', 'Poly Sync 40', 'SN-SF-00006', '10.10.2.106', 'AA:BB:CC:DD:02:06',
   '4.1.2', 'online', now() - interval '1 minute', now() - interval '125 days', now() - interval '1 minute'),

  ('d0000000-0000-0000-0000-000000000017',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005',
   'SFO-SUNSET-X50-02', 'Poly Studio X50', 'SN-SF-00007', '10.10.2.107', 'AA:BB:CC:DD:02:07',
   '3.9.4', 'offline', now() - interval '5 days', now() - interval '120 days', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- London Office ─────────────────────────────────────────────────────────────

INSERT INTO devices (
  id, tenant_id, site_id, room_id,
  name, model, serial_number, ip_address, mac_address,
  firmware_version, status, last_seen_at, created_at, updated_at
) VALUES
  ('d0000000-0000-0000-0000-000000000018',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007',
   'LON-THAMES-X70-01', 'Poly Studio X70', 'SN-LON-00001', '10.10.3.101', 'AA:BB:CC:DD:03:01',
   '4.1.2', 'online', now() - interval '3 minutes', now() - interval '120 days', now() - interval '3 minutes'),

  ('d0000000-0000-0000-0000-000000000019',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007',
   'LON-THAMES-TRIO-01', 'Poly Trio C60', 'SN-LON-00002', '10.10.3.102', 'AA:BB:CC:DD:03:02',
   '4.0.8', 'online', now() - interval '8 minutes', now() - interval '115 days', now() - interval '8 minutes'),

  ('d0000000-0000-0000-0000-000000000020',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
   'LON-WEST-X50-01', 'Poly Studio X50', 'SN-LON-00003', '10.10.3.103', 'AA:BB:CC:DD:03:03',
   '4.1.2', 'online', now() - interval '5 minutes', now() - interval '110 days', now() - interval '5 minutes'),

  ('d0000000-0000-0000-0000-000000000021',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000008',
   'LON-WEST-G7500-01', 'Poly G7500', 'SN-LON-00004', '10.10.3.104', 'AA:BB:CC:DD:03:04',
   '3.9.4', 'warning', now() - interval '1 hour', now() - interval '105 days', now() - interval '1 hour'),

  ('d0000000-0000-0000-0000-000000000022',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007',
   'LON-THAMES-EDGE-01', 'Poly Edge E550', 'SN-LON-00005', '10.10.3.105', 'AA:BB:CC:DD:03:05',
   '4.1.1', 'online', now() - interval '12 minutes', now() - interval '100 days', now() - interval '12 minutes')
ON CONFLICT (id) DO NOTHING;

-- ─── Device tags ───────────────────────────────────────────────────────────

INSERT INTO device_tags (device_id, tag) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000001', 'managed'),
  ('d0000000-0000-0000-0000-000000000002', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000002', 'executive'),
  ('d0000000-0000-0000-0000-000000000003', 'legacy'),
  ('d0000000-0000-0000-0000-000000000003', 'needs-update'),
  ('d0000000-0000-0000-0000-000000000004', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000005', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000006', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000006', 'executive'),
  ('d0000000-0000-0000-0000-000000000007', 'needs-attention'),
  ('d0000000-0000-0000-0000-000000000008', 'legacy'),
  ('d0000000-0000-0000-0000-000000000008', 'needs-update'),
  ('d0000000-0000-0000-0000-000000000009', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000010', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000011', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000012', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000014', 'legacy'),
  ('d0000000-0000-0000-0000-000000000014', 'needs-update'),
  ('d0000000-0000-0000-0000-000000000017', 'needs-attention'),
  ('d0000000-0000-0000-0000-000000000018', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000019', 'audio-conferencing'),
  ('d0000000-0000-0000-0000-000000000020', 'video-conferencing'),
  ('d0000000-0000-0000-0000-000000000021', 'legacy'),
  ('d0000000-0000-0000-0000-000000000021', 'needs-update')
ON CONFLICT (device_id, tag) DO NOTHING;

-- ─── Alerts (12: 2 critical, 3 high, 4 medium, 3 low) ─────────────────────

INSERT INTO alerts (
  id, device_id, tenant_id, site_id,
  severity, alert_type, message,
  first_seen, last_seen, resolved_at, created_at
) VALUES
  -- CRITICAL
  ('e0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'critical', 'hardware_fault',
   'NYC-LAB-EDGE-01: Camera module failure detected — device not usable for video calls',
   now() - interval '2 days', now() - interval '30 minutes', NULL,
   now() - interval '2 days'),

  ('e0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000008',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'critical', 'connectivity_lost',
   'NYC-TRAIN-X70-02: Device unreachable for 3+ days — possible hardware or network failure',
   now() - interval '3 days', now() - interval '1 hour', NULL,
   now() - interval '3 days'),

  -- HIGH
  ('e0000000-0000-0000-0000-000000000003',
   'd0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'high', 'firmware_outdated',
   'NYC-LAB-G7500-01: Firmware 3.9.4 is 2 major versions behind approved baseline 4.1.2 — known security patches missing',
   now() - interval '14 days', now() - interval '8 hours', NULL,
   now() - interval '14 days'),

  ('e0000000-0000-0000-0000-000000000004',
   'd0000000-0000-0000-0000-000000000017',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'high', 'connectivity_lost',
   'SFO-SUNSET-X50-02: No heartbeat received in 5 days — device may be powered off or network isolated',
   now() - interval '5 days', now() - interval '2 hours', NULL,
   now() - interval '5 days'),

  ('e0000000-0000-0000-0000-000000000005',
   'd0000000-0000-0000-0000-000000000021',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
   'high', 'firmware_outdated',
   'LON-WEST-G7500-01: Firmware 3.9.4 is critically outdated — upgrade required before next compliance review',
   now() - interval '21 days', now() - interval '1 hour', NULL,
   now() - interval '21 days'),

  -- MEDIUM
  ('e0000000-0000-0000-0000-000000000006',
   'd0000000-0000-0000-0000-000000000010',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'medium', 'network_degraded',
   'NYC-TRAIN-SYNC-02: Packet loss above 8% on primary network interface — audio quality impacted',
   now() - interval '6 hours', now() - interval '6 hours', NULL,
   now() - interval '6 hours'),

  ('e0000000-0000-0000-0000-000000000007',
   'd0000000-0000-0000-0000-000000000014',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'medium', 'firmware_outdated',
   'SFO-BAY-EDGE-01: Firmware 3.9.4 is below the approved baseline — schedule update at next maintenance window',
   now() - interval '10 days', now() - interval '4 hours', NULL,
   now() - interval '10 days'),

  ('e0000000-0000-0000-0000-000000000008',
   'd0000000-0000-0000-0000-000000000007',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'medium', 'software_error',
   'NYC-LAB-EDGE-01: SIP registration failure — device cannot join meetings until resolved',
   now() - interval '2 days', now() - interval '45 minutes', NULL,
   now() - interval '2 days'),

  ('e0000000-0000-0000-0000-000000000009',
   'd0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'medium', 'certificate_expiry',
   'NYC-LAB-G7500-01: TLS certificate expires in 12 days — renew before automatic meeting failures begin',
   now() - interval '3 days', now() - interval '8 hours', NULL,
   now() - interval '3 days'),

  -- LOW
  ('e0000000-0000-0000-0000-000000000010',
   'd0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'low', 'firmware_outdated',
   'NYC-EXEC-X50-01: Firmware 4.1.1 is one patch behind baseline 4.1.2 — low priority update available',
   now() - interval '7 days', now() - interval '5 minutes', NULL,
   now() - interval '7 days'),

  ('e0000000-0000-0000-0000-000000000011',
   'd0000000-0000-0000-0000-000000000022',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
   'low', 'firmware_outdated',
   'LON-THAMES-EDGE-01: Firmware 4.1.1 is one patch behind baseline 4.1.2 — schedule at next maintenance window',
   now() - interval '7 days', now() - interval '12 minutes', NULL,
   now() - interval '7 days'),

  -- resolved example
  ('e0000000-0000-0000-0000-000000000012',
   'd0000000-0000-0000-0000-000000000013',
   'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'low', 'network_degraded',
   'SFO-BAY-X50-01: Elevated latency to TURN server resolved after switch port reset',
   now() - interval '4 days', now() - interval '3 days 20 hours', now() - interval '3 days 18 hours',
   now() - interval '4 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Software versions ─────────────────────────────────────────────────────
-- One current record per device; a few devices also have a prior version row.

INSERT INTO software_versions (id, device_id, version, is_current, updated_at) VALUES
  -- current versions
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', '4.1.1', true,  now() - interval '45 days'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', '3.9.4', true,  now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', '4.0.8', true,  now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', '4.0.8', true,  now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', '3.9.4', true,  now() - interval '120 days'),
  ('f0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000009', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', '4.0.8', true,  now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000013', '4.0.8', true,  now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014', '3.9.4', true,  now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', '4.1.1', true,  now() - interval '45 days'),
  ('f0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', '3.9.4', true,  now() - interval '120 days'),
  ('f0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000018', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000019', '4.0.8', true,  now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', '4.1.2', true,  now() - interval '30 days'),
  ('f0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000021', '3.9.4', true,  now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000022', '4.1.1', true,  now() - interval '45 days'),

  -- historical versions (prior to current, is_current = false)
  ('f0000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000001', '4.0.8', false, now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000005', '4.0.8', false, now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000103', 'd0000000-0000-0000-0000-000000000009', '4.1.1', false, now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000104', 'd0000000-0000-0000-0000-000000000011', '4.1.1', false, now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000105', 'd0000000-0000-0000-0000-000000000018', '4.0.8', false, now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000106', 'd0000000-0000-0000-0000-000000000020', '4.1.1', false, now() - interval '60 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Utilization records ───────────────────────────────────────────────────
-- ~30 records across the past 30 days for a representative sample of devices.

INSERT INTO utilization_records (id, device_id, recorded_at, duration_sec, activity) VALUES
  -- NYC Main Conference (d01, d05, d09) — heavy use
  ('99000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', now() - interval '1 day 9 hours',  3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', now() - interval '1 day 14 hours', 5400, 'meeting'),
  ('99000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', now() - interval '2 days 10 hours',2700, 'call'),
  ('99000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000009', now() - interval '3 days 13 hours',1800, 'meeting'),
  ('99000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', now() - interval '5 days 9 hours',  7200, 'meeting'),
  ('99000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', now() - interval '5 days 14 hours', 3600, 'call'),
  -- NYC Executive Suite (d02, d06) — moderate use
  ('99000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', now() - interval '1 day 11 hours', 3600, 'call'),
  ('99000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000006', now() - interval '4 days 10 hours', 1800, 'call'),
  ('99000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002', now() - interval '7 days 9 hours', 5400, 'meeting'),
  -- NYC Training Room (d04, d10) — sporadic use
  ('99000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', now() - interval '6 days 10 hours', 10800, 'meeting'),
  ('99000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000004', now() - interval '13 days 10 hours',10800, 'meeting'),
  -- SFO Sunset Conference (d11, d12, d15) — heavy use
  ('99000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000011', now() - interval '1 day 8 hours',  3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000011', now() - interval '1 day 13 hours', 7200, 'meeting'),
  ('99000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000012', now() - interval '2 days 9 hours',  1800, 'call'),
  ('99000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', now() - interval '3 days 10 hours', 5400, 'meeting'),
  ('99000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000011', now() - interval '4 days 14 hours', 3600, 'call'),
  -- SFO Bay View (d13, d16) — moderate use
  ('99000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000013', now() - interval '2 days 11 hours', 2700, 'call'),
  ('99000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000016', now() - interval '5 days 9 hours',  3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000013', now() - interval '8 days 10 hours', 1800, 'call'),
  -- LON Thames Room (d18, d19) — moderate use (different timezone offset built in)
  ('99000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000018', now() - interval '1 day 8 hours',  5400, 'meeting'),
  ('99000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000019', now() - interval '1 day 13 hours', 1800, 'call'),
  ('99000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000018', now() - interval '3 days 9 hours',  3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000018', now() - interval '6 days 10 hours', 7200, 'meeting'),
  -- LON Westminster Suite (d20, d22) — light use
  ('99000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000020', now() - interval '2 days 14 hours', 1800, 'call'),
  ('99000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000022', now() - interval '4 days 9 hours',  3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000020', now() - interval '9 days 10 hours', 2700, 'call'),
  -- Older records for trending
  ('99000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000001', now() - interval '14 days 9 hours', 5400, 'meeting'),
  ('99000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000011', now() - interval '14 days 8 hours', 3600, 'meeting'),
  ('99000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000018', now() - interval '14 days 9 hours', 7200, 'meeting'),
  ('99000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000004', now() - interval '20 days 10 hours',10800, 'meeting')
ON CONFLICT (id) DO NOTHING;

COMMIT;
