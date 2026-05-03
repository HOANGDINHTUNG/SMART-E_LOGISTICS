import { Link } from "react-router-dom";
import { useState } from "react";
import {
  MapPin,
  Thermometer,
  Bell,
  ShieldCheck,
  Zap,
  Battery,
  Package,
  ArrowRight,
  CheckCircle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "gps",
    icon: MapPin,
    color: "text-primary border-primary/30 bg-primary/10",
    title: "Theo dõi vị trí GPS",
    subtitle: "Real-time location tracking",
    desc: "Mỗi SmartBox tích hợp module GPS, gửi tọa độ mỗi 30 giây qua MQTT. Vị trí hiển thị trực tiếp trên bản đồ số, kèm lịch sử hành trình đầy đủ.",
    specs: [
      "Độ chính xác GPS: ±3m",
      "Cập nhật mỗi 30 giây",
      "Lịch sử hành trình 30 ngày",
      "Phát hiện đi sai lộ trình",
    ],
    demo: 'Nhấn "Xem Demo" để xem vị trí hộp hàng trực tiếp trên bản đồ tương tác.',
  },
  {
    id: "sensor",
    icon: Thermometer,
    color: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    title: "Cảm biến Nhiệt độ & Độ ẩm",
    subtitle: "Environmental monitoring",
    desc: "Cảm biến DHT22 đo nhiệt độ (-40°C đến +80°C) và độ ẩm (0-100%) liên tục. Dữ liệu lưu theo chuỗi thời gian, hiển thị dạng biểu đồ trực quan.",
    specs: [
      "Nhiệt độ: -40°C ~ +80°C",
      "Độ ẩm: 0% ~ 100%",
      "Độ chính xác ±0.5°C",
      "Cảnh báo vượt ngưỡng tức thì",
    ],
    demo: "Biểu đồ nhiệt độ & độ ẩm cập nhật theo thời gian thực trong trang chi tiết đơn hàng.",
  },
  {
    id: "alert",
    icon: Bell,
    color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    title: "Hệ thống cảnh báo thông minh",
    subtitle: "Rule-based alert engine",
    desc: "Engine cảnh báo tự động kiểm tra từng bản ghi sensor so với ngưỡng được định nghĩa. Khi vượt ngưỡng, Alert được tạo và push qua WebSocket về dashboard ngay lập tức.",
    specs: [
      "Cảnh báo nhiệt độ cao/thấp",
      "Cảnh báo va chạm mạnh (>3G)",
      "Cảnh báo hộp bị mở",
      "Cảnh báo pin yếu (<20%)",
      "Phân loại 4 mức: Thấp → Khẩn cấp",
    ],
    demo: "Xem trang Cảnh báo trong Dashboard để kiểm tra và xử lý alert theo thời gian thực.",
  },
  {
    id: "qr",
    icon: ShieldCheck,
    color: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    title: "QR Code Tracking",
    subtitle: "Identification & traceability",
    desc: "Mỗi đơn hàng có mã QR riêng. Khách hàng quét mã để tra cứu trạng thái đơn hàng tức thì — không cần đăng nhập. Hỗ trợ truy xuất nguồn gốc toàn bộ hành trình.",
    specs: [
      "QR code duy nhất mỗi đơn",
      "Tra cứu không cần tài khoản",
      "Lịch sử scan đầy đủ",
      "Tương thích RFID",
    ],
    demo: "Thử tính năng QR trong trang Demo — nhập mã đơn hoặc quét QR để xem trạng thái.",
  },
  {
    id: "shock",
    icon: Zap,
    color: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    title: "Cảm biến gia tốc / Va chạm",
    subtitle: "Shock & vibration detection",
    desc: "Cảm biến MPU6050 3-axis accelerometer phát hiện va chạm, rung lắc và nghiêng lệch. Ghi log mọi sự kiện va chạm quá ngưỡng để dùng làm bằng chứng nếu xảy ra hư hỏng.",
    specs: [
      "3-axis accelerometer",
      "Ngưỡng cảnh báo: >3G",
      "Ghi log toàn bộ sự kiện",
      "Phát hiện nghiêng lệch",
    ],
    demo: "Dashboard hiển thị chỉ số va chạm (G-force) trong SensorGauge của từng đơn hàng.",
  },
  {
    id: "battery",
    icon: Battery,
    color: "text-green-400 border-green-400/30 bg-green-400/10",
    title: "Quản lý nguồn điện",
    subtitle: "Power management",
    desc: "SmartBox chạy bằng pin lithium 10.000mAh, hỗ trợ sạc không dây. Hệ thống giám sát mức pin liên tục, cảnh báo khi còn dưới 20% và tự động vào chế độ tiết kiệm điện.",
    specs: [
      "Pin 10.000mAh Li-ion",
      "Thời lượng: 7-14 ngày",
      "Cảnh báo pin yếu <20%",
      "Sleep mode thông minh",
    ],
    demo: "Mức pin hiển thị trực tiếp trong thẻ SmartBox trên trang quản lý thiết bị.",
  },
];

export default function Features() {
  const [active, setActive] = useState("gps");
  const activeFeature = features.find((f) => f.id === active);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Package className="w-3 h-3" /> Tính năng hệ thống
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Công nghệ SmartBox E-Logistics
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Tích hợp đầy đủ cảm biến IoT, GPS, và hệ thống cảnh báo thông minh
          trong một thiết bị nhỏ gọn.
        </p>
      </div>

      {/* Interactive feature explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature list */}
        <div className="space-y-2">
          {features.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={cn(
                "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                active === f.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0",
                  f.color,
                )}
              >
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs opacity-60">{f.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Feature detail */}
        {activeFeature && (
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-7 space-y-5">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center",
                activeFeature.color,
              )}
            >
              <activeFeature.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {activeFeature.title}
              </h2>
              <p className="text-sm text-primary mt-0.5">
                {activeFeature.subtitle}
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeFeature.desc}
            </p>

            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeFeature.specs.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {spec}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
              <div className="flex items-start gap-2">
                <Play className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {activeFeature.demo}
                </p>
              </div>
            </div>

            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
            >
              Thử Demo Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Architecture overview */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-2 text-center">
          Kiến trúc hệ thống tổng quan
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Luồng dữ liệu từ thiết bị IoT tới dashboard
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {[
            "ESP32 IoT Device",
            "MQTT Broker",
            "Backend API",
            "Database",
            "WebSocket",
            "React Dashboard",
          ].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs font-mono">
                {step}
              </div>
              {i < arr.length - 1 && (
                <span className="text-primary text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/demo"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Trải nghiệm Demo Tương tác <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
