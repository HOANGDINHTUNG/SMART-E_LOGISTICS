# Demo Runner - Cải tiến chi tiết (v2)

## 📊 Những thay đổi đã thực hiện

### 1. **Tăng dữ liệu Demo (5 phút)**

- **Đơn hàng**: 20 → **80** (tăng 4x)
- **SmartBox**: 20 → **40** (tăng 2x)
- **Cảnh báo**: 5% → **15%** tỷ lệ phát sinh (tăng 3x)

**File**: `src/utils/demoGenerator.js`

```javascript
ordersCount = 80; // tạo 80 đơn hàng trong 5 phút
boxesCount = 40; // tạo 40 smartbox trong 5 phút
alertChancePerTick = 0.15; // 15% cơ hội cảnh báo mỗi 3 giây
```

### 2. **Cảnh báo với Trạng thái "Chưa xử lý"**

- Tất cả demo alerts đều được gắn `is_resolved: false`
- Thêm `severity` (Cao / Khẩn cấp) theo tiêu chuẩn Việt
- Các cảnh báo sẽ hiển thị trong Dashboard > Alerts chưa được xử lý

**File**: `src/utils/demoGenerator.js`

```javascript
emit({
  type: "alert",
  alertId: `A-${Date.now()}`,
  severity: isWarning ? "Khẩn cấp" : "Cao",
  message: "...",
  is_resolved: false, // ← quan trọng
  ts: Date.now(),
});
```

### 3. **Thông báo Alert Đẹp & Nổi Bật**

#### 3.1 Styling Toast Alert

- Màu sắc **đỏ (red-500)** với shadow, border, ring nổi bật
- Icon cảnh báo: `⚠️ Cảnh báo [Mức độ]`
- Tự động detect variant "alert" từ nội dung

**File**: `src/components/ui/toast.jsx`

```javascript
alert: "group border-red-500/30 bg-red-500/10 text-red-600 shadow-red-500/20 shadow-md ring-1 ring-red-500/20";
```

#### 3.2 Auto-detect Alert Variant

- Nếu toast chứa từ "cảnh báo", "alert", "khẩn cấp" → áp dụng variant "alert" (đỏ)
- Từ "thành công", "success" → variant "success" (xanh)
- Từ "cảnh" → variant "warning" (vàng)

**File**: `src/components/ui/toaster.jsx`

```javascript
if (content.includes("cảnh báo") || content.includes("khẩn cấp")) {
  detectedVariant = "alert";
}
```

#### 3.3 Thời gian hiển thị

- **Cảnh báo (alert)**: 5 giây (dài hơn để chú ý)
- **Đơn hàng / SmartBox (success)**: 3 giây
- Tự động biến mất sau đó

**File**: `src/components/Layout.jsx`

```javascript
// Alerts: 5 giây
setTimeout(() => h.dismiss(), 5000);

// Orders/SmartBox: 3 giây
setTimeout(() => h.dismiss(), 3000);
```

### 4. **Khoảng Cách 10px Giữa Các Thông Báo**

Toast container hiện sử dụng `gap-[10px]` để cách các thông báo ra 10px

**File**: `src/components/ui/toast.jsx`

```javascript
className = "... flex ... gap-[10px] ...";
```

Khi nhiều thông báo xuất hiện cùng lúc:

```
┌─────────────────────────┐
│ ⚠️ Cảnh báo Khẩn cấp     │
│ High temperature 31°C   │
└─────────────────────────┘
    ↑ 10px gap ↓
┌─────────────────────────┐
│ 📦 Đơn mới MO001         │
│ Đã tạo đơn hàng         │
└─────────────────────────┘
    ↑ 10px gap ↓
┌─────────────────────────┐
│ 📱 SmartBox mới Box01    │
│ Thiết bị đã được thêm    │
└─────────────────────────┘
```

### 5. **Stagger Timing Tối Ưu**

- Toast stagger time: 700ms → **100ms** (nhanh hơn)
- Hiệu ứng slide-in từ top/bottom mượt mà hơn
- Giới hạn hiển thị: tối đa 5 toast đồng thời

---

## 🚀 Cách Sử Dụng

### Start Demo

```javascript
// Nhấp "Start Demo" button ở header
// hoặc chạy trong Console:
window.__demoRunner.start();
```

### Ngắn Demo

```javascript
window.__demoRunner.stop();
```

### Xem Demo Events (Dev Console)

```javascript
// Xem tất cả events đã lưu:
localStorage.getItem("smartbox_demo_events_v1");

// Xóa demo events:
localStorage.removeItem("smartbox_demo_events_v1");
```

---

## 📋 Dòng Thời Gian Trong 5 Phút

| Thời gian | Sự kiện                                            |
| --------- | -------------------------------------------------- |
| 0-3s      | Đơn hàng & SmartBox bắt đầu được tạo               |
| 10-20s    | Cảnh báo bắt đầu xuất hiện                         |
| 30s-4m    | Tạo liên tục 80 đơn + 40 SmartBox, ~20-30 cảnh báo |
| 4m-5m     | Status update: picked → shipped → delivered        |
| 5m        | Demo kết thúc, toasts clear                        |

---

## 🎨 Toast Variant Color Scheme

| Variant   | Màu sắc | Sử dụng                    |
| --------- | ------- | -------------------------- |
| `alert`   | 🔴 Đỏ   | Cảnh báo, lỗi              |
| `success` | 🟢 Xanh | Đơn hàng, SmartBox tạo mới |
| `warning` | 🟡 Vàng | Cảnh báo mức thấp          |
| `default` | ⚫ Xám  | Thông báo bình thường      |

---

## ✅ Checklist Xác Minh

- [x] 80 đơn hàng được tạo → kiểm tra Orders page
- [x] 40 SmartBox được tạo → kiểm tra SmartBoxes page
- [x] 15-30 cảnh báo chưa xử lý → kiểm tra Alerts page, is_resolved = false
- [x] Thông báo alert có màu đỏ, nổi bật, icon ⚠️
- [x] Thông báo cách 10px, tự động tắt (5s alerts, 3s others)
- [x] Tối đa 5 toast hiển thị cùng lúc

---

## 📝 Tệp Đã Thay Đổi

1. **src/utils/demoGenerator.js**
   - ordersCount: 20 → 80
   - boxesCount: 20 → 40
   - alertChancePerTick: 0.05 → 0.15
   - Thêm severity, is_resolved cho alerts

2. **src/components/ui/use-toast.jsx**
   - TOAST_STAGGER_MS: 700 → 100
   - Thêm TOAST_GAP_PX constant = 10

3. **src/components/ui/toast.jsx**
   - ToastProvider/ToastViewport: thêm `gap-[10px]`
   - Thêm toast variants: alert, warning, success

4. **src/components/ui/toaster.jsx**
   - Auto-detect variant từ title/description
   - Apply đúng variant khi render toast

5. **src/components/Layout.jsx**
   - Emit rich alerts (⚠️ icon, severity)
   - 5s timeout cho alerts vs 3s cho others
   - Thêm emoji icons cho toast titles
