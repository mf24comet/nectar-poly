import type { Device, DeviceDetail } from "@/types/device";
import type { Alert } from "@/types/alert";
import type { ComplianceSummary } from "@/types/software";
import type { PaginatedResponse } from "@/types/api";

const now = new Date("2026-04-24T10:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const mockDevices: Device[] = [
  {
    id: "d1", name: "Studio X70 - HQ Boardroom", model: "Poly Studio X70",
    serial_number: "SN-X70-001", ip_address: "10.0.1.10", mac_address: "AA:BB:CC:11:22:01",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(2),
    tenant_id: "t1", site_id: "s1", room_id: "r1",
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: "Executive Boardroom",
    created_at: daysAgo(180), updated_at: minsAgo(2),
  },
  {
    id: "d2", name: "Studio X70 - HQ War Room", model: "Poly Studio X70",
    serial_number: "SN-X70-002", ip_address: "10.0.1.11", mac_address: "AA:BB:CC:11:22:02",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(5),
    tenant_id: "t1", site_id: "s1", room_id: "r2",
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: "War Room",
    created_at: daysAgo(175), updated_at: minsAgo(5),
  },
  {
    id: "d3", name: "Studio X70 - Boston Exec Suite", model: "Poly Studio X70",
    serial_number: "SN-X70-003", ip_address: "10.1.1.10", mac_address: "AA:BB:CC:11:22:03",
    firmware_version: "3.13.0", status: "degraded", last_seen_at: minsAgo(12),
    tenant_id: "t1", site_id: "s2", room_id: "r5",
    tenant_name: "Acme Corp", site_name: "Boston Office", room_name: "Executive Suite",
    created_at: daysAgo(160), updated_at: minsAgo(12),
  },
  {
    id: "d4", name: "Studio X50 - HQ Conf Room A", model: "Poly Studio X50",
    serial_number: "SN-X50-001", ip_address: "10.0.1.20", mac_address: "AA:BB:CC:22:33:01",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(1),
    tenant_id: "t1", site_id: "s1", room_id: "r3",
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: "Conference Room A",
    created_at: daysAgo(200), updated_at: minsAgo(1),
  },
  {
    id: "d5", name: "Studio X50 - HQ Conf Room B", model: "Poly Studio X50",
    serial_number: "SN-X50-002", ip_address: "10.0.1.21", mac_address: "AA:BB:CC:22:33:02",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(3),
    tenant_id: "t1", site_id: "s1", room_id: "r4",
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: "Conference Room B",
    created_at: daysAgo(200), updated_at: minsAgo(3),
  },
  {
    id: "d6", name: "Studio X50 - Chicago Main", model: "Poly Studio X50",
    serial_number: "SN-X50-003", ip_address: "10.2.1.20", mac_address: "AA:BB:CC:22:33:03",
    firmware_version: "3.12.2", status: "offline", last_seen_at: daysAgo(2),
    tenant_id: "t1", site_id: "s3", room_id: "r8",
    tenant_name: "Acme Corp", site_name: "Chicago Office", room_name: "Main Conference",
    created_at: daysAgo(150), updated_at: daysAgo(2),
  },
  {
    id: "d7", name: "Studio X30 - Boston Huddle 1", model: "Poly Studio X30",
    serial_number: "SN-X30-001", ip_address: "10.1.1.30", mac_address: "AA:BB:CC:33:44:01",
    firmware_version: "3.13.0", status: "online", last_seen_at: minsAgo(8),
    tenant_id: "t1", site_id: "s2", room_id: "r6",
    tenant_name: "Acme Corp", site_name: "Boston Office", room_name: "Huddle Room 1",
    created_at: daysAgo(120), updated_at: minsAgo(8),
  },
  {
    id: "d8", name: "Studio X30 - HQ Huddle Space", model: "Poly Studio X30",
    serial_number: "SN-X30-002", ip_address: "10.0.1.30", mac_address: "AA:BB:CC:33:44:02",
    firmware_version: "3.11.5", status: "degraded", last_seen_at: minsAgo(45),
    tenant_id: "t1", site_id: "s1", room_id: "r4",
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: "Huddle Space",
    created_at: daysAgo(300), updated_at: minsAgo(45),
  },
  {
    id: "d9", name: "Studio USB - Chicago Reception", model: "Poly Studio USB",
    serial_number: "SN-USB-001", ip_address: "10.2.1.40", mac_address: "AA:BB:CC:44:55:01",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(4),
    tenant_id: "t1", site_id: "s3", room_id: "r9",
    tenant_name: "Acme Corp", site_name: "Chicago Office", room_name: "Reception",
    created_at: daysAgo(90), updated_at: minsAgo(4),
  },
  {
    id: "d10", name: "Studio USB - Boston Reception", model: "Poly Studio USB",
    serial_number: "SN-USB-002", ip_address: "10.1.1.40", mac_address: "AA:BB:CC:44:55:02",
    firmware_version: "3.13.0", status: "offline", last_seen_at: daysAgo(1),
    tenant_id: "t1", site_id: "s2", room_id: "r7",
    tenant_name: "Acme Corp", site_name: "Boston Office", room_name: "Reception",
    created_at: daysAgo(90), updated_at: daysAgo(1),
  },
  {
    id: "d11", name: "Sync 60 - HQ Open Space", model: "Poly Sync 60",
    serial_number: "SN-S60-001", ip_address: "10.0.1.50", mac_address: "AA:BB:CC:55:66:01",
    firmware_version: "3.14.1", status: "online", last_seen_at: minsAgo(1),
    tenant_id: "t1", site_id: "s1", room_id: null,
    tenant_name: "Acme Corp", site_name: "Headquarters", room_name: null,
    created_at: daysAgo(60), updated_at: minsAgo(1),
  },
  {
    id: "d12", name: "Sync 60 - Chicago Hub", model: "Poly Sync 60",
    serial_number: "SN-S60-002", ip_address: "10.2.1.50", mac_address: "AA:BB:CC:55:66:02",
    firmware_version: "3.13.0", status: "online", last_seen_at: minsAgo(6),
    tenant_id: "t1", site_id: "s3", room_id: null,
    tenant_name: "Acme Corp", site_name: "Chicago Office", room_name: null,
    created_at: daysAgo(60), updated_at: minsAgo(6),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: "a1", device_id: "d6", tenant_id: "t1", site_id: "s3",
    severity: "critical", alert_type: "device_offline",
    message: "Device has been offline for more than 48 hours",
    first_seen: daysAgo(3), last_seen: daysAgo(0), resolved_at: null,
    created_at: daysAgo(3), device_name: "Studio X50 - Chicago Main", device_model: "Poly Studio X50",
  },
  {
    id: "a2", device_id: "d3", tenant_id: "t1", site_id: "s2",
    severity: "critical", alert_type: "call_quality_degraded",
    message: "Persistent packet loss > 5% detected on video calls",
    first_seen: daysAgo(1), last_seen: minsAgo(30), resolved_at: null,
    created_at: daysAgo(1), device_name: "Studio X70 - Boston Exec Suite", device_model: "Poly Studio X70",
  },
  {
    id: "a3", device_id: "d8", tenant_id: "t1", site_id: "s1",
    severity: "critical", alert_type: "firmware_eol",
    message: "Firmware 3.11.5 reached end-of-support on 2026-01-01",
    first_seen: daysAgo(14), last_seen: minsAgo(60), resolved_at: null,
    created_at: daysAgo(14), device_name: "Studio X30 - HQ Huddle Space", device_model: "Poly Studio X30",
  },
  {
    id: "a4", device_id: "d10", tenant_id: "t1", site_id: "s2",
    severity: "warning", alert_type: "device_offline",
    message: "Device offline for more than 24 hours",
    first_seen: daysAgo(1), last_seen: daysAgo(0), resolved_at: null,
    created_at: daysAgo(1), device_name: "Studio USB - Boston Reception", device_model: "Poly Studio USB",
  },
  {
    id: "a5", device_id: "d3", tenant_id: "t1", site_id: "s2",
    severity: "warning", alert_type: "firmware_outdated",
    message: "Firmware 3.13.0 is behind approved baseline 3.14.1",
    first_seen: daysAgo(7), last_seen: minsAgo(30), resolved_at: null,
    created_at: daysAgo(7), device_name: "Studio X70 - Boston Exec Suite", device_model: "Poly Studio X70",
  },
  {
    id: "a6", device_id: "d6", tenant_id: "t1", site_id: "s3",
    severity: "warning", alert_type: "certificate_expiring",
    message: "TLS certificate expires in 14 days",
    first_seen: daysAgo(5), last_seen: daysAgo(0), resolved_at: null,
    created_at: daysAgo(5), device_name: "Studio X50 - Chicago Main", device_model: "Poly Studio X50",
  },
  {
    id: "a7", device_id: "d8", tenant_id: "t1", site_id: "s1",
    severity: "warning", alert_type: "high_cpu",
    message: "CPU utilization above 85% for extended periods",
    first_seen: daysAgo(2), last_seen: minsAgo(45), resolved_at: null,
    created_at: daysAgo(2), device_name: "Studio X30 - HQ Huddle Space", device_model: "Poly Studio X30",
  },
  {
    id: "a8", device_id: "d7", tenant_id: "t1", site_id: "s2",
    severity: "info", alert_type: "firmware_update_available",
    message: "Firmware update 3.14.1 is available",
    first_seen: daysAgo(3), last_seen: daysAgo(0), resolved_at: null,
    created_at: daysAgo(3), device_name: "Studio X30 - Boston Huddle 1", device_model: "Poly Studio X30",
  },
  {
    id: "a9", device_id: "d12", tenant_id: "t1", site_id: "s3",
    severity: "info", alert_type: "firmware_update_available",
    message: "Firmware update 3.14.1 is available",
    first_seen: daysAgo(3), last_seen: daysAgo(0), resolved_at: null,
    created_at: daysAgo(3), device_name: "Sync 60 - Chicago Hub", device_model: "Poly Sync 60",
  },
  {
    id: "a10", device_id: "d5", tenant_id: "t1", site_id: "s1",
    severity: "warning", alert_type: "call_quality_degraded",
    message: "Elevated jitter detected during peak hours",
    first_seen: daysAgo(10), last_seen: daysAgo(9), resolved_at: daysAgo(9),
    created_at: daysAgo(10), device_name: "Studio X50 - HQ Conf Room B", device_model: "Poly Studio X50",
  },
];

