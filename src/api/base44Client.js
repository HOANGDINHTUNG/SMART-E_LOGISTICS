// src/api/base44Client.js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initialSmartBoxes = [
  {
    id: "1",
    box_id: "SBX-001",
    box_name: "Alpha Box",
    status: "Đang vận chuyển",
    current_order_id: "o1",
    last_latitude: 21.0285,
    last_longitude: 105.8542,
    last_temperature: 5.2,
    last_humidity: 60,
    last_shock: 0.1,
    battery_level: 85,
    firmware_version: "v1.4.2",
    last_seen: new Date().toISOString(),
  },
  {
    id: "2",
    box_id: "SBX-002",
    box_name: "Beta Box",
    status: "Sẵn sàng",
    current_order_id: null,
    last_latitude: null,
    last_longitude: null,
    last_temperature: null,
    last_humidity: null,
    last_shock: null,
    battery_level: 100,
    firmware_version: "v1.4.2",
    last_seen: new Date().toISOString(),
  },
  {
    id: "3",
    box_id: "SBX-003",
    box_name: "Gamma Box",
    status: "Bảo trì",
    current_order_id: "o4",
    last_latitude: 10.7626,
    last_longitude: 106.6601,
    last_temperature: 28.5,
    last_humidity: 80,
    last_shock: 2.1,
    battery_level: 12,
    firmware_version: "v1.2.0",
    last_seen: new Date().toISOString(),
  },
  {
    id: "4",
    box_id: "SBX-004",
    box_name: "Delta Box",
    status: "Ngoại tuyến",
    current_order_id: null,
    last_latitude: 16.0544,
    last_longitude: 108.2022,
    last_temperature: -18.5,
    last_humidity: 45,
    last_shock: 0.0,
    battery_level: 55,
    firmware_version: "v1.4.2",
    last_seen: new Date(Date.now() - 86400000).toISOString(),
  },
];

const initialOrders = [
  {
    id: "o1",
    order_code: "ORD-100234",
    sender_name: "Công ty Dược ViNa",
    receiver_name: "Bệnh viện Bạch Mai",
    origin: "Hà Nội",
    destination: "Đà Nẵng",
    cargo_type: "Dược phẩm",
    status: "Đang vận chuyển",
    smartbox_id: "SBX-001",
    estimated_delivery: "2026-05-05",
    notes: "Giao hàng vắc xin cần giữ lạnh liên tục",
  },
  {
    id: "o2",
    order_code: "ORD-100235",
    sender_name: "Hải Sản SG",
    receiver_name: "Đại lý Cần Thơ",
    origin: "TP.HCM",
    destination: "Cần Thơ",
    cargo_type: "Thực phẩm đông lạnh",
    status: "Đã giao",
    smartbox_id: "SBX-002",
    estimated_delivery: "2026-05-02",
    notes: "",
  },
  {
    id: "o3",
    order_code: "ORD-100236",
    sender_name: "Tech Viet",
    receiver_name: "Trạm lưu trữ Miền Trung",
    origin: "Đà Nẵng",
    destination: "Nha Trang",
    cargo_type: "Điện tử",
    status: "Chờ xử lý",
    smartbox_id: null,
    estimated_delivery: "2026-05-10",
    notes: "Hàng dễ vỡ",
  },
  {
    id: "o4",
    order_code: "ORD-100237",
    sender_name: "Hóa chất miền Nam",
    receiver_name: "KCN Bình Dương",
    origin: "Đồng Nai",
    destination: "Bình Dương",
    cargo_type: "Hóa chất",
    status: "Có sự cố",
    smartbox_id: "SBX-003",
    estimated_delivery: "2026-05-01",
    notes: "Phát hiện va chạm mạnh",
  },
  {
    id: "o5",
    order_code: "ORD-100238",
    sender_name: "Shopee Hub",
    receiver_name: "Kho HN v2",
    origin: "Hải Phòng",
    destination: "Hà Nội",
    cargo_type: "Thông thường",
    status: "Hủy",
    smartbox_id: null,
    estimated_delivery: "2026-05-04",
    notes: "Khách hàng đổi ý",
  },
];

