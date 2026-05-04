import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Box,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Menu,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import LiveControlButton from "@/components/LiveControlButton";
import { toast } from "@/components/ui/use-toast";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Đơn hàng", icon: Package },
  { path: "/smartboxes", label: "SmartBox", icon: Box },
  { path: "/alerts", label: "Cảnh báo", icon: Bell },
  { path: "/system", label: "Hệ thống", icon: Activity },
  { path: "/home", label: "Trang chủ", icon: Home }
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // demo notifications: show rich toasts for orders, smartboxes, and alerts
  useEffect(() => {
    const timers = [];
    const onDemoCreate = (e) => {
      const evt = e?.detail;
      if (!evt) return;
      try {
        // Alert notifications - prominent, longer auto-dismiss window
        if (evt.type === "alert") {
          const severity = evt.severity || evt.level || "Cao";
          const msg = evt.message || "Có cảnh báo từ hệ thống";
          const h = toast({
            title: `⚠️ Cảnh báo ${severity}`,
            description: msg,
            variant: "alert",
          });
          // alerts auto-dismiss after 5 seconds (longer than orders)
          if (h && typeof h.dismiss === "function") timers.push(setTimeout(() => h.dismiss(), 5000));
        }

        // Order creation notifications
        if (evt.type === "order" && (evt.status === "created" || (evt.data && evt.data.status === "Chờ xử lý"))) {
          const h = toast({
            title: `📦 Đơn mới ${evt.data?.order_code || evt.orderId}`,
            description: "Đã tạo đơn hàng",
            variant: "success",
          });
          if (h && typeof h.dismiss === "function") timers.push(setTimeout(() => h.dismiss(), 3000));
        }

        // SmartBox creation notifications
        if (evt.type === "smartbox" && (evt.action === "create" || (evt.data && evt.data.box_name))) {
          const h = toast({
            title: `📱 SmartBox mới ${evt.data?.box_name || evt.data?.box_id || ''}`,
            description: "Thiết bị đã được thêm",
            variant: "success",
          });
          if (h && typeof h.dismiss === "function") timers.push(setTimeout(() => h.dismiss(), 3000));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("demo:event", onDemoCreate);
    return () => {
      window.removeEventListener("demo:event", onDemoCreate);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-full flex flex-col bg-sidebar border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-border",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Box className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold text-foreground">
                SmartBox
              </div>
              <div className="text-xs text-muted-foreground">E-Logistics</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                location.pathname === path
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Status */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">
                MQTT Connected
              </span>
            </div>
          </div>
        )}

        {/* Collapse btn */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              SmartBox E-Logistics v1.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Live</span>
            </div>
            <LiveControlButton />
            <div className="w-px h-4 bg-border" />
            <div className="text-xs text-muted-foreground font-mono">
              {currentTime.toLocaleTimeString("vi-VN")}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
