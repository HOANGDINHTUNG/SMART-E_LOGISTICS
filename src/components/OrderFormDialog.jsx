import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OrderFormDialog({ onClose }) {
  const [form, setForm] = useState({
    order_code: `ORD-${Date.now().toString().slice(-6)}`,
    sender_name: '',
    receiver_name: '',
    origin: '',
    destination: '',
    cargo_type: 'Thông thường',
    status: 'Chờ xử lý',
    smartbox_id: '',
    estimated_delivery: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Order.create(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Tạo đơn hàng mới</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Mã đơn hàng">
            <Input value={form.order_code} onChange={e => set('order_code', e.target.value)} className="bg-secondary border-border" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Người gửi">
              <Input value={form.sender_name} onChange={e => set('sender_name', e.target.value)} className="bg-secondary border-border" required />
            </Field>
            <Field label="Người nhận">
              <Input value={form.receiver_name} onChange={e => set('receiver_name', e.target.value)} className="bg-secondary border-border" required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Xuất phát">
              <Input value={form.origin} onChange={e => set('origin', e.target.value)} className="bg-secondary border-border" required />
            </Field>
            <Field label="Điểm đến">
              <Input value={form.destination} onChange={e => set('destination', e.target.value)} className="bg-secondary border-border" required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại hàng hóa">
              <select value={form.cargo_type} onChange={e => set('cargo_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none">
                {['Dược phẩm', 'Thực phẩm đông lạnh', 'Hóa chất', 'Điện tử', 'Thông thường'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none">
                {['Chờ xử lý', 'Đang vận chuyển', 'Đã giao', 'Có sự cố', 'Hủy'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="SmartBox ID (nếu có)">
            <Input value={form.smartbox_id} onChange={e => set('smartbox_id', e.target.value)} className="bg-secondary border-border" placeholder="VD: BOX-001" />
          </Field>
          <Field label="Dự kiến giao">
            <Input type="date" value={form.estimated_delivery} onChange={e => set('estimated_delivery', e.target.value)} className="bg-secondary border-border" />
          </Field>
          <Field label="Ghi chú">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none resize-none h-20" />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Hủy</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Đang lưu...' : 'Tạo đơn hàng'}
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
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}