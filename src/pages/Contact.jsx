import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

const faqs = [
  {
    q: "SmartBox E-Logistics hoạt động như thế nào?",
    a: "Mỗi hộp hàng tích hợp module ESP32 với cảm biến GPS, nhiệt độ, độ ẩm và gia tốc. Dữ liệu gửi về server qua MQTT mỗi 30 giây và hiển thị real-time trên dashboard web.",
  },
  {
    q: "Làm thế nào để theo dõi đơn hàng của tôi?",
    a: "Bạn có thể tra cứu bằng mã đơn hàng trên trang Demo, hoặc quét mã QR in trên hộp để xem trạng thái tức thì mà không cần đăng nhập.",
  },
  {
    q: "Hệ thống có hỗ trợ thiết bị IoT thực tế không?",
    a: "Có. Hệ thống hỗ trợ kết nối thiết bị phần cứng thực tế qua MQTT. Thiết bị cần publish JSON payload lên topic smartbox/{box_id}/data.",
  },
  {
    q: "Dữ liệu cảm biến được lưu trữ trong bao lâu?",
    a: "Dữ liệu sensor được lưu trữ đầy đủ theo chuỗi thời gian. Lịch sử GPS lên tới 30 ngày, dữ liệu cảm biến lưu vô thời hạn theo đơn hàng.",
  },
  {
    q: "Tôi có thể tùy chỉnh ngưỡng cảnh báo không?",
    a: "Có. Mỗi loại hàng hóa có thể cài đặt ngưỡng cảnh báo riêng cho nhiệt độ, độ ẩm và va chạm.",
  },
  {
    q: "Độ trễ của dữ liệu là bao nhiêu?",
    a: "Dữ liệu cảm biến được push realtime qua WebSocket với độ trễ dưới 500ms từ thiết bị IoT đến dashboard.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Gửi yêu cầu thành công!", {
      description: "Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Liên hệ &amp; Hỗ trợ
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Đội ngũ kỹ thuật của SmartBox E-Logistics sẵn sàng hỗ trợ bạn 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-foreground">
            Thông tin liên hệ
          </h2>
          {[
            {
              icon: Mail,
              label: "Email hỗ trợ",
              value: "smartboxelogistics.vn",
              sub: "Phản hồi trong 24h",
            },
            {
              icon: Phone,
              label: "Hotline khẩn cấp",
              value: "1900 040506",
              sub: "24/7 · Miễn phí",
            },
            {
              icon: MessageCircle,
              label: "Live Chat",
              value: "Zalo / Teams",
              sub: "Giờ hành chính",
            },
            {
              icon: MapPin,
              label: "Địa chỉ",
              value: "Số 2 Võ Oanh, Phường Thạnh Mỹ Tây, TP.HCM",
              sub: "Văn phòng chính",
            },
            {
              icon: Clock,
              label: "Giờ làm việc",
              value: "T2 - T6: 8:00 - 17:30",
              sub: "GMT+7",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex gap-3 p-4 bg-card border border-border rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground/60">
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-7">
            <h2 className="text-base font-semibold text-foreground mb-6">
              Gửi yêu cầu hỗ trợ
            </h2>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Gửi thành công!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc tới địa chỉ
                  email của bạn.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-xs text-primary hover:underline"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Họ và tên">
                    <Input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="bg-secondary border-border"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="bg-secondary border-border"
                      placeholder="email@company.com"
                      required
                    />
                  </Field>
                </div>
                <Field label="Chủ đề">
                  <select
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none"
                  >
                    <option value="">Chọn vấn đề cần hỗ trợ</option>
                    <option>Lỗi kết nối thiết bị IoT</option>
                    <option>Hỏi về tích hợp MQTT</option>
                    <option>Vấn đề cảnh báo sai</option>
                    <option>Yêu cầu tính năng mới</option>
                    <option>Báo lỗi hệ thống</option>
                    <option>Khác</option>
                  </select>
                </Field>
                <Field label="Nội dung chi tiết">
                  <textarea
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none resize-none h-32"
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    required
                  />
                </Field>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Gửi yêu cầu
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
          Câu hỏi thường gặp
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground pr-4">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
