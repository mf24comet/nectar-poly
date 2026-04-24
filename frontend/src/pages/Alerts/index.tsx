import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useAlerts, type AlertFilters } from "@/api/useAlerts";
import { mockAlerts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types/alert";

const PAGE_SIZE = 10;

function agingLabel(firstSeen: string): string {
  const ms = Date.now() - new Date(firstSeen).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d";
  return `${days}d`;
}

export function AlertsPage() {
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState("false");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filters: AlertFilters = useMemo(
    () => ({
      page,
      per_page: PAGE_SIZE,
      severity: severityFilter || undefined,
      resolved: resolvedFilter || undefined,
    }),
    [page, severityFilter, resolvedFilter],
  );

  const { data, isLoading } = useAlerts(filters);
  const alerts = data?.data ?? [];

  const statCounts = useMemo(() => {
    const base = mockAlerts.filter((a) => a.resolved_at === null);
    return {
      critical: base.filter((a) => a.severity === "critical").length,
      warning: base.filter((a) => a.severity === "warning").length,
      info: base.filter((a) => a.severity === "info").length,
      total: base.length,
    };
  }, []);

  const columns = useMemo<ColumnDef<Alert>[]>(
    () => [
      {
        id: "bar",
        header: () => null,
        cell: ({ row }) => (
          <div
            className={cn(
              "h-8 w-1 rounded-sm",
              row.original.severity === "critical" && "bg-red-500",
              row.original.severity === "warning" && "bg-amber-400",
              row.original.severity === "info" && "bg-blue-500",
            )}
          />
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm leading-tight">{row.original.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{row.original.alert_type.replace(/_/g, " ")}</p>
          </div>
        ),
      },
      {
        id: "device",
        header: "Device",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.device_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.device_model}</p>
          </div>
        ),
      },
      {
        accessorKey: "first_seen",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground uppercase tracking-wide text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Seen <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(row.original.first_seen).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "last_seen",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground uppercase tracking-wide text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Seen <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(row.original.last_seen).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "aging",
        header: "Age",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.severity === "critical"
                ? "destructive"
                : row.original.severity === "warning"
                ? "warning"
                : "secondary"
            }
          >
            {agingLabel(row.original.first_seen)}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.resolved_at ? "success" : "outline"}>
            {row.original.resolved_at ? "Resolved" : "Active"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: alerts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Alerts & Incidents</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Active alerts and incident tracking across all devices
            </p>
          </div>
          {/* Inline severity summary */}
          <div className="flex items-center gap-5 rounded-lg border bg-card px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-semibold tabular-nums">{statCounts.critical}</span>
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="font-semibold tabular-nums">{statCounts.warning}</span>
              <span className="text-muted-foreground">Warning</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-semibold tabular-nums">{statCounts.info}</span>
              <span className="text-muted-foreground">Info</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Select
            value={severityFilter || "all"}
            onValueChange={(v) => {
              setSeverityFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={resolvedFilter || "all"}
            onValueChange={(v) => {
              setResolvedFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {statCounts.total} open alerts
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={header.id === "bar" ? "w-3 px-2" : undefined}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No alerts match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.id === "bar" ? "w-3 px-2 py-0" : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-6 py-3">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
          <span className="mx-1.5 text-border">·</span>
          {data?.total ?? alerts.length} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
