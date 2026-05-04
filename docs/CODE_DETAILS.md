# 🎯 Chi Tiết Code - Demo Runner v2

## 📊 Dữ liệu Demo Được Tạo Trong 5 Phút

### Trước (v1) vs Sau (v2)

```
┌─────────────────┬────────┬────────┐
│  Loại dữ liệu   │  v1    │  v2    │
├─────────────────┼────────┼────────┤
│ Đơn hàng        │ 20     │ 80 ⬆️  │
│ SmartBox        │ 20     │ 40 ⬆️  │
│ Cảnh báo %      │ 5%     │ 15% ⬆️ │
│ Cảnh báo ~số    │ 3-5    │ 20-30  │
└─────────────────┴────────┴────────┘
```

---

## 🔧 Cấu Hình Chi Tiết

### 1️⃣ Demo Generator: `src/utils/demoGenerator.js`

**Tham số khởi tạo:**

```javascript
startDemoGenerator(emit, {
  totalDuration: 300000, // 5 phút
  ordersCount: 80, // ✨ NEW: tạo 80 đơn hàng
  boxesCount: 40, // ✨ NEW: tạo 40 SmartBox
  alertChancePerTick: 0.15, // ✨ NEW: 15% cơ hội cảnh báo
  sensorInterval: 2000, // đọc cảm biến mỗi 2s
});
```

**Alert Event Structure:**

```javascript
{
  type: "alert",
  alertId: "A-1621234567890",
  severity: "Khẩn cấp",        // "Cao" hoặc "Khẩn cấp"
  message: "Cảnh báo: Nhiệt độ quá cao",
  is_resolved: false,            // ✨ NEW: đánh dấu chưa xử lý
  level: "critical",             // "critical" hoặc "warning"
  ts: 1621234567890,
}
```

**Order Event Structure:**

```javascript
{
  type: "order",
  orderId: "MO-1621234567890-1",
  status: "created",
  data: {
    order_code: "MO001",
    sender_name: "Demo Sender",
    receiver_name: "Demo Receiver",
    origin: "Warehouse A",
    destination: "Customer",
    cargo_type: "General",
    status: "Chờ xử lý",
    smartbox_id: "MB-1621234567890-5",  // linked SmartBox
  },
  ts: 1621234567890,
}
```

---

### 2️⃣ Toast System: `src/components/ui/use-toast.jsx`

**Constants:**

```javascript
const TOAST_LIMIT = 5; // tối đa 5 toast hiển thị
const TOAST_REMOVE_DELAY = 3000; // tự động tắt 3 giây
const TOAST_STAGGER_MS = 100; // ✨ NEW: 100ms stagger (nhanh hơn)
const TOAST_GAP_PX = 10; // ✨ NEW: 10px gap (khoảng cách)
```

**Toast Function Signature:**

```javascript
const h = toast({
  title: string,              // Tiêu đề ("⚠️ Cảnh báo Khẩn cấp")
  description: string,        // Nội dung ("High temperature...")
  variant?: 'default' | 'alert' | 'success' | 'warning',
  action?: React.ReactNode,   // Optional action button
});

// Return value:
{
  id: string,
  dismiss: () => void,        // Đóng thủ công
  update: (props) => void,    // Cập nhật nội dung
}
```

**Stagger Logic:**

- Toast thứ 1: xuất hiện lập tức
- Toast thứ 2: delay 100ms (TOAST_STAGGER_MS)
- Toast thứ 3: delay 200ms
- Toast thứ 4: delay 300ms
- Toast thứ 5: delay 400ms
- Toast thứ 6+: pending (đợi toast cũ tắt)

---

### 3️⃣ Toast Styling: `src/components/ui/toast.jsx`

**Toast Variants:**

```javascript
// 🔴 Alert (Đỏ) - dùng cho cảnh báo
alert: "group border-red-500/30 bg-red-500/10 text-red-600 shadow-red-500/20 shadow-md ring-1 ring-red-500/20"

// 🟢 Success (Xanh) - dùng cho tạo mới
success: "group border-green-500/30 bg-green-500/10 text-green-600 shadow-green-500/20 shadow-md ring-1 ring-green-500/20"

// 🟡 Warning (Vàng) - dùng cho cảnh báo mức thấp
warning: "group border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-amber-500/20 shadow-md ring-1 ring-amber-500/20"

// ⚫ Default (Xám) - thông báo bình thường
default: "border bg-background text-foreground"
```

