import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SensorGauge from "../components/SensorGauge";
import AlertBadge from "../components/AlertBadge";
import {
  ArrowLeft,
  Package,
  Box,
  MapPin,
  AlertTriangle,
  CheckCircle2,
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
import { format } from "date-fns";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [smartbox, setSmartbox] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.get(orderId).then(async (o) => {
      setOrder(o);
      const [sensors, orderAlerts] = await Promise.all([
        base44.entities.SensorData.filter(
          { order_id: orderId },
          "-timestamp",
          50,
        ),
        base44.entities.Alert.filter(
          { order_id: orderId },
          "-created_date",
          20,
        ),
      ]);
      setSensorData(sensors.reverse());
      setAlerts(orderAlerts);
      if (o.smartbox_id) {
        const boxes = await base44.entities.SmartBox.filter(
          { box_id: o.smartbox_id },
          "-updated_date",
          1,
        );
        if (boxes.length > 0) setSmartbox(boxes[0]);
      }
      setLoading(false);
    });
  }, [orderId]);

  useEffect(() => {
    const unsub = base44.entities.SensorData.subscribe((event) => {
      if (event.data?.order_id === orderId && event.type === "create") {
        setSensorData((prev) => [...prev, event.data].slice(-50));
      }
    });
    const unsubAlert = base44.entities.Alert.subscribe((event) => {
      if (event.data?.order_id === orderId && event.type === "create") {
        setAlerts((prev) => [event.data, ...prev]);
      }
    });
    return () => {
      unsub();
      unsubAlert();
    };
  }, [orderId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  if (!order)
    return (
      <div className="text-center text-muted-foreground py-20">
        Không tìm thấy đơn hàng
      </div>
    );

  const latestSensor = sensorData[sensorData.length - 1];

  // Generate mock chart data if no real sensor data
  const mockChartData = Array.from({ length: 20 }, (_, i) => ({
    i: i + 1,
    temp: +(20 + Math.sin(i * 0.5) * 4 + (i % 3) * 0.5).toFixed(1),
    hum: +(60 + Math.cos(i * 0.4) * 8 + (i % 4) * 0.8).toFixed(1),
    shock: +(Math.abs(Math.sin(i * 1.2)) * 0.6).toFixed(2),
  }));

  const chartData =
    sensorData.length > 1
      ? sensorData.map((d, i) => ({
          i: i + 1,
          temp: d.temperature,
          hum: d.humidity,
          shock: d.shock_g,
        }))
      : mockChartData;

  const isMockChart = sensorData.length <= 1;

  const sensorDisplay = latestSensor
    ? latestSensor
    : smartbox
      ? {
          temperature: smartbox.last_temperature,
          humidity: smartbox.last_humidity,
          shock_g: smartbox.last_shock,
          battery: smartbox.battery_level,
        }
      : null;

  const mapLat = latestSensor?.latitude ?? smartbox?.last_latitude;
  const mapLng = latestSensor?.longitude ?? smartbox?.last_longitude;

  const statusMap = {
    "Đang vận chuyển": "text-primary bg-primary/10 border-primary/20",
    "Đã giao": "text-green-400 bg-green-400/10 border-green-400/20",
    "Chờ xử lý": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "Có sự cố": "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground font-mono">
              {order.order_code}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusMap[order.status] || "text-muted-foreground bg-secondary border-border"}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {order.cargo_type} · {order.origin} {"->"} {order.destination}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Thông tin đơn hàng
            </h2>
            <InfoRow label="Người gửi" value={order.sender_name} />
            <InfoRow label="Người nhận" value={order.receiver_name} />
            <InfoRow
              label="Tuyến"
              value={`${order.origin} -> ${order.destination}`}
            />
            <InfoRow label="Loại hàng" value={order.cargo_type} />
            {order.estimated_delivery && (
              <InfoRow label="Dự kiến giao" value={order.estimated_delivery} />
            )}
            {order.notes && <InfoRow label="Ghi chú" value={order.notes} />}
          </div>

          {smartbox && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Box className="w-4 h-4 text-accent" /> SmartBox
              </h2>
              <InfoRow label="Box ID" value={smartbox.box_id} mono />
              <InfoRow label="Tên" value={smartbox.box_name} />
              <InfoRow label="Trạng thái" value={smartbox.status} />
              {smartbox.firmware_version && (
                <InfoRow
                  label="Firmware"
                  value={smartbox.firmware_version}
                  mono
                />
              )}
              {smartbox.last_seen && (
                <InfoRow
                  label="Online lần cuối"
                  value={format(
                    new Date(smartbox.last_seen),
                    "HH:mm dd/MM/yyyy",
                  )}
                />
              )}
            </div>
          )}

          {/* Google Maps embed */}
          {mapLat && mapLng && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" /> Vị trí GPS
                </h2>
                <a
                  href={`https://www.google.com/maps?q=${mapLat},${mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> Mở Google Maps
                </a>
              </div>
              <div className="w-full" style={{ height: 200 }}>
                <iframe
                  title="google-map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&z=13&output=embed`}
                />
              </div>
              <div className="px-4 py-2 text-xs font-mono text-muted-foreground flex gap-4 bg-secondary/30">
                <span>Lat: {mapLat.toFixed(5)}</span>
                <span>Lng: {mapLng.toFixed(5)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Cảm biến trực tiếp
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {sensorDisplay ? "Live" : "Chờ dữ liệu"}
              </span>
            </div>
            {sensorDisplay ? (
              <SensorGauge data={sensorDisplay} />
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Chưa có dữ liệu cảm biến
              </div>
            )}
          </div>

          {/* Chart - always shown with mock fallback */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Lịch sử Nhiệt độ &amp; Độ ẩm
              </h2>
              {isMockChart && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                  Dữ liệu mô phỏng
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
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
                  <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="i"
                  tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }}
                />
                <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220,25%,11%)",
                    border: "1px solid hsl(215,28%,18%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="hsl(168,100%,42%)"
                  fill="url(#tg2)"
                  strokeWidth={2}
                  name="Nhiệt độ °C"
                />
                <Area
                  type="monotone"
                  dataKey="hum"
                  stroke="hsl(199,89%,48%)"
                  fill="url(#hg2)"
                  strokeWidth={2}
                  name="Độ ẩm %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Cảnh báo liên
              quan ({alerts.length})
            </h2>
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Không có cảnh
                báo
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg border border-border/50"
                  >
                    <AlertBadge severity={alert.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground">
                        {alert.alert_type}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {alert.message}
                      </div>
                      {alert.value !== undefined && (
                        <div className="text-xs text-muted-foreground/60 mt-0.5">
                          Giá trị: {alert.value} (ngưỡng: {alert.threshold})
                        </div>
                      )}
                    </div>
                    {alert.is_resolved && (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
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

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-foreground text-right ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
