import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useSoftwareCompliance } from "@/api/useSoftware";
import { mockDevices, mockComplianceSummaries } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const BASELINE = "3.14.1";
const EOL_VERSIONS = ["3.11.5"];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: 12,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
};

const versionChartData = [
  { version: "3.14.1", devices: 5, fill: "#22c55e" },
  { version: "3.13.0", devices: 4, fill: "#f59e0b" },
  { version: "3.12.2", devices: 1, fill: "#f97316" },
  { version: "3.11.5", devices: 1, fill: "#ef4444" },
];

const rolloutData = [
  { step: "Staged (Group A)", target: 5, applied: 5, pct: 100 },
  { step: "Production (Group B)", target: 4, applied: 2, pct: 50 },
  { step: "Legacy Devices", target: 3, applied: 0, pct: 0 },
];

const eolWatchlist = mockDevices
  .filter((d) => EOL_VERSIONS.includes(d.firmware_version))
  .map((d) => ({
    name: d.name,
    model: d.model,
    version: d.firmware_version,
    site: d.site_name,
    eolDate: "2026-01-01",
  }));

export function SoftwarePage() {
  const { data: complianceData, isLoading } = useSoftwareCompliance();
  const summaries = complianceData?.data ?? mockComplianceSummaries;

  const totalDevices = summaries.reduce((s, v) => s + v.device_count, 0);
  const compliantCount = summaries
    .filter((v) => v.version.includes(BASELINE) || v.version.includes("baseline"))
    .reduce((s, v) => s + v.device_count, 0);
  const nonCompliantCount = totalDevices - compliantCount;
  const failedUpdates = 2;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Software & Lifecycle</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Firmware versions, compliance baseline, and update rollout status
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Approved Baseline
                </p>
                <p className="mt-2 text-2xl font-bold font-mono tracking-tight">{BASELINE}</p>
              </div>
              <div className="mt-0.5 shrink-0 rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  On Baseline
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{compliantCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((compliantCount / totalDevices) * 100)}% of fleet
                </p>
              </div>
              <div className="mt-0.5 shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Behind Baseline
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{nonCompliantCount}</p>
              </div>
              <div className="mt-0.5 shrink-0 rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Failed Updates
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{failedUpdates}</p>
              </div>
              <div className="mt-0.5 shrink-0 rounded-xl bg-red-50 p-2.5 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Version distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Version Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Devices per firmware version</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={versionChartData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="version"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v} devices`, "Count"]}
                />
                <Bar dataKey="devices" name="Devices" radius={[0, 4, 4, 0]}>
                  {versionChartData.map((entry) => (
                    <Cell key={entry.version} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rollout progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Rollout Progress — v{BASELINE}</CardTitle>
            <p className="text-xs text-muted-foreground">Update deployment by group</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {rolloutData.map((row) => (
              <div key={row.step} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {row.applied}/{row.target}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold tabular-nums",
                      row.pct === 100 ? "text-emerald-600" : row.pct === 0 ? "text-muted-foreground" : "text-blue-600",
                    )}>
                      {row.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      row.pct === 100 ? "bg-emerald-500" : row.pct === 0 ? "bg-muted-foreground/30" : "bg-blue-500",
                    )}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compliance table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Compliance by Version</CardTitle>
          <p className="text-xs text-muted-foreground">Fleet distribution across firmware versions</p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Device Count</TableHead>
                  <TableHead>Share</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((row) => {
                  const pct = Math.round((row.device_count / totalDevices) * 100);
                  const isBaseline = row.version.includes(BASELINE) || row.version.includes("baseline");
                  const isEol = row.version.includes("EOL");
                  return (
                    <TableRow key={row.version}>
                      <TableCell className="font-mono text-sm">{row.version}</TableCell>
                      <TableCell className="tabular-nums">{row.device_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                isBaseline ? "bg-emerald-500" : isEol ? "bg-red-500" : "bg-amber-400",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm tabular-nums text-muted-foreground w-8">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isBaseline ? (
                          <Badge variant="success">Baseline</Badge>
                        ) : isEol ? (
                          <Badge variant="destructive">End of Support</Badge>
                        ) : (
                          <Badge variant="warning">Behind Baseline</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* EOL watchlist */}
      {eolWatchlist.length > 0 && (
        <Card className="border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              End-of-Support Watchlist
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Devices running firmware past end-of-support date
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>EOL Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eolWatchlist.map((row) => (
                  <TableRow key={`${row.name}-${row.version}`}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.model}</TableCell>
                    <TableCell className="text-muted-foreground">{row.site}</TableCell>
                    <TableCell className="font-mono text-sm text-red-600">{row.version}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{row.eolDate}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
