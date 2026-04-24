import { NavLink } from "react-router-dom";
import { LayoutDashboard, Monitor, Bell, Package, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Fleet Overview", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Monitor, end: false },
  { to: "/alerts", label: "Alerts & Incidents", icon: Bell, end: false },
  { to: "/software", label: "Software & Lifecycle", icon: Package, end: false },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      {/* Brand */}
      <div className="flex h-14 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
          <Radio className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">Poly Lens</p>
          <p className="text-[10px] leading-tight text-slate-500">Device Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-2 mt-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — workspace context */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">Acme Corp</p>
            <p className="truncate text-[11px] text-slate-500">All Sites</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