**Container Styling:**

```javascript
// gap-[10px] = khoảng cách 10px giữa các toast
className =
  "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-[10px] p-4 ...";
```

---

### 4️⃣ Auto-Detect Variant: `src/components/ui/toaster.jsx`

**Logic:**

```javascript
const titleLower = (title || "").toLowerCase();
const descLower = (description || "").toLowerCase();
const content = titleLower + " " + descLower;

// Auto-detect từ nội dung
if (content.includes("cảnh báo") || content.includes("khẩn cấp")) {
  variant = "alert"; // 🔴 đỏ
} else if (content.includes("thành công") || content.includes("đã")) {
  variant = "success"; // 🟢 xanh
} else if (content.includes("cảnh")) {
  variant = "warning"; // 🟡 vàng
}
```

**Ví dụ Detection:**

| Title                  | Description             | Detected Variant |
| ---------------------- | ----------------------- | ---------------- |
| "⚠️ Cảnh báo Khẩn cấp" | "High temperature"      | `alert` 🔴       |
| "📦 Đơn mới MO001"     | "Đã tạo đơn hàng"       | `success` 🟢     |
| "📱 SmartBox mới"      | "Thiết bị đã được thêm" | `success` 🟢     |

---

### 5️⃣ Demo Event Listeners: `src/components/Layout.jsx`

**Alert Toast:**

```javascript
if (evt.type === "alert") {
  const severity = evt.severity || "Cao";
  const msg = evt.message || "Có cảnh báo từ hệ thống";

  const h = toast({
    title: `⚠️ Cảnh báo ${severity}`,
    description: msg,
    variant: "alert",
  });

  // Cảnh báo: 5 giây (lâu hơn để chú ý)
  setTimeout(() => h.dismiss(), 5000);
}
```

**Order Toast:**

```javascript
if (evt.type === "order" && evt.status === "created") {
  const h = toast({
    title: `📦 Đơn mới ${evt.data?.order_code}`,
    description: "Đã tạo đơn hàng",
    variant: "success",
  });

  // Đơn hàng: 3 giây (ngắn hơn)
  setTimeout(() => h.dismiss(), 3000);
}
```

**SmartBox Toast:**

```javascript
if (evt.type === "smartbox" && evt.action === "create") {
  const h = toast({
    title: `📱 SmartBox mới ${evt.data?.box_name}`,
    description: "Thiết bị đã được thêm",
    variant: "success",
  });

  // SmartBox: 3 giây
  setTimeout(() => h.dismiss(), 3000);
}
```

---

## 📺 Ví Dụ UI - Khi chạy Demo

### Thời điểm: 10 giây (đang chạy)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚠️ Cảnh báo Khẩn cấp         ┃  ← 5 giây (alert - đỏ)
┃ High temperature 31°C        ┃
┃ on S-3                  [✕]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        ↑ gap-[10px] ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📦 Đơn mới MO045             ┃  ← 3 giây (success - xanh)
┃ Đã tạo đơn hàng          [✕]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        ↑ gap-[10px] ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📱 SmartBox mới MockBox 22   ┃  ← 3 giây (success - xanh)
┃ Thiết bị đã được thêm    [✕]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Dashboard - Alerts Tab

```
📊 ALERTS (20-30 cảnh báo trong 5 phút)

🔴 | Khẩn cấp | High temperature 31°C... | ⏰ Just now | ❌ Chưa xử lý
🟠 | Cao      | Độ ẩm bất thường...      | ⏰ 2s ago   | ❌ Chưa xử lý
🔴 | Khẩn cấp | Cảnh báo: Nhiệt độ quá cao| ⏰ 5s ago  | ❌ Chưa xử lý
```

### Orders Tab

