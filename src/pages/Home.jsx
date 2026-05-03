import { Link } from "react-router-dom";
import {
  MapPin,
  Thermometer,
  Bell,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Theo dõi GPS thời gian thực",
    desc: "Biết chính xác vị trí kiện hàng mọi lúc, mọi nơi qua bản đồ trực tuyến.",
    color: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: Thermometer,
    title: "Cảm biến nhiệt độ & độ ẩm",
    desc: "Giám sát liên tục điều kiện môi trường bên trong hộp, cảnh báo khi vượt ngưỡng.",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Bell,
    title: "Hệ thống cảnh báo thông minh",
    desc: "Nhận alert tức thì khi có va chạm mạnh, hộp bị mở trái phép hoặc nhiệt độ bất thường.",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  {
    icon: ShieldCheck,
    title: "QR/RFID Tracking",
    desc: "Truy xuất nguồn gốc đơn hàng dễ dàng, xác thực hàng hóa tại mọi điểm trung chuyển.",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Real-time Visibility",
    desc: "Toàn bộ chuỗi cung ứng minh bạch 100% theo thời gian thực.",
  },
  {
    icon: Clock,
    title: "Predictive Maintenance",
    desc: "Phát hiện sớm sự cố trước khi xảy ra, giảm thiểu rủi ro hư hỏng hàng hóa.",
  },
  {
    icon: Zap,
    title: "Tối ưu giao hàng chặng cuối",
    desc: "Dữ liệu hành trình giúp tối ưu tuyến đường và thời gian giao hàng.",
  },
  {
    icon: CheckCircle,
    title: "Trải nghiệm khách hàng",
    desc: "Khách hàng tự tra cứu trạng thái đơn hàng mọi lúc qua mã QR.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime hệ thống" },
  { value: "<500ms", label: "Độ trễ dữ liệu" },
  { value: "24/7", label: "Giám sát liên tục" },
  { value: "100%", label: "Minh bạch chuỗi cung ứng" },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(215,28%,18%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(215,28%,18%)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Wifi className="w-3 h-3 animate-pulse" />
            IoT · Real-time · Smart Logistics
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            SmartBox E-Logistics
            <br />
            <span className="text-primary">Hộp hàng thông minh</span>
            <br />
            <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl">
              với công nghệ IoT
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Giải pháp giám sát chuỗi cung ứng theo thời gian thực. Theo dõi vị
            trí, nhiệt độ, độ ẩm và trạng thái kiện hàng — mọi lúc, mọi nơi.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/demo"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Xem Demo Tính Năng <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/features"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border text-foreground font-medium text-sm hover:bg-secondary/70 transition-all"
            >
              Tìm hiểu thêm
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-card/60 border border-border rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock device visual */}
      <section className="py-16 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <span className="text-xs text-primary font-medium uppercase tracking-wider">
                SmartBox Device Preview
              </span>
              <h2 className="text-xl font-semibold text-foreground mt-2">
                Giao diện giám sát trực tiếp
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Nhiệt độ",
                  value: "22.4°C",
                  icon: Thermometer,
                  ok: true,
                },
                { label: "Độ ẩm", value: "65%", icon: null, ok: true },
                { label: "Va chạm", value: "0.2G", icon: Zap, ok: true },
                {
                  label: "Trạng thái",
                  value: "Đóng kín",
                  icon: ShieldCheck,
                  ok: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/50 rounded-xl p-4 text-center border border-border"
                >
                  <div className={`text-xs text-muted-foreground mb-2`}>
                    {item.label}
                  </div>
                  <div
                    className={`text-lg font-bold font-mono ${item.ok ? "text-primary" : "text-red-400"}`}
                  >
                    {item.value}
                  </div>
                  <div
                    className={`mt-2 w-2 h-2 rounded-full mx-auto ${item.ok ? "bg-primary animate-pulse" : "bg-red-400"}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Kết nối MQTT · Live
              </span>
              <span>·</span>
              <span>Box ID: BOX-0042</span>
              <span>·</span>
              <span>GPS: 10.7769° N, 106.7009° E</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features overview */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Tính năng chính
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hệ sinh thái IoT đầy đủ cho logistics hiện đại
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.color}`}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/features"
            className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
          >
            Xem chi tiết tính năng <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Lợi ích khi ứng dụng IoT
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Chuyển đổi logistics từ reactive sang proactive
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {b.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 rounded-2xl p-10 md:p-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Xem demo tương tác ngay để hiểu cách SmartBox giám sát kiện hàng
            theo thời gian thực.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/demo"
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Xem Demo Ngay
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-xl bg-secondary border border-border text-foreground font-medium text-sm hover:bg-secondary/70 transition-all"
            >
              Liên hệ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
