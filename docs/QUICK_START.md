# 🚀 Quick Start - Demo Runner v2

## ⚡ Bắt đầu nhanh

### 1. Chạy Dev Server

```bash
npm run dev
```

Ứng dụng sẽ mở tại `http://localhost:5174`

### 2. Bắt đầu Demo (5 phút)

**Cách 1: Click nút trong UI**

- Tìm nút "Start Demo" ở header
- Click để chạy, countdown hiển thị
- Tự động dừng sau 5 phút

**Cách 2: Dùng Console (DevTools F12)**

```javascript
// Bắt đầu
window.__demoRunner.start();

// Dừng
window.__demoRunner.stop();
```

---

## 📊 Dữ Liệu Trong 5 Phút

| Loại                 | Số lượng          | Trang xem                |
| -------------------- | ----------------- | ------------------------ |
| 📦 Đơn hàng          | **80**            | Orders                   |
| 📱 SmartBox          | **40**            | SmartBoxes               |
| ⚠️ Cảnh báo          | **20-30**         | Alerts, Dashboard        |
| 📊 Orders → SmartBox | **~60/80** linked | Orders (SmartBox column) |

---

## 🎨 Thông Báo Toast

### 🔴 Alert (Cảnh báo)

- **Màu**: Đỏ nổi bật
- **Icon**: ⚠️
- **Thời gian**: 5 giây
- **Ví dụ**: "⚠️ Cảnh báo Khẩn cấp - High temperature 31°C"

### 🟢 Order/SmartBox

- **Màu**: Xanh lục
- **Icon**: 📦 / 📱
- **Thời gian**: 3 giây
- **Ví dụ**: "📦 Đơn mới MO045 - Đã tạo đơn hàng"

### 📏 Khoảng cách

- **Giữa các toast**: 10px
- **Hiển thị tối đa**: 5 toast cùng lúc
- **Stagger delay**: 100ms

---

## 🔍 Kiểm Tra Dữ Liệu

### Dashboard

```
✅ Total Orders: 80
✅ Active Orders: ~40
✅ Unresolved Alerts: 20-30
✅ Smart Boxes: 40
✅ Active Boxes: ~20
```

### Orders Page

```
✅ Xem 80 đơn hàng
✅ Mỗi đơn có SmartBox ID (60-70%)
✅ Status: Chờ xử lý → Đang vận chuyển → Đã giao
✅ Có suborders (parent-child relationships)
```

### SmartBoxes Page

```
✅ Xem 40 thiết bị
✅ Pin: 20-90%
✅ Nhiệt độ: 20-31°C
✅ Trạng thái: Sẵn sàng / Đang vận chuyển / Ngoài tuyến
✅ "Xem đơn hàng" link (nếu có current_order_id)
```

### Alerts Page

```
✅ 20-30 cảnh báo
✅ Tất cả: is_resolved = false (❌ Chưa xử lý)
✅ Severity: Cao / Khẩn cấp
✅ Type: High temperature, Độ ẩm bất thường
✅ Timestamp: Just now → 5 min ago
```

---

## 🛠️ Debug Tips

### Xem Events Được Tạo

```javascript
// DevTools Console:
JSON.parse(localStorage.getItem("smartbox_demo_events_v1")).length;
// Output: ~200 (80 orders + 40 boxes + 20-30 alerts + suborders/updates)
```

### Xem Real-time Events

```javascript
// Listen to demo events
window.addEventListener("demo:event", (e) => {
  console.log("Demo event:", e.detail);
});
```

### Check Toast System

```javascript
// View toast config
const { TOAST_LIMIT } = require("@/components/ui/use-toast");
console.log("Max toasts:", TOAST_LIMIT); // 5
console.log("Gap:", "10px");
```

### Check Demo State

```javascript
// Xem trạng thái runner
window.__demoRunner;
// Output: {start: ƒ, stop: ƒ}
```

---

## 📋 Feature Checklist

### Data Generation ✅

- [x] 80 đơn hàng trong 5 phút
- [x] 40 SmartBox trong 5 phút
- [x] 20-30 cảnh báo
- [x] Status transitions: created → picked → shipped → delivered
- [x] Order ↔ SmartBox linking (60-70%)

### Alert System ✅

- [x] is_resolved = false (chưa xử lý)
- [x] severity: Cao / Khẩn cấp
- [x] Message: Vietnamese (Cảnh báo: Nhiệt độ quá cao)
- [x] Hiển thị trong Alerts page với filter

