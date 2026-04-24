import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Monitor, WifiOff, AlertTriangle, Bell, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/api/useAlerts";
import { useDevices } from "@/api/useDevices";
import { useSoftwareCompliance } from "@/api/useSoftware";
import { cn } from "@/lib/utils";
import {
  mockKpis, mockFleetTimeline, mockModelHealth, mockAlertSeverityDist,
} from "@/lib/mock-data";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: 12,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
};

function KpiCard({
  label,
  value,
  icon: Icon,
  iconClass,
  subtext,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconClass: string;
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            {subtext && (
              <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className={cn("mt-0.5 shrink-0 rounded-xl p-2.5", iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FleetOverviewPage() {
  const { data: deviceData, isLoading: devicesLoading } = useDevices({ per_page: 1 });
  const { data: alertData, isLoading: alertsLoading } = useAlerts({ per_page: 1 });
  const { data: softwareData, isLoading: softwareLoading } = useSoftwareCompliance();

  const kpis = mockKpis;

  const totalVersions = softwareData?.data.reduce((s, c) => s + c.device_count, 0) ?? 1;
  const baselineCount = softwareData?.data.find((v) => v.version.includes("baseline"))?.device_count ?? 5;
  const compliancePct = Math.round((baselineCount / totalVersions) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Fleet Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Live status across all managed Poly devices
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total Devices"
          value={deviceData?.total ?? kpis.totalDevices}
          icon={Monitor}
          iconClass="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Online"
          value={kpis.online}
          icon={Monitor}
          iconClass="bg-emerald-50 text-emerald-600"
          subtext={`${Math.round((kpis.online / kpis.totalDevices) * 100)}% of fleet`}
        />
        <KpiCard
          label="Offline"
          value={kpis.offline}
          icon={WifiOff}
          iconClass="bg-red-50 text-red-600"
        />
        <KpiCard
          label="Needing Action"
          value={kpis.needingAction}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Critical Alerts"
          value={alertData?.total ?? kpis.criticalAlerts}
          icon={Bell}
          iconClass="bg-red-50 text-red-600"
        />
        <KpiCard
          label="Affected Sites"
          value={kpis.affectedSites}
          icon={MapPin}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Online/Offline trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Device Fleet Health</CardTitle>
            <p className="text-xs text-muted-foreground">30-day online / offline trend</p>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart data={mockFleetTimeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="online"
                    stroke="#22c55e"
                    fill="url(#colorOnline)"
                    strokeWidth={2}
                    dot={false}
                    name="Online"
                  />
                  <Area
                    type="monotone"
                    dataKey="offline"
                    stroke="#ef4444"
                    fill="url(#colorOffline)"
                    strokeWidth={2}
                    dot={false}
                    name="Offline"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Alert severity distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Active Alert Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">By severity level</p>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={mockAlertSeverityDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {mockAlertSeverityDist.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {mockAlertSeverityDist.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model health + Software compliance row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fleet Health by Model</CardTitle>
            <p className="text-xs text-muted-foreground">Online, degraded, and offline breakdown</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={mockModelHealth}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
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
                  dataKey="model"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="online" name="Online" stackId="a" fill="#22c55e" />
                <Bar dataKey="degraded" name="Degraded" stackId="a" fill="#f59e0b" />
                <Bar dataKey="offline" name="Offline" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Software Compliance</CardTitle>
            <p className="text-xs text-muted-foreground">Devices on approved firmware baseline</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {softwareLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Baseline compliance</span>
                  <span className="font-semibold text-emerald-600">{compliancePct}%</span>
                </div>
                <div className="space-y-3.5">
                  {(softwareData?.data ?? []).map((entry) => {
                    const pct = Math.round((entry.device_count / totalVersions) * 100);
                    const isBaseline = entry.version.includes("baseline");
                    const isEol = entry.version.includes("EOL");
                    return (
                      <div key={entry.version} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium font-mono",
                            isEol ? "text-red-600" : "",
                          )}>
                            {entry.version}
                          </span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {entry.device_count} devices
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              isBaseline ? "bg-emerald-500" : isEol ? "bg-red-500" : "bg-amber-400",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