export const mockComplianceSummaries: ComplianceSummary[] = [
  { version: "3.14.1 (baseline)", device_count: 5 },
  { version: "3.13.0", device_count: 4 },
  { version: "3.12.2", device_count: 1 },
  { version: "3.11.5 (EOL)", device_count: 1 },
];

export const mockDeviceDetails: Record<string, DeviceDetail> = {
  d3: {
    device: mockDevices[2],
    tags: ["video-conf", "executive", "priority"],
    recent_alerts: [
      {
        id: "a2", severity: "critical", alert_type: "call_quality_degraded",
        message: "Persistent packet loss > 5% detected on video calls",
        first_seen: daysAgo(1), last_seen: minsAgo(30),
      },
      {
        id: "a5", severity: "warning", alert_type: "firmware_outdated",
        message: "Firmware 3.13.0 is behind approved baseline 3.14.1",
        first_seen: daysAgo(7), last_seen: minsAgo(30),
      },
    ],
    software_versions: [
      { software_name: "Poly OS", version: "3.13.0", is_compliant: false },
      { software_name: "Teams App", version: "1449.22", is_compliant: true },
    ],
  },
};

export const mockFleetTimeline = Array.from({ length: 30 }, (_, i) => {
  const date = new Date("2026-03-25T00:00:00Z");
  date.setDate(date.getDate() + i);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const online = 8 + Math.round(Math.sin(i * 0.35) * 2);
  const offline = Math.max(1, 4 - Math.round(Math.cos(i * 0.4)));
  return { date: label, online, offline };
});

