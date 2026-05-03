import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SmartBoxFormDialog({ onClose }) {
  const [form, setForm] = useState({
    box_id: `BOX-${Date.now().toString().slice(-4)}`,
    box_name: "",
    status: "Sẵn sàng",
    battery_level: 100,
    firmware_version: "v1.0.0",
    current_order_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 30).then((data) => {
      // Gợi ý những đơn mới tạo (Chờ xử lý hoặc Đang vận chuyển mà chưa có SmartBox)
      setRecentOrders(
        data.filter(
          (o) =>
            !o.smartbox_id &&
            (o.status === "Chờ xử lý" || o.status === "Đang vận chuyển"),
        ),
      );
    });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Nếu có gắn đơn hàng thì auto chuyển trạng thái thành Đang vận chuyển
    const finalStatus = form.current_order_id ? "Đang vận chuyển" : form.status;

    await base44.entities.SmartBox.create({
      ...form,
      status: finalStatus,
      last_seen: new Date().toISOString(),
    });

    // Cập nhật mã smartbox vào order nếu chọn
    if (form.current_order_id) {
      await base44.entities.Order.update(form.current_order_id, {
        smartbox_id: form.box_id,
        status: "Đang vận chuyển",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Thêm SmartBox mới
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Box ID">
            <Input
              value={form.box_id}
              onChange={(e) => set("box_id", e.target.value)}
              className="bg-secondary border-border font-mono"
              required
            />
          </Field>
          <Field label="Tên SmartBox">
            <Input
              value={form.box_name}
              onChange={(e) => set("box_name", e.target.value)}
              className="bg-secondary border-border"
              placeholder="VD: SmartBox Hà Nội 01"
              required
            />
          </Field>

          <Field label="Gắn với đơn hàng (Danh sách gợi ý)">
            <select
              value={form.current_order_id}
              onChange={(e) => set("current_order_id", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none"
            >
              <option value="">Không gắn đơn hàng nào</option>
              {recentOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_code} - Nhận: {o.receiver_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Trạng thái ban đầu">
            <select
              disabled={!!form.current_order_id}
              value={form.current_order_id ? "Đang vận chuyển" : form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none disabled:opacity-50"
            >
              {["Sẵn sàng", "Đang vận chuyển", "Bảo trì", "Ngoại tuyến"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Phiên bản Firmware">
            <Input
              value={form.firmware_version}
              onChange={(e) => set("firmware_version", e.target.value)}
              className="bg-secondary border-border font-mono"
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Đang lưu..." : "Thêm SmartBox"}
            </Button>
          </div>
        </form>
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