const initialAlerts = [
  {
    id: "a1",
    smartbox_id: "SBX-001",
    order_id: "o1",
    alert_type: "Nhiệt độ vượt ngưỡng",
    severity: "Cao",
    message: "Nhiệt độ đo được 9.5°C vượt ngưỡng 8°C cho Dược phẩm.",
    value: 9.5,
    threshold: 8,
    is_resolved: false,
    created_date: new Date().toISOString(),
  },
  {
    id: "a2",
    smartbox_id: "SBX-003",
    order_id: "o4",
    alert_type: "Va chạm mạnh",
    severity: "Khẩn cấp",
    message: "Phát hiện gia tốc 2.1G. Có khả năng rơi vỡ hàng hóa.",
    value: 2.1,
    threshold: 1.5,
    is_resolved: true,
    resolved_at: new Date().toISOString(),
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "a3",
    smartbox_id: "SBX-004",
    order_id: null,
    alert_type: "Pin yếu",
    severity: "Trung bình",
    message: "Dung lượng pin giảm xuống dưới ngưỡng an toàn (15%).",
    value: 12,
    threshold: 15,
    is_resolved: false,
    created_date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "a4",
    smartbox_id: "SBX-004",
    order_id: null,
    alert_type: "Mất tín hiệu GPS",
    severity: "Cao",
    message: "Không bắt được sóng GPS trong hơn 24 giờ.",
    value: 0,
    threshold: 0,
    is_resolved: false,
    created_date: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Seed 24 past sensor records for chart
const initialSensorData = Array.from({ length: 24 }).map((_, i) => ({
  id: `s${i}`,
  smartbox_id: "SBX-001",
  order_id: "o1",
  temperature: +(4 + Math.random() * 2).toFixed(1),
  humidity: +(55 + Math.random() * 10).toFixed(1),
  shock_g: +(Math.random() * 0.2).toFixed(2),
  latitude: 21.0285 - (24 - i) * 0.01,
  longitude: 105.8542 + (24 - i) * 0.01,
  battery: +(85 - (24 - i) * 0.1).toFixed(1),
  is_open: i === 12 ? true : false,
  timestamp: new Date(Date.now() - (24 - i) * 60000).toISOString(),
}));

const getLocalData = (key, defaultData) => {
  const data = localStorage.getItem(`smartbox_${key}`);
  return data ? JSON.parse(data) : defaultData;
};

const saveLocalData = (key, data) => {
  localStorage.setItem(`smartbox_${key}`, JSON.stringify(data));
};

const Collections = {
  SmartBox: getLocalData("SmartBox", initialSmartBoxes),
  Order: getLocalData("Order", initialOrders),
  Alert: getLocalData("Alert", initialAlerts),
  SensorData: getLocalData("SensorData", initialSensorData),
};

const mockSubscribers = new Map();

setInterval(() => {
  // Simulate live dynamic sensor variations every 4.5 seconds for SBX-001
  const newSensor = {
    id: `s_live_${Date.now()}`,
    smartbox_id: "SBX-001",
    order_id: "o1",
    temperature: +(4 + Math.random() * 2).toFixed(1),
    humidity: +(55 + Math.random() * 10).toFixed(1),
    shock_g: +(Math.random() * 0.5).toFixed(2),
    latitude: 21.0285 + (Math.random() * 0.02 - 0.01),
    longitude: 105.8542 + (Math.random() * 0.02 - 0.01),
    battery: +(84 - Math.random() * 0.1).toFixed(1),
    is_open: Math.random() > 0.95,
    timestamp: new Date().toISOString(),
  };

  Collections.SensorData.push(newSensor);
  if (Collections.SensorData.length > 200) Collections.SensorData.shift();
  saveLocalData("SensorData", Collections.SensorData);

  const subs = mockSubscribers.get("SensorData") || [];
  subs.forEach((cb) => cb({ type: "create", data: newSensor }));
}, 4500);

const createMockEntity = (name) => {
  const getArray = () => Collections[name];
  const save = () => saveLocalData(name, Collections[name]);

  return {
    list: async (...args) => [...getArray()],
    filter: async (query, sort, limit) => {
      const db = getArray();
      let res = db.filter((item) => {
        for (const k in query) {
          if (item[k] !== query[k]) return false;
        }
        return true;
      });
      if (typeof sort === "string") {
        const desc = sort.startsWith("-");
        const key = desc ? sort.slice(1) : sort;
        res.sort((a, b) => {
          if (a[key] < b[key]) return desc ? 1 : -1;
          if (a[key] > b[key]) return desc ? -1 : 1;
          return 0;
        });
      }
      if (typeof limit === "number") {
        res = res.slice(0, limit);
      }
      return res;
    },
    get: async (id) => getArray().find((i) => i.id === id),
    create: async (payload) => {
      const newItem = {
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        ...payload,
      };
      Collections[name].unshift(newItem);
      save();
      const subs = mockSubscribers.get(name) || [];
      subs.forEach((cb) => cb({ type: "create", data: newItem }));
      return newItem;
    },
    update: async (id, payload) => {
      const idx = getArray().findIndex((i) => i.id === id);
      if (idx > -1) {
        Collections[name][idx] = {
          ...Collections[name][idx],
          ...payload,
          updated_date: new Date().toISOString(),
        };
        save();
        const subs = mockSubscribers.get(name) || [];
        subs.forEach((cb) =>
          cb({ type: "update", data: Collections[name][idx] }),
        );
        return Collections[name][idx];
      }
      throw new Error(`Record ${id} not found in ${name}`);
    },
    delete: async (id) => {
      const arr = getArray();
      const idx = arr.findIndex((i) => i.id === id);
      if (idx > -1) {
        arr.splice(idx, 1);
        save();
        const subs = mockSubscribers.get(name) || [];
        subs.forEach((cb) => cb({ type: "delete", data: { id } }));
        return true;
      }
      return false;
    },
    subscribe: (callback) => {
      if (!mockSubscribers.has(name)) mockSubscribers.set(name, []);
      mockSubscribers.get(name).push(callback);
      return () => {
        const arr = mockSubscribers.get(name);
        const idx = arr.indexOf(callback);
        if (idx > -1) arr.splice(idx, 1);
      };
    },
  };
};

export const base44 = {
  auth: {
    me: async () => ({
      id: "mock-user-1",
      text: "Admin",
      email: "admin@smartbox.local",
    }),
    logout: (...args) => {
      window.location.href = "/home";
    },
    redirectToLogin: (...args) => {
      window.location.href = "/";
    },
  },
  entities: {
    Order: createMockEntity("Order"),
    SmartBox: createMockEntity("SmartBox"),
    Alert: createMockEntity("Alert"),
    SensorData: createMockEntity("SensorData"),
  },
};
