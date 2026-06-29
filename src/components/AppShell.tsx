import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  HandCoins,
  Truck,
  BarChart3,
  Brain,
  Map as MapIcon,
  Bell,
  Users,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { USING_MOCKS } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; roles?: string[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/donations", label: "Donations", icon: HandCoins },
  { to: "/distribution", label: "Distribution", icon: Truck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/prediction", label: "Prediction", icon: Brain },
  { to: "/map", label: "Map Tracking", icon: MapIcon },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/users", label: "Users", icon: Users, roles: ["admin"] },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="font-semibold leading-tight">ResourceTwin</div>
            <div className="text-xs text-muted-foreground">Digital twin · NGO ops</div>
          </div>
        </div>
        <nav className="px-2 py-3 space-y-0.5 flex-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="size-8 rounded-full bg-primary/15 text-primary grid place-items-center font-medium">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleLogout} aria-label="Logout">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6">
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            {USING_MOCKS && (
              <span className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Mock data · set VITE_API_BASE_URL
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
