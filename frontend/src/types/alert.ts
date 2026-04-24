export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  device_id: string;
  tenant_id: string;
  site_id: string;
  severity: AlertSeverity;
  alert_type: string;
  message: string;
  first_seen: string;
  last_seen: string;
  resolved_at: string | null;
  created_at: string;
  device_name: string;
  device_model: string;
}
