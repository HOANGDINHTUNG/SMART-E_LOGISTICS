import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import AlertBadge from "../components/AlertBadge";
import {
  Package,
  Box,
  Bell,
  CheckCircle,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-created_date", 100),
      base44.entities.SmartBox.list("-updated_date", 50),
      base44.entities.Alert.list("-created_date", 20),
      base44.entities.SensorData.list("-timestamp", 24),
    ]).then(([o, b, a, s]) => {
      setOrders(o);
      setBoxes(b);
      setAlerts(a);
      const formatted = s.reverse().map((d, i) => ({
        time: i + 1,
        temp: d.temperature,
        humidity: d.humidity,
      }));
      setSensorHistory(formatted);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Alert.subscribe((event) => {
      if (event.type === "create")
        setAlerts((prev) => [event.data, ...prev].slice(0, 20));
    });
    const unsubBox = base44.entities.SmartBox.subscribe((event) => {
      if (event.type === "update")
        setBoxes((prev) =>
          prev.map((b) => (b.id === event.id ? event.data : b)),
        );
    });
    return () => {
      unsub();
      unsubBox();
    };
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status === "Đang vận chuyển",
  ).length;
  const activeBoxes = boxes.filter(
    (b) => b.status === "Đang vận chuyển",
  ).length;
  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved).length;
  const criticalAlerts = alerts.filter(
    (a) =>
      !a.is_resolved && (a.severity === "Cao" || a.severity === "Khẩn cấp"),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng quan hệ thống SmartBox E-Logistics theo thời gian thực
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Đơn đang vận chuyển"
          value={activeOrders}
          icon={Package}
          color="primary"
          subtitle={`/ ${orders.length} tổng đơn`}
        />
        <StatCard
          title="SmartBox đang dùng"
          value={activeBoxes}
          icon={Box}
          color="blue"
          subtitle={`/ ${boxes.length} thiết bị`}
        />
        <StatCard
          title="Cảnh báo chưa xử lý"
          value={unresolvedAlerts}
          icon={Bell}
          color={unresolvedAlerts > 0 ? "red" : "primary"}
          subtitle="Cần xem xét ngay"
        />
        <StatCard
          title="Đã hoàn thành"
          value={orders.filter((o) => o.status === "Đã giao").length}
          icon={CheckCircle}
          color="primary"
          subtitle="Đơn giao thành công"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Biểu đồ cảm biến (24 mẫu gần nhất)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nhiệt độ &amp; Độ ẩm tổng hợp
              </p>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          {sensorHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sensorHistory}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(168,100%,42%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(168,100%,42%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(199,89%,48%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(199,89%,48%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(215,28%,18%)"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220,25%,11%)",
                    border: "1px solid hsl(215,28%,18%)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="hsl(168,100%,42%)"
                  fill="url(#tempGrad)"
                  strokeWidth={2}
                  name="Nhiet do (C)"
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="hsl(199,89%,48%)"
                  fill="url(#humGrad)"
                  strokeWidth={2}
                  name="Do am (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu cảm biến
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">
              Cảnh báo khẩn
            </h2>
            <Link
              to="/alerts"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {criticalAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <CheckCircle className="w-8 h-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Không có cảnh báo khẩn
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {alert.alert_type}
                    </span>
                    <AlertBadge severity={alert.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Box: {alert.smartbox_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">
            Đơn hàng gần đây
          </h2>
          <Link
            to="/orders"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                  Mã đơn
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Loại hàng
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Tuyến
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {order.order_code}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {order.cargo_type}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground hidden md:table-cell">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.origin)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {order.origin}
                    </a>{" "}
                    {"->"}{" "}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.destination)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {order.destination}
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Đang vận chuyển": "text-primary bg-primary/10 border-primary/20",
    "Đã giao": "text-green-400 bg-green-400/10 border-green-400/20",
    "Chờ xử lý": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "Có sự cố": "text-red-400 bg-red-400/10 border-red-400/20",
    Hủy: "text-muted-foreground bg-secondary border-border",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${map[status] || "text-muted-foreground bg-secondary border-border"}`}
    >
      {status}
    </span>
  );
}
