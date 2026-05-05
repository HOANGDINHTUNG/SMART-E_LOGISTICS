import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { formatLiveClock, getLiveLog, getLiveState } from "@/lib/liveStorage";
import { LIVE_SCENARIO } from "@/utils/liveScenario";
import { Link, useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import AlertBadge from "../components/AlertBadge";
import QRCode from "react-qr-code";
import {
  Package,
  Box,
  Bell,
  CheckCircle,
  Activity,
  ArrowRight,
  PieChart as PieChartIcon,
  QrCode as QrCodeIcon,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { getOrderDisplayAddress } from "@/utils/locationResolver";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [liveState, setLiveState] = useState(() => getLiveState());
  const [liveLog, setLiveLog] = useState(() => getLiveLog());


  useEffect(() => {
    const onLiveState = (event) => setLiveState(event.detail || getLiveState());
    const onLiveLog = (event) => setLiveLog(event.detail || getLiveLog());
    window.addEventListener("live:state", onLiveState);
    window.addEventListener("live:log", onLiveLog);
    return () => {
      window.removeEventListener("live:state", onLiveState);
      window.removeEventListener("live:log", onLiveLog);
    };
  }, []);

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
      if (event.type === "create") {
        setAlerts((prev) => {
          const exists = prev.some((a) => a.id === event.data?.id);
          return exists ? prev : [event.data, ...prev].slice(0, 20);
        });
        try {
          // show toast for real alerts
          const { message, severity } = event.data || {};
          const { toast } = require("@/components/ui/use-toast");
          toast({ title: `Cảnh báo ${severity || ""}`, description: message || "Có cảnh báo" });
        } catch {}
      }
      if (event.type === "update") {
        setAlerts((prev) => prev.map((a) => (a.id === event.data?.id ? event.data : a)));
      }
    });
    const unsubBox = base44.entities.SmartBox.subscribe((event) => {
      if (event.type === "update")
        setBoxes((prev) =>
          prev.map((b) => (b.id === event.data?.id ? event.data : b)),
        );
    });
    // demo event listener
    const onDemo = (e) => {
      const evt = e?.detail;
      if (!evt) return;
      if (evt.type === "alert") {
        const alertData = evt.data || { id: evt.alertId || evt.alert_id || Date.now(), ...evt };
        setAlerts((prev) => {
          const exists = prev.find((a) => a.id === alertData.id);
          if (exists) return prev.map((a) => (a.id === alertData.id ? { ...a, ...alertData } : a));
          return [alertData, ...prev].slice(0, 20);
        });
      }
      if (evt.type === "sensor") {
        setSensorHistory((prev) => {
          const entry = { time: prev.length + 1, temp: evt.value, humidity: evt.humidity || 0 };
          return [...prev.slice(-23), entry];
        });
      }
      if (evt.type === "order") {
        setOrders((prev) => {
          const base = evt.data || {};
          const id = evt.orderId || evt.order_id || base.id || evt.id;
          const mappedStatus =
            base.status ||
            (evt.status === "created"
              ? "Chờ xử lý"
              : evt.status === "picked"
              ? "Đang vận chuyển"
              : evt.status === "shipped"
              ? "Đang vận chuyển"
              : evt.status === "delivered"
              ? "Đã giao"
              : evt.status || "Chờ xử lý");
          const exists = prev.find((o) => o.id === id || o.order_code === base.order_code || o.order_code === `DM-${id}`);
          const newOrder = {
            id,
            order_code: base.order_code || `DM-${id}`,
            sender_name: base.sender_name || "Demo Sender",
            receiver_name: base.receiver_name || "Demo Receiver",
            origin: base.origin || "Demo",
            destination: base.destination || "Demo",
            cargo_type: base.cargo_type || "Demo",
            smartbox_id: base.smartbox_id || null,
            estimated_delivery: base.estimated_delivery || null,
            notes: base.notes || null,
            status: mappedStatus,
          };
          if (exists) return prev.map((o) => (o.id === exists.id ? { ...o, ...newOrder } : o));
          return [newOrder, ...prev].slice(0, 100);
        });
      }
      if (evt.type === "smartbox" && evt.data) {
        setBoxes((prev) => {
          const exists = prev.find((b) => b.id === evt.data.id || b.box_id === evt.data.box_id);
          if (exists) return prev.map((b) => (b.id === exists.id ? { ...b, ...evt.data } : b));
          return [evt.data, ...prev].slice(0, 50);
        });
      }
    };
    window.addEventListener("demo:event", onDemo);
    return () => {
      unsub();
      unsubBox();
      window.removeEventListener("demo:event", onDemo);
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

  const liveGenerated = liveState.generatedEntityIds || {};
  const liveProgress = Math.min(
    100,
    Math.round(((liveState.currentSecond || 0) / (liveState.totalDuration || LIVE_SCENARIO.totalDuration)) * 100),
  );
  const liveStatusLabel = {
    not_started: "Chưa chạy",
    running: "Đang chạy",
    paused: "Tạm dừng",
    completed: "Hoàn tất",
  }[liveState.status] || "Chưa chạy";

  // Data for Pie Chart
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts)
    .filter((status) => statusCounts[status] > 0)
    .map((status) => ({
      name: status,
      value: statusCounts[status],
    }));

  const PIE_COLORS = {
    "Đang vận chuyển": "hsl(168,100%,42%)", // Primary
    "Đã giao": "hsl(142, 71%, 45%)", // Green
    "Chờ xử lý": "hsl(43, 96%, 56%)", // Amber
    "Có sự cố": "hsl(0, 84%, 60%)", // Red
    Hủy: "hsl(215, 20%, 65%)", // Muted
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải dữ liệu thời gian thực...
        </p>
      </div>
    );

  const qrOrder = orders.find((order) => order.order_code === "ORD-LIVE-001") || orders[0];
  const qrOrderUrl = qrOrder
    ? `${window.location.origin}/orders/${qrOrder.id}`
    : `${window.location.origin}/orders`;

  const handleQrScan = () => {
    if (!qrOrder || isQrScanning) return;
    setIsQrScanning(true);
    window.setTimeout(() => {
      navigate(`/orders/${qrOrder.id}`);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-card/30 p-6 rounded-3xl border border-border/50 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
            <TrendingUp className="w-3.5 h-3.5" /> Thống kê Live
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight drop-shadow-sm">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Tổng quan hệ thống SmartBox E-Logistics. Dữ liệu được đồng bộ hóa
            liên tục theo thời gian thực.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Đơn đang vận chuyển"
          value={activeOrders}
          icon={Package}
          color="primary"
          subtitle={`/ ${orders.length} tổng đơn`}
          trend={12}
        />
        <StatCard
          title="SmartBox đang dùng"
          value={activeBoxes}
          icon={Box}
          color="blue"
          subtitle={`/ ${boxes.length} thiết bị`}
          trend={5}
        />
        <StatCard
          title="Cảnh báo chưa xử lý"
          value={unresolvedAlerts}
          icon={Bell}
          color={unresolvedAlerts > 0 ? "red" : "primary"}
          subtitle="Cần xem xét ngay"
          trend={unresolvedAlerts > 0 ? -2 : 0}
        />
        <StatCard
          title="Đã hoàn thành"
          value={orders.filter((o) => o.status === "Đã giao").length}
          icon={CheckCircle}
          color="primary"
          subtitle="Giao thành công"
          trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Live Session
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {LIVE_SCENARIO.name} · dữ liệu được ghi trực tiếp vào Order, SmartBox, Alert và SensorData.
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              liveState.status === "running"
                ? "text-primary bg-primary/10 border-primary/20"
                : liveState.status === "completed"
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : liveState.status === "paused"
                    ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
                    : "text-muted-foreground bg-secondary border-border"
            }`}>
              <span className={`w-2 h-2 rounded-full ${liveState.status === "running" ? "bg-primary animate-pulse" : "bg-current"}`} />
              {liveStatusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <LiveMetric label="Tiến trình" value={`${formatLiveClock(liveState.currentSecond || 0)} / ${formatLiveClock(liveState.totalDuration || LIVE_SCENARIO.totalDuration)}`} />
            <LiveMetric label="Orders" value={liveGenerated.orders?.length || 0} />
            <LiveMetric label="SmartBoxes" value={liveGenerated.smartboxes?.length || 0} />
            <LiveMetric label="Sensors" value={liveGenerated.sensorData?.length || 0} />
            <LiveMetric label="Alerts" value={liveGenerated.alerts?.length || 0} />
          </div>

          <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border/60">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${liveProgress}%` }} />
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" /> Live Activity Feed
          </h2>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {liveLog.length === 0 ? (
              <p className="text-xs text-muted-foreground">Chưa có event Live. Bấm Start Live để bắt đầu.</p>
            ) : (
              liveLog.slice(-6).reverse().map((item) => (
                <div key={item.id} className="flex gap-2 text-xs bg-secondary/30 border border-border/40 rounded-lg px-3 py-2">
                  <span className="font-mono text-primary shrink-0">[{formatLiveClock(item.second)}]</span>
                  <span className="text-muted-foreground leading-snug">{item.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Biểu đồ cảm biến môi trường
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Theo dõi diễn biến Nhiệt độ & Độ ẩm trong 24 giờ qua
              </p>
            </div>
            <div className="flex gap-2 items-center text-xs font-mono bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{" "}
              Live Sync
            </div>
          </div>

          {sensorHistory.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={260}
              className="relative z-10"
            >
              <AreaChart
                data={sensorHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(168,100%,42%)"
                      stopOpacity={0.4}
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
                      stopOpacity={0.4}
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
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid hsl(215,28%,18%)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="hsl(168,100%,42%)"
                  fill="url(#tempGrad)"
                  strokeWidth={3}
                  name="Nhiệt độ (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="hsl(199,89%,48%)"
                  fill="url(#humGrad)"
                  strokeWidth={3}
                  name="Độ ẩm (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm flex-col gap-3">
              <Activity className="w-8 h-8 opacity-20" />
              Chưa có dữ liệu cảm biến
            </div>
          )}
        </div>

        {/* Action Widgets Col */}
        <div className="flex flex-col gap-6">
          {/* Order Distribution Chart */}
          <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm flex-1">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-blue-400" />
              Phân bổ đơn hàng
            </h2>
            {pieData.length > 0 ? (
              <div className="h-[180px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[entry.name] || PIE_COLORS["Hủy"]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                Chưa có dữ liệu phân bổ
              </div>
            )}
            {/* Custom mini legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[d.name] || PIE_COLORS["Hủy"],
                    }}
                  ></span>
                  <span
                    className="text-muted-foreground truncate"
                    title={d.name}
                  >
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Extended */}
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Đơn hàng gần đây
            </h2>
            <Link
              to="/orders"
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground bg-secondary/20">
                  <th className="text-left py-3 px-4 text-xs font-semibold">
                    Mã đơn
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold hidden sm:table-cell">
                    Loại hàng
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold hidden md:table-cell">
                    Tuyến
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {orders.slice(0, 6).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-secondary/40 transition-colors duration-200 group object-contain"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-mono text-xs font-medium text-primary hover:text-primary/70 group-hover:underline"
                      >
                        {order.order_code}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden sm:table-cell">
                      <span className="bg-secondary px-2 py-1 rounded-md border border-border/50">
                        {order.cargo_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1 max-w-[200px] truncate">
                        <span className="truncate flex-1" title={getOrderDisplayAddress(order, "origin")}>
                          {getOrderDisplayAddress(order, "origin")}
                        </span>
                        <ArrowRight className="w-3 h-3 text-border flex-shrink-0" />
                        <span
                          className="truncate flex-1"
                          title={getOrderDisplayAddress(order, "destination")}
                        >
                          {getOrderDisplayAddress(order, "destination")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Không có đơn hàng.
              </div>
            )}
          </div>
        </div>

        {/* Right side Stack for QR & Alerts */}
        <div className="flex flex-col gap-6">
          {/* Real QR Code Demo Section */}
          <div className="bg-gradient-to-b from-primary/10 to-card border border-primary/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(45,212,191,0.05)] relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-colors duration-500" />
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
              <QrCodeIcon className="w-5 h-5 text-primary" />
              Scan Order Tracking
            </h2>
            <p className="text-xs text-muted-foreground mb-5 pr-8 leading-relaxed">
              Mã QR liên kết với đơn hàng mới nhất. Trỏ chuột vào mã và bấm
              Quét vào để mở chi tiết đơn hàng tương ứng.
            </p>
            <div
              className={`qr-scan-box bg-white p-4 rounded-xl inline-block shadow-xl border-4 border-white transition-transform duration-300 group/qr ${
                isQrScanning ? "is-scanning scale-105" : "hover:scale-105"
              }`}
            >
              <QRCode
                value={qrOrderUrl}
                size={140}
                level="H"
                bgColor="#ffffff"
                fgColor="#020817"
              />
              <div className="qr-scan-overlay">
                <button
                  type="button"
                  onClick={handleQrScan}
                  disabled={!qrOrder || isQrScanning}
                  className="qr-scan-button"
                >
                  {isQrScanning ? "Đang quét..." : "Quét vào"}
                </button>
              </div>
              <div className="qr-scan-line" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-primary/80">
              <Smartphone className="w-4 h-4" />
              {qrOrder ? qrOrder.order_code : "Chưa có đơn hàng"}
            </div>
          </div>

          {/* Urgent Alerts */}
          <div className="bg-card/40 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                Cảnh báo khẩn
              </h2>
              <Link
                to="/alerts"
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
            {criticalAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-xl border border-dashed border-border">
                <CheckCircle className="w-8 h-8 text-primary/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Tuyệt vời! Không có sự cố nào.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-red-400/10 border border-red-500/30 rounded-xl transition-all hover:bg-red-400/20"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-red-200">
                        {alert.alert_type}
                      </span>
                      <AlertBadge severity={alert.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground/90 leading-tight mb-2">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-red-400/60 font-mono bg-red-950/30 px-2 py-0.5 rounded inline-block">
                      Box: {alert.smartbox_id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMetric({ label, value }) {
  return (
    <div className="bg-secondary/30 border border-border/50 rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground font-mono mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Đang vận chuyển":
      "text-primary bg-primary/10 border-primary/20 shadow-[0_0_10px_rgba(45,212,191,0.2)]",
    "Đã giao":
      "text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]",
    "Chờ xử lý":
      "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
    "Có sự cố":
      "text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.2)]",
    Hủy: "text-muted-foreground bg-secondary border-border",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider ${map[status] || "text-muted-foreground bg-secondary border-border"}`}
    >
      {status}
    </span>
  );
}