export const mockModelHealth = [
  { model: "Poly Studio X70", online: 2, degraded: 1, offline: 0 },
  { model: "Poly Studio X50", online: 2, degraded: 0, offline: 1 },
  { model: "Poly Studio X30", online: 1, degraded: 1, offline: 0 },
  { model: "Poly Studio USB", online: 1, degraded: 0, offline: 1 },
  { model: "Poly Sync 60", online: 2, degraded: 0, offline: 0 },
];

export const mockAlertSeverityDist = [
  { name: "Critical", value: 3, color: "#ef4444" },
  { name: "Warning", value: 4, color: "#f59e0b" },
  { name: "Info", value: 2, color: "#3b82f6" },
];

export const mockKpis = {
  totalDevices: 12,
  online: 8,
  offline: 2,
  degraded: 2,
  needingAction: 5,
  outdatedSoftware: 4,
  criticalAlerts: 3,
  affectedSites: 2,
};

export function mockDeviceListResponse(
  page = 1,
  perPage = 25,
): PaginatedResponse<Device> {
  const start = (page - 1) * perPage;
  return {
    data: mockDevices.slice(start, start + perPage),
    total: mockDevices.length,
    page,
    per_page: perPage,
  };
}

export function mockAlertListResponse(
  page = 1,
  perPage = 25,
  severity?: string,
  resolved?: string,
): PaginatedResponse<Alert> {
  let filtered = mockAlerts;
  if (severity) filtered = filtered.filter((a) => a.severity === severity);
  if (resolved === "true") filtered = filtered.filter((a) => a.resolved_at !== null);
  if (resolved === "false") filtered = filtered.filter((a) => a.resolved_at === null);
  const start = (page - 1) * perPage;
  return {
    data: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    per_page: perPage,
  };
}
