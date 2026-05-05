import { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isMovingOrderStatus, resolveOrderGps } from '@/utils/locationResolver';

function buildSensorPayload(order, gpsResult) {
  const point = gpsResult.currentPoint;
  if (!point?.lat || !point?.lng) return null;

  const coldCargo = ['Dược phẩm', 'Thực phẩm đông lạnh'].some((type) =>
    order.cargo_type?.toLowerCase().includes(type.toLowerCase()),
  );

  return {
    id: `gps-${order.id}`,
    smartbox_id: order.smartbox_id || null,
    order_id: order.id,
    temperature: coldCargo ? 4.8 : 26.5,
    humidity: coldCargo ? 60 : 64,
    shock_g: order.status === 'Có sự cố' ? 1.2 : 0.08,
    latitude: point.lat,
    longitude: point.lng,
    battery: 100,
    is_open: false,
    place: point.label,
    timestamp: new Date().toISOString(),
    gps_generated: true,
  };
}

async function updateSmartBoxGps(order, sensorPayload) {
  if (!order.smartbox_id || !sensorPayload) return;

  const boxes = await base44.entities.SmartBox.filter(
    { box_id: order.smartbox_id },
    '-updated_date',
    1,
  );

  if (!boxes[0]) return;

  await base44.entities.SmartBox.update(boxes[0].id, {
    status: order.status === 'Đã giao' ? 'Sẵn sàng' : order.status,
    current_order_id: order.status === 'Đã giao' ? null : order.id,
    last_latitude: sensorPayload.latitude,
    last_longitude: sensorPayload.longitude,
    last_temperature: sensorPayload.temperature,
    last_humidity: sensorPayload.humidity,
    last_shock: sensorPayload.shock_g,
    battery_level: sensorPayload.battery,
    last_seen: sensorPayload.timestamp,
  });
}

export default function OrderFormDialog({ onClose }) {
  const [form, setForm] = useState({
    order_code: `ORD-${Date.now().toString().slice(-6)}`,
    sender_name: '',
    receiver_name: '',
    origin: '',
    origin_detail_address: '',
    origin_map_link: '',
    destination: '',
    destination_detail_address: '',
    destination_map_link: '',
    current_district: '',
    cargo_type: 'Thông thường',
    status: 'Chờ xử lý',
    smartbox_id: '',
    estimated_delivery: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const movingStatus = useMemo(() => isMovingOrderStatus(form.status), [form.status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const gpsResult = resolveOrderGps(form);
      const payload = {
        ...form,
        ...gpsResult.orderPatch,
        smartbox_id: form.smartbox_id || null,
      };

      const savedOrder = await base44.entities.Order.create(payload);
      const sensorPayload = buildSensorPayload(savedOrder, gpsResult);

      if (sensorPayload) {
        await base44.entities.SensorData.create(sensorPayload);
        await updateSmartBoxGps(savedOrder, sensorPayload);
      }

      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Người gửi">
              <Input value={form.sender_name} onChange={e => set('sender_name', e.target.value)} className="bg-secondary border-border" required />
            </Field>
            <Field label="Người nhận">
              <Input value={form.receiver_name} onChange={e => set('receiver_name', e.target.value)} className="bg-secondary border-border" required />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/20 p-3">
              <Field label="Xuất phát / Tỉnh, thành hoặc kho">
                <Input value={form.origin} onChange={e => set('origin', e.target.value)} className="bg-secondary border-border" placeholder="VD: Bình Thạnh, TP.HCM" required />
              </Field>
              <Field label="Địa điểm cụ thể tại điểm xuất phát">
                <Input
                  value={form.origin_detail_address}
                  onChange={e => set('origin_detail_address', e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="VD: 561A Điện Biên Phủ, Thạnh Mỹ Tây..."
                  required
                />
              </Field>
              <Field label="Link Google Maps điểm xuất phát">
                <Input
                  value={form.origin_map_link}
                  onChange={e => set('origin_map_link', e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Dán link Google Maps hoặc để trống nếu đã nhập địa chỉ"
                />
              </Field>
            </div>

            <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/20 p-3">
              <Field label="Điểm đến / Tỉnh, thành hoặc kho">
                <Input value={form.destination} onChange={e => set('destination', e.target.value)} className="bg-secondary border-border" placeholder="VD: Quận 10, TP.HCM" required />
              </Field>
              <Field label="Địa điểm cụ thể tại điểm đến">
                <Input
                  value={form.destination_detail_address}
                  onChange={e => set('destination_detail_address', e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="VD: 23 Đường 3/2, Quận 10..."
                  required
                />
              </Field>
              <Field label="Link Google Maps điểm đến">
                <Input
                  value={form.destination_map_link}
                  onChange={e => set('destination_map_link', e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Dán link Google Maps hoặc để trống nếu đã nhập địa chỉ"
                />
              </Field>
            </div>
          </div>

          <div className="flex gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p>
              GPS sẽ tự tính theo trạng thái: Chờ xử lý lấy điểm xuất phát, Đã giao lấy điểm đến,
              còn Đang vận chuyển/Có sự cố/Hủy sẽ lấy khu vực hiện tại hoặc một điểm mô phỏng trên tuyến đường.
              Link Google Maps dạng đầy đủ có tọa độ <span className="font-mono">@lat,lng</span> sẽ chính xác nhất.
            </p>
          </div>

          {movingStatus && (
            <Field label="Khu vực GPS hiện tại khi đơn đang vận chuyển / sự cố / hủy">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={form.current_district}
                  onChange={e => set('current_district', e.target.value)}
                  className="bg-secondary border-border pl-9"
                  placeholder="VD: Quận 10, Bình Thạnh, Hải Châu... Nếu trống hệ thống lấy điểm giữa tuyến."
                />
              </div>
            </Field>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <Input value={form.smartbox_id} onChange={e => set('smartbox_id', e.target.value)} className="bg-secondary border-border" placeholder="VD: SBX-001" />
          </Field>
          <Field label="Dự kiến giao">
            <Input type="date" value={form.estimated_delivery} onChange={e => set('estimated_delivery', e.target.value)} className="bg-secondary border-border" />
          </Field>
          <Field label="Ghi chú">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none resize-none h-20" />
          </Field>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

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
