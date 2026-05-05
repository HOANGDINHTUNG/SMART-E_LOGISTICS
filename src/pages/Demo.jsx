// @ts-nocheck
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SensorGauge from "../components/SensorGauge";
import AlertBadge from "../components/AlertBadge";
import {
  Search,
  QrCode,
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Thermometer,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QRScanner from "../components/QRScanner";
import {
  buildOrderRouteCoords,
  getOrderDisplayAddress,
  getOrderGpsPoint,
  getOrderMapHref,
} from "@/utils/locationResolver";

// Fix leaflet icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
// @ts-ignore
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const statusColors = {
  "Đang vận chuyển": "text-primary bg-primary/10 border-primary/20",
  "Đã giao": "text-green-400 bg-green-400/10 border-green-400/20",
  "Chờ xử lý": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Có sự cố": "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function Demo() {
  const [searchCode, setSearchCode] = useState("");
  const [order, setOrder] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 20).then(setAllOrders);
  }, []);

  const handleSearch = async (code) => {
    const searchVal = code || searchCode;
    if (!searchVal.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setSensorData([]);
    setAlerts([]);

    const results = await base44.entities.Order.filter(
      { order_code: searchVal.trim() },
      "-created_date",
      1,
    );
    if (results.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const found = results[0];
    setOrder(found);
    const [sensors, orderAlerts] = await Promise.all([
      base44.entities.SensorData.filter(
        { order_id: found.id },
        "-timestamp",
        30,
      ),
      base44.entities.Alert.filter({ order_id: found.id }, "-created_date", 10),
    ]);
    setSensorData(sensors.reverse());
    setAlerts(orderAlerts);
    setLoading(false);
  };

  useEffect(() => {
    if (!order) return;
    const unsub = base44.entities.SensorData.subscribe((event) => {
      if (event.data?.order_id === order.id && event.type === "create") {
        setSensorData((prev) => [...prev, event.data].slice(-30));
      }
    });
    return () => unsub();
  }, [order]);

  const latestSensor = sensorData[sensorData.length - 1];
  const orderGpsPoint = order ? getOrderGpsPoint(order) : null;
  const currentMapPoint = latestSensor?.latitude
    ? {
        lat: latestSensor.latitude,
        lng: latestSensor.longitude,
        label: latestSensor.place,
      }
    : orderGpsPoint;
  const sensorRouteCoords = sensorData
    .filter((d) => d.latitude && d.longitude)
    .map((d) => [d.latitude, d.longitude]);
  const routeCoords = sensorRouteCoords.length > 1
    ? sensorRouteCoords
    : buildOrderRouteCoords(order || {}, currentMapPoint);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Package className="w-3 h-3" /> Demo Tương tác
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Theo dõi đơn hàng trực tiếp
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Nhập mã đơn hàng bằng tay hoặc tiến hành quét mã QR để tra cứu tức thì
          trạng thái.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Nhập mã đơn hàng
            </span>
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="VD: ORD-123456"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-secondary border-border font-mono"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 flex-shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Tra cứu
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScanner(!showScanner)}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/10 flex-shrink-0"
            >
              <QrCode className="w-4 h-4" /> Quét QR
            </Button>
          </div>

          {/* Quick pick from existing */}
          {allOrders.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                Hoặc chọn nhanh:
              </p>
              <div className="flex flex-wrap gap-2">
                {allOrders.slice(0, 6).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchCode(o.order_code);
                      handleSearch(o.order_code);
                    }}
                    className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  >
                    {o.order_code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {notFound && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              Không tìm thấy đơn hàng với mã này.
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <div className="max-w-md mx-auto fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              onClick={() => setShowScanner(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-semibold mb-4 text-center">
              Đưa mã QR vào khung hình Camera
            </h3>
            <QRScanner
              onScanSuccess={(decodedText) => {
                setShowScanner(false);
                setSearchCode(decodedText);
                handleSearch(decodedText);
              }}
              onScanFailure={() => {}}
            />
          </div>
        </div>
      )}

      {/* QR info */}
      {!showScanner && (
        <div className="max-w-xl mx-auto">
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex gap-3 items-start">
            <QrCode className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="text-amber-400 font-semibold">QR Code: </span>
              Sử dụng nút Quét QR ở trên để thực hiện tra cứu bằng Camera.
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {order && (
        <div className="space-y-6">
          {/* Order header */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xl font-bold text-foreground">
                    {order.order_code}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-xs font-medium",
                      statusColors[order.status] ||
                        "text-muted-foreground bg-secondary border-border",
                    )}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  {order.cargo_type} ·{" "}
                  <a
                    href={getOrderMapHref(order, "origin")}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary"
                  >
                    {getOrderDisplayAddress(order, "origin")}
                  </a>{" "}
                  →{" "}
                  <a
                    href={getOrderMapHref(order, "destination")}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary"
                  >
                    {getOrderDisplayAddress(order, "destination")}
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Người nhận:{" "}
                  <span className="text-foreground">{order.receiver_name}</span>
                  {order.estimated_delivery &&
                    ` · Dự kiến: ${order.estimated_delivery}`}
                </p>
              </div>
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
              >
                Xem đầy đủ trong Dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-foreground">
                  Vị trí GPS
                </span>
                {currentMapPoint?.lat && (
                  <span className="ml-auto text-xs font-mono text-muted-foreground">
                    {Number(currentMapPoint.lat).toFixed(4)},{" "}
                    {Number(currentMapPoint.lng).toFixed(4)}
                  </span>
                )}
              </div>
              {currentMapPoint?.lat ? (
                <div style={{ height: 300 }}>
                  {/* @ts-ignore */}
                  <MapContainer
                    key={`${currentMapPoint.lat}-${currentMapPoint.lng}`}
                    center={[currentMapPoint.lat, currentMapPoint.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    {/* @ts-ignore */}
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {routeCoords.length > 1 && (
                      /* @ts-ignore */
                      <Polyline
                        positions={routeCoords}
                        color="hsl(168,100%,42%)"
                        weight={3}
                      />
                    )}
                    <Marker
                      position={[currentMapPoint.lat, currentMapPoint.lng]}
                    >
                      <Popup>
                        <div className="text-xs">
                          <strong>{order.order_code}</strong>
                          <br />
                          {order.status}
                          {currentMapPoint.label && (
                            <>
                              <br />
                              {currentMapPoint.label}
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <MapPin className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Chưa có dữ liệu GPS</p>
                </div>
              )}
            </div>

            {/* Sensor */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary" /> Cảm biến trực
                  tiếp
                </h3>
                {latestSensor && (
                  <span className="flex items-center gap-1.5 text-xs text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{" "}
                    Live
                  </span>
                )}
              </div>
              {latestSensor ? (
                <SensorGauge data={latestSensor} />
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  Chưa có dữ liệu cảm biến
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Cảnh báo (
              {alerts.length})
            </h3>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Không có cảnh
                báo nào
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
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
      )}

      {/* Instruction when no search */}
      {!order && !notFound && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Nhập mã đơn hàng ở trên để bắt đầu theo dõi</p>
          <p className="text-xs mt-2 opacity-60">
            Demo kết nối trực tiếp với dữ liệu thật từ hệ thống
          </p>
        </div>
      )}
    </div>
  );
}