```
📋 ORDERS (80 đơn hàng trong 5 phút)

MO001 | Demo Sender → Customer | Warehouse A → Customer | Chờ xử lý  | MB-1234...
MO002 | Demo Sender → Customer | Warehouse A → Customer | Đang vận...| MB-5678...
...
MO080 | Demo Sender → Customer | Warehouse A → Customer | Đã giao    | (none)
```

### SmartBoxes Tab

```
🔲 SMARTBOXES (40 thiết bị trong 5 phút)

📱 MockBox 1    | 🟢 Sẵn sàng  | Nhiệt độ: 25.3°C | Pin: 72% | Đơn: MO045
📱 MockBox 2    | 🟢 Sẵn sàng  | Nhiệt độ: 24.1°C | Pin: 68% | Đơn: MO067
📱 MockBox 3    | 🟡 Đang vận..| Nhiệt độ: 28.5°C | Pin: 45% | Đơn: MO023
...
📱 MockBox 40   | ⚫ Ngoài tuyến| Nhiệt độ: —     | Pin: 5%  | (none)
```

---

## 💾 Lưu Trữ & Debug

### LocalStorage

```javascript
// Key: smartbox_demo_events_v1
// Chứa: JSON array của tất cả demo events

// Xem trong DevTools:
JSON.parse(localStorage.getItem('smartbox_demo_events_v1'))

// Kết quả:
[
  { type: "order", orderId: "MO-123", status: "created", data: {...}, ts: 1621... },
  { type: "alert", alertId: "A-456", severity: "Khẩn cấp", message: "...", is_resolved: false, ts: 1621... },
  { type: "smartbox", action: "create", data: {...}, ts: 1621... },
  ...
]
```

### Debug Helpers

```javascript
// Bắt đầu demo (5 phút, 80 orders, 40 boxes)
window.__demoRunner.start();

// Dừng demo
window.__demoRunner.stop();

// Xem events (trong console)
window.__demoRunner;

// Output:
// {start: ƒ, stop: ƒ}
```

---

## 🎨 Màu sắc Scheme

| Element        | Màu          | Hex                    | Sử dụng      |
| -------------- | ------------ | ---------------------- | ------------ |
| Alert bg       | Red-500/10   | rgba(239, 68, 68, 0.1) | Nền alert    |
| Alert border   | Red-500/30   | rgba(239, 68, 68, 0.3) | Viền alert   |
| Alert text     | Red-600      | #DC2626                | Chữ alert    |
| Alert shadow   | Red-500/20   | rgba(239, 68, 68, 0.2) | Bóng alert   |
| Success bg     | Green-500/10 | rgba(34, 197, 94, 0.1) | Nền success  |
| Success border | Green-500/30 | rgba(34, 197, 94, 0.3) | Viền success |
| Success text   | Green-600    | #16A34A                | Chữ success  |

---

## ⏱️ Timeline Chi Tiết (5 phút = 300 giây)

```
0s ──────→ 30s
│ Bắt đầu demo
│ Đơn/Box bắt đầu tạo
│ Cảnh báo hiếm
│
│
30s ──────→ 150s
│ Tạo liên tục
│ 20-30 cảnh báo
│ Orders: picked status
│
│
150s ─────→ 270s
│ Tạo 60-70 orders + 30-40 boxes
│ Orders: shipped status
│ Cảnh báo: 15-20 lần
│
│
270s ─────→ 300s (5 min)
│ Hoàn tất tạo
│ Orders: delivered status
│ Demo kết thúc → clearToasts()
```

---

## 📝 Tóm Tắt Code Changes

| File               | Thay đổi                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `demoGenerator.js` | +ordersCount, +boxesCount, +alertChancePerTick, +is_resolved, +severity |
| `use-toast.jsx`    | +TOAST_GAP_PX, -TOAST_STAGGER_MS (700→100)                              |
| `toast.jsx`        | +gap-[10px], +alert/success/warning variants                            |
| `toaster.jsx`      | +auto-detect variant logic                                              |
| `Layout.jsx`       | +emit rich alerts, +⚠️📦📱 icons, +5s timeout alerts                    |
