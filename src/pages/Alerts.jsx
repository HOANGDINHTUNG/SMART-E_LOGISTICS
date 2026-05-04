import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AlertBadge from "../components/AlertBadge";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unresolved");

  useEffect(() => {
    base44.entities.Alert.list("-created_date", 100).then((data) => {
      setAlerts(data);
      setLoading(false);
    });
    const unsub = base44.entities.Alert.subscribe((event) => {
      if (event.type === "create") setAlerts((prev) => {
        const exists = prev.some((a) => a.id === event.data?.id);
        return exists ? prev : [event.data, ...prev];
      });
      if (event.type === "update")
        setAlerts((prev) =>
          prev.map((a) => (a.id === event.data?.id ? event.data : a)),
        );
    });
    return () => unsub();
  }, []);

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.is_resolved;
    if (filter === "critical")
      return (
        !a.is_resolved && (a.severity === "Cao" || a.severity === "Khẩn cấp")
      );
    return true;
  });

  const resolve = async (id) => {
    await base44.entities.Alert.update(id, {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
    });
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a)),
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  const unresolved = alerts.filter((a) => !a.is_resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cảnh báo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unresolved > 0 ? (
              <span className="text-red-400">
                {unresolved} cảnh báo chưa xử lý
              </span>
            ) : (
              <span className="text-primary">Tất cả đã được xử lý</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "unresolved", label: "Chưa xử lý" },
          { key: "critical", label: "Khẩn cấp" },
          { key: "all", label: "Tất cả" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
              filter === tab.key
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle className="w-12 h-12 text-primary/30 mb-4" />
          <p className="text-muted-foreground">Không có cảnh báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "bg-card border rounded-xl p-4 flex items-start gap-4 transition-all",
                alert.is_resolved
                  ? "border-border opacity-60"
                  : "border-border hover:border-primary/20",
              )}
            >
              <Bell
                className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  alert.is_resolved
                    ? "text-muted-foreground"
                    : "text-amber-400",
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {alert.alert_type}
                  </span>
                  <AlertBadge severity={alert.severity} />
                  {alert.is_resolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                      <CheckCircle className="w-3 h-3" /> Đã xử lý
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground/60">
                  <span>
                    Box: <span className="font-mono">{alert.smartbox_id}</span>
                  </span>
                  {alert.value !== undefined && (
                    <span>
                      Giá trị:{" "}
                      <span className="font-mono text-foreground">
                        {alert.value}
                      </span>{" "}
                      / Ngưỡng: {alert.threshold}
                    </span>
                  )}
                  <span>
                    {format(new Date(alert.created_date), "HH:mm dd/MM/yyyy")}
                  </span>
                </div>
              </div>
              {!alert.is_resolved && (
                <Button
                  onClick={() => resolve(alert.id)}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  Xử lý
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
