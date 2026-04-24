export type DeviceStatus = "online" | "offline" | "degraded";

export interface Device {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  ip_address: string;
  mac_address: string;
  firmware_version: string;
  status: DeviceStatus;
  last_seen_at: string;
  tenant_id: string;
  site_id: string;
  room_id: string | null;
  tenant_name: string;
  site_name: string;
  room_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertSummary {
  id: string;
  severity: "critical" | "warning" | "info";
  alert_type: string;
  message: string;
  first_seen: string;
  last_seen: string;
}

export interface DeviceSoftwareVersion {
  software_name: string;
  version: string;
  is_compliant: boolean;
}

export interface DeviceDetail {
  device: Device;
  tags: string[];
  recent_alerts: AlertSummary[];
  software_versions: DeviceSoftwareVersion[];
}
