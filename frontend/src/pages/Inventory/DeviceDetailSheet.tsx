import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DeviceStatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { useDevice } from "@/api/useDevices";

interface Props {
  deviceId: string | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function DeviceDetailSheet({ deviceId, onClose }: Props) {
  const { data, isLoading, error } = useDevice(deviceId ?? "");

  const device = data?.device;

  return (
    <Sheet open={!!deviceId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <SheetTitle className="text-base font-semibold">
              {device?.name ?? "Device Detail"}
            </SheetTitle>
          )}
          <SheetDescription className="text-sm text-muted-foreground">
            {device ? `${device.model} · ${device.serial_number}` : "Loading device details…"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5">
            {isLoading && (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">Failed to load device details.</p>
            )}

            {device && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <DeviceStatusBadge status={device.status} />
                  <span className="text-xs text-muted-foreground">
                    Last seen {new Date(device.last_seen_at).toLocaleString()}
                  </span>
                </div>

                {/* Identity */}
                <div>
                  <SectionLabel>Identity</SectionLabel>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Field label="Model" value={device.model} />
                    <Field label="Serial Number" value={<span className="font-mono text-xs">{device.serial_number}</span>} />
                    <Field label="IP Address" value={<span className="font-mono text-xs">{device.ip_address}</span>} />
                    <Field label="MAC Address" value={<span className="font-mono text-xs">{device.mac_address}</span>} />
                    <Field
                      label="Firmware"
                      value={
                        <Badge variant="secondary" className="font-mono text-xs">
                          {device.firmware_version}
                        </Badge>
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <SectionLabel>Location</SectionLabel>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Field label="Tenant" value={device.tenant_name} />
                    <Field label="Site" value={device.site_name} />
                    <Field label="Room" value={device.room_name} />
                  </div>
                </div>

                {/* Tags */}
                {data.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <SectionLabel>Tags</SectionLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {data.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Software */}
                {data.software_versions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <SectionLabel>Software</SectionLabel>
                      <div className="space-y-2.5">
                        {data.software_versions.map((sw) => (
                          <div key={sw.software_name} className="flex items-center justify-between">
                            <span className="text-sm">{sw.software_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{sw.version}</span>
                              <Badge variant={sw.is_compliant ? "success" : "destructive"}>
                                {sw.is_compliant ? "Compliant" : "Non-compliant"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Recent alerts */}
                {data.recent_alerts.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <SectionLabel>Recent Alerts</SectionLabel>
                      <div className="space-y-2.5">
                        {data.recent_alerts.map((alert) => (
                          <div key={alert.id} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={alert.severity} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {alert.alert_type.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Last seen {new Date(alert.last_seen).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {data.recent_alerts.length === 0 && data.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No alerts or tags on record.</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
