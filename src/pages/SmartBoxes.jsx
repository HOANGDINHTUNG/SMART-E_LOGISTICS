import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Box,
  Plus,
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SmartBoxFormDialog from "../components/SmartBoxFormDialog";

const statusConfig = {
  "Sẵn sàng": {
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    dot: "bg-green-400",
  },
  "Đang vận chuyển": {
    color: "text-primary bg-primary/10 border-primary/20",
    dot: "bg-primary",
  },
  "Bảo trì": {
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    dot: "bg-amber-400",
  },
  "Ngoại tuyến": {
    color: "text-muted-foreground bg-secondary border-border",
    dot: "bg-muted-foreground",
  },
};

export default function SmartBoxes() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadBoxes = () => {
    base44.entities.SmartBox.list("-updated_date", 100).then((data) => {
      setBoxes(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBoxes();
    const unsub = base44.entities.SmartBox.subscribe((event) => {
      if (event.type === "update") {
        setBoxes((prev) => prev.map((b) => (b.id === event.data?.id ? event.data : b)));
        try {
          const { toast } = require("@/components/ui/use-toast");
          toast({ title: `SmartBox cập nhật`, description: event.data?.box_id || event.data?.id });
        } catch {}
      }
      if (event.type === "create") {
        setBoxes((prev) => {
          const exists = prev.some((b) => b.id === event.data?.id || b.box_id === event.data?.box_id);
          return exists ? prev : [event.data, ...prev];
        });
        try {
          const { toast } = require("@/components/ui/use-toast");
          toast({ title: `SmartBox mới`, description: event.data?.box_name || event.data?.box_id || event.data?.id });
        } catch {}
      }
    });
    // demo smartbox events
    const onDemo = (e) => {
      const evt = e?.detail;
      if (!evt || evt.type !== 'smartbox') return;
      const { action, data } = evt;
      if (action === 'create') {
        setBoxes((prev) => {
          const exists = prev.some((b) => b.id === data.id || b.box_id === data.box_id);
          return exists ? prev.map((b) => (b.id === data.id || b.box_id === data.box_id ? { ...b, ...data } : b)) : [data, ...prev].slice(0, 100);
        });
      } else if (action === 'update') {
        setBoxes((prev) => {
          const exists = prev.find((b) => b.id === data.id || b.box_id === data.box_id);
          if (exists) return prev.map((b) => (b.id === exists.id ? { ...b, ...data } : b));
          return [data, ...prev].slice(0, 100);
        });
      }
    };
    window.addEventListener('demo:event', onDemo);
    return () => {
      unsub();
      window.removeEventListener("demo:event", onDemo);
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">SmartBox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {boxes.length} thiết bị IoT trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm SmartBox
        </Button>
      </div>

      {boxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Box className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Chưa có SmartBox nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {boxes.map((box) => {
            const cfg = statusConfig[box.status] || statusConfig["Ngoại tuyến"];
            return (
              <div
                key={box.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Box className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {box.box_name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {box.box_id}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium",
                      cfg.color,
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        cfg.dot,
                        box.status === "Đang vận chuyển" && "animate-pulse",
                      )}
                    />
                    {box.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {box.last_temperature !== undefined && (
                    <SensorChip
                      icon={Thermometer}
                      label="Nhiệt độ"
                      value={`${box.last_temperature?.toFixed(1)}°C`}
                      warn={box.last_temperature > 35}
                    />
                  )}
                  {box.battery_level !== undefined && (
                    <SensorChip
                      icon={Battery}
                      label="Pin"
                      value={`${box.battery_level}%`}
                      warn={box.battery_level < 20}
                    />
                  )}
                </div>

                {box.current_order_id && (
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Đơn hàng:{" "}
                      </span>
                      <span className="text-xs font-mono text-foreground">
                        {box.current_order_id.slice(0, 8)}...
                      </span>
                    </div>
                    <Link
                      to={`/orders/${box.current_order_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Xem đơn hàng
                    </Link>
                  </div>
                )}

                {box.last_seen && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    {box.status !== "Ngoại tuyến" ? (
                      <Wifi className="w-3 h-3" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    Online: {new Date(box.last_seen).toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <SmartBoxFormDialog
          onClose={() => {
            setShowForm(false);
            loadBoxes();
          }}
        />
      )}
    </div>
  );
}

function SensorChip({ icon: Icon, label, value, warn }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/50",
        warn && "bg-red-500/10 border border-red-500/20",
      )}
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5 flex-shrink-0",
          warn ? "text-red-400" : "text-muted-foreground",
        )}
      />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            "text-xs font-mono font-semibold",
            warn ? "text-red-400" : "text-foreground",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