### Toast Notifications ✅

- [x] 🔴 Alert toast (đỏ, 5s)
- [x] 🟢 Order/SmartBox toast (xanh, 3s)
- [x] 10px gap giữa toasts
- [x] Tối đa 5 toast hiển thị
- [x] Auto-dismiss
- [x] Auto-detect variant từ content
- [x] Emoji icons (⚠️ 📦 📱)

### Persistence ✅

- [x] Events lưu localStorage
- [x] Export/import demo events
- [x] Manual clear option

---

## 🎯 Performance Tips

### Nếu demo chạy chậm:

```javascript
// Giảm số lượng orders/boxes
window.__demoRunner.start({
  generatorOptions: {
    ordersCount: 40, // từ 80
    boxesCount: 20, // từ 40
    alertChancePerTick: 0.1, // từ 0.15
  },
});
```

### Nếu toasts gây lag:

```javascript
// Reduce max toasts
// Edit: src/components/ui/use-toast.jsx
// const TOAST_LIMIT = 3;  // từ 5
```

---

## 🔗 Related Files

```
src/
├── components/
│   ├── Layout.jsx              (demo listeners, toast emits)
│   ├── StartDemoButton.jsx     (UI button)
│   └── ui/
│       ├── use-toast.jsx       (toast manager, constants)
│       ├── toast.jsx           (toast variants, styling)
│       └── toaster.jsx         (toast renderer, auto-detect)
├── hooks/
│   └── useDemoRunner.jsx       (demo lifecycle, countdown)
├── lib/
│   └── demoStorage.js          (localStorage wrapper)
├── pages/
│   ├── Orders.jsx              (listen demo:event)
│   ├── Dashboard.jsx           (listen demo:event)
│   ├── SmartBoxes.jsx          (listen demo:event)
│   └── Alerts.jsx              (display alerts)
└── utils/
    └── demoGenerator.js        (emit events, paced generation)

docs/
├── demo-runner.md
├── DEMO_IMPROVEMENTS.md        (this file + v1→v2)
└── CODE_DETAILS.md             (detailed code review)
```

---

## 📞 Support

### Common Issues

**Q: Demo không tạo dữ liệu**
A: Kiểm tra:

1. Dev server chạy (console không lỗi)
2. localStorage không disabled
3. Demo time > 0
4. Check DevTools > Application > Local Storage

**Q: Toast không hiển thị**
A: Kiểm tra:

1. Toaster component được render (App.jsx)
2. useToast hook hoạt động
3. CSS: gap-[10px] có trong toast.jsx
4. z-index: 100 (over other elements)

**Q: Cảnh báo không đánh dấu "Chưa xử lý"**
A: Kiểm tra:

1. is_resolved: false trong demoGenerator.js
2. Alerts page hiển thị filter
3. Dashboard > Alerts section

**Q: SmartBox không link Order**
A: Kiểm tra:

1. Xem Orders > SmartBox column (có ID hay —?)
2. SmartBoxes > Card > "Xem đơn hàng" link
3. current_order_id được emit với smartbox event

---

## 🎓 Learning Path

1. **Start**: Click "Start Demo" button
2. **Watch**: Toast notifications xuất hiện (5s)
3. **Check**: Orders page → 80 items
4. **Check**: SmartBoxes page → 40 items, links working
5. **Check**: Alerts page → 20-30 unresolved alerts
6. **Check**: Dashboard → stats updated
7. **Debug**: Dev Console → localStorage events
8. **Stop**: Click "Stop Demo" (auto-clear toasts)

---

## 📈 Next Steps (Optional)

- [ ] Add DemoLogs viewer (UI to browse persisted events)
- [ ] Add preset demo profiles (fast/normal/slow)
- [ ] Add UI controls for ordersCount/boxesCount/alertChance
- [ ] Export demo data to CSV/JSON
- [ ] Replay demo from saved events
- [ ] Real-time event chart (events/sec graph)

---

## ✨ Version History

| Version | Date     | Changes                                                                       |
| ------- | -------- | ----------------------------------------------------------------------------- |
| v1      | May 2024 | Initial demo runner, 20 orders, 20 boxes, basic toasts                        |
| v2      | May 2026 | 4x orders (80), 2x boxes (40), 3x alerts, rich styling, 10px gap, auto-detect |

---

**Enjoy testing! 🚀**
