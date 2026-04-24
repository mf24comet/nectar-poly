import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/types/device";
import type { AlertSeverity } from "@/types/alert";

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const map: Record<DeviceStatus, { variant: "success" | "destructive" | "warning"; label: string; dot: string }> = {
    online: { variant: "success", label: "Online", dot: "bg-emerald-500" },
    offline: { variant: "destructive", label: "Offline", dot: "bg-red-500" },
    degraded: { variant: "warning", label: "Degraded", dot: "bg-amber-500" },
  };
  const { variant, label, dot } = map[status] ?? { variant: "outline" as const, label: status, dot: "bg-slate-400" };
  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      {label}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map: Record<AlertSeverity, { variant: "destructive" | "warning" | "info"; label: string; dot: string }> = {
    critical: { variant: "destructive", label: "Critical", dot: "bg-red-500" },
    warning: { variant: "warning", label: "Warning", dot: "bg-amber-500" },
    info: { variant: "info", label: "Info", dot: "bg-blue-500" },
  };
  const { variant, label, dot } = map[severity] ?? { variant: "info" as const, label: severity, dot: "bg-blue-400" };
  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      {label}
    </Badge>
  );
}
