import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeviceStatusBadge } from "@/components/StatusBadge";
import { DeviceDetailSheet } from "./DeviceDetailSheet";
import { useDevices, type DeviceFilters } from "@/api/useDevices";
import type { Device } from "@/types/device";
import { mockDevices } from "@/lib/mock-data";

const PAGE_SIZE = 10;

const uniqueSites = Array.from(new Set(mockDevices.map((d) => d.site_name))).map(
  (name) => ({ label: name, value: mockDevices.find((d) => d.site_name === name)!.site_id }),
);
const uniqueModels = Array.from(new Set(mockDevices.map((d) => d.model)));

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const filters: DeviceFilters = useMemo(
    () => ({
      page,
      per_page: PAGE_SIZE,
      status: statusFilter || undefined,
      site_id: siteFilter || undefined,
      search: search || undefined,
    }),
    [page, search, statusFilter, siteFilter],
  );

  const { data, isLoading } = useDevices(filters);

  const filtered = useMemo(() => {
    const devices = data?.data ?? [];
    if (!modelFilter) return devices;
    return devices.filter((d) => d.model === modelFilter);
  }, [data?.data, modelFilter]);

  const activeFilterCount = [statusFilter, siteFilter, modelFilter].filter(Boolean).length;

  const columns = useMemo<ColumnDef<Device>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Device Name
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "model",
        header: "Model",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.model}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <DeviceStatusBadge status={row.original.status} />,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => (
          <div className="text-sm">
            <span className="font-medium">{row.original.site_name}</span>
            {row.original.room_name && (
              <span className="text-muted-foreground"> · {row.original.room_name}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "firmware_version",
        header: "Firmware",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.firmware_version}
          </Badge>
        ),
      },
      {
        accessorKey: "last_seen_at",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Seen
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(row.original.last_seen_at).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
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
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data?.total ?? mockDevices.length} devices across all sites
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-muted/20 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices…"
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={siteFilter || "all"}
              onValueChange={(v) => {
                setSiteFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {uniqueSites.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={modelFilter || "all"}
              onValueChange={(v) => {
                setModelFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setStatusFilter("");
                  setSiteFilter("");
                  setModelFilter("");
                  setPage(1);
                }}
              >
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    No devices match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedDeviceId(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
          {data?.total ?? filtered.length} total
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

      <DeviceDetailSheet
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
      />
    </div>
  );
}
