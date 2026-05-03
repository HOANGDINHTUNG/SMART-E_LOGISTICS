import { useState } from "react";
import {
  Activity,
  Server,
  Database,
  Wifi,
  ArrowRight,
  Info,
} from "lucide-react";

const archFlow = [
  {
    id: 1,
    label: "IoT Device",
    sub: "ESP32 / Arduino",
    color: "border-accent bg-accent/50 text-accent text-gray-300",
  },
  {
    id: 2,
    label: "MQTT Broker",
    sub: "mosquitto / HiveMQ",
    color: "border-amber-400/40 bg-amber-400/5 text-amber-400",
  },
  {
    id: 3,
    label: "Backend",
    sub: "Base44 API",
    color: "border-primary/40 bg-primary/5 text-primary",
  },
  {
    id: 4,
    label: "Database",
    sub: "Base44 Entities",
    color: "border-blue-400/40 bg-blue-400/5 text-blue-400",
  },
  {
    id: 5,
    label: "WebSocket",
    sub: "Real-time sub",
    color: "border-purple-400/40 bg-purple-400/5 text-purple-400",
  },
  {
    id: 6,
    label: "Frontend",
    sub: "React Dashboard",
    color: "border-green-400/40 bg-green-400/5 text-green-400",
  },
];

const entities = [
  {
    name: "Order",
    desc: "Quản lý đơn hàng vận chuyển",
    fields: [
      "order_code",
      "cargo_type",
      "status",
      "smartbox_id",
      "origin",
      "destination",
    ],
  },
  {
    name: "SmartBox",
    desc: "Thiết bị IoT theo dõi",
    fields: [
      "box_id",
      "status",
      "last_temperature",
      "last_humidity",
      "battery_level",
      "GPS coords",
    ],
  },
  {
    name: "SensorData",
    desc: "Dữ liệu cảm biến thô (time-series)",
    fields: [
      "temperature",
      "humidity",
      "shock_g",
      "latitude",
      "longitude",
      "battery",
      "is_open",
    ],
  },
  {
    name: "Alert",
    desc: "Cảnh báo rule-based tự động",
    fields: [
      "alert_type",
      "severity",
      "message",
      "value",
      "threshold",
      "is_resolved",
    ],
  },
];

const nonFunctional = [
  {
    icon: Server,
    title: "Scalability",
    desc: "Horizontal scaling qua stateless API + event-driven architecture",
  },
  {
    icon: Database,
    title: "Reliability",
    desc: "Fault tolerance: dữ liệu sensor lưu offline, sync khi có mạng",
  },
  {
    icon: Wifi,
    title: "Real-time",
    desc: "WebSocket subscription cho live dashboard, độ trễ < 500ms",
  },
  {
    icon: Activity,
    title: "Performance",
    desc: "Pagination, time-series indexing, lazy load chart data",
  },
];

export default function System() {
  const [activeTab, setActiveTab] = useState("architecture");

  const tabs = [
    { key: "architecture", label: "Kiến trúc" },
    { key: "datamodel", label: "Mô hình dữ liệu" },
    { key: "nonfunctional", label: "Phi chức năng" },
    { key: "integration", label: "Tích hợp IoT" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Kiến trúc hệ thống
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng quan lý thuyết SmartBox E-Logistics dành cho hội đồng học thuật
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Architecture */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-6">
              Luồng dữ liệu hệ thống (IoT Pipeline)
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {archFlow.map((node, i) => (
                <div key={node.id} className="flex items-center gap-2">
                  <div
                    className={`border rounded-xl px-4 py-3 text-center min-w-[100px] ${node.color}`}
                  >
                    <div className="text-sm font-semibold">{node.label}</div>
                    <div className="text-xs font-medium mt-1">{node.sub}</div>
                  </div>
                  {i < archFlow.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoBlock title="Event-Driven Architecture" icon={Activity}>
              Hệ thống dựa trên event stream: mỗi lần sensor đo được dữ liệu,
              một event được tạo ra và propagate qua toàn pipeline mà không cần
              polling.
            </InfoBlock>
            <InfoBlock title="Digital Twin Concept" icon={Server}>
              Mỗi SmartBox vật lý có bản sao số (digital twin) trên hệ thống.
              State của box vật lý được mirror real-time lên dashboard.
            </InfoBlock>
            <InfoBlock title="Rule-Based Alert Engine" icon={Activity}>
              Khi sensor data vượt ngưỡng (nhiệt độ, va chạm, pin thấp...),
              engine tự động tạo Alert record và push notification qua
              WebSocket.
            </InfoBlock>
            <InfoBlock title="MQTT Protocol" icon={Wifi}>
              IoT device kết nối qua MQTT (lightweight pub/sub). Topic:
              smartbox/{"{box_id}"}/sensors. Broker relay đến backend xử lý.
            </InfoBlock>
          </div>
        </div>
      )}

      {/* Data model */}
      {activeTab === "datamodel" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Quan hệ giữa các Entity
            </h2>
            <div className="font-mono text-xs text-muted-foreground space-y-2 bg-secondary/30 p-4 rounded-lg">
              <div>
                <span className="text-primary">Order</span> 1 ——— N{" "}
                <span className="text-accent">SensorData</span>{" "}
                <span className="text-muted-foreground/50">(order_id)</span>
              </div>
              <div>
                <span className="text-primary">Order</span> 1 ——— N{" "}
                <span className="text-amber-400">Alert</span>{" "}
                <span className="text-muted-foreground/50">(order_id)</span>
              </div>
              <div>
                <span className="text-blue-400">SmartBox</span> 1 ——— N{" "}
                <span className="text-accent">SensorData</span>{" "}
                <span className="text-muted-foreground/50">(smartbox_id)</span>
              </div>
              <div>
                <span className="text-blue-400">SmartBox</span> 1 ——— N{" "}
                <span className="text-amber-400">Alert</span>{" "}
                <span className="text-muted-foreground/50">(smartbox_id)</span>
              </div>
              <div>
                <span className="text-primary">Order</span> N ——— 1{" "}
                <span className="text-blue-400">SmartBox</span>{" "}
                <span className="text-muted-foreground/50">(smartbox_id)</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entities.map((e) => (
              <div
                key={e.name}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground font-mono">
                    {e.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{e.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {e.fields.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 bg-secondary rounded text-xs font-mono text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-functional */}
      {activeTab === "nonfunctional" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nonFunctional.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Integration */}
      {activeTab === "integration" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" /> Kết nối thiết bị IoT
              thực tế
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <Step num={1} title="Cấu hình MQTT Broker">
                Thiết lập MQTT broker (HiveMQ Cloud / Mosquitto). Device connect
                với credentials. Topic format:{" "}
                <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                  smartbox/{"{box_id}"}/data
                </code>
              </Step>
              <Step num={2} title="Gửi dữ liệu từ ESP32">
                Device publish JSON payload mỗi 30 giây:{" "}
                <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">
                  {"{ temp, humidity, shock, lat, lng, battery }"}
                </code>
              </Step>
              <Step num={3} title="Backend nhận và xử lý">
                Backend subscribe MQTT topic, parse payload, lưu vào SensorData
                entity, cập nhật SmartBox last_* fields, và chạy alert rules.
              </Step>
              <Step num={4} title="Real-time push về Frontend">
                Base44 WebSocket tự động push update tới dashboard khi
                SensorData hoặc Alert được tạo mới. Frontend subscribe và render
                live.
              </Step>
            </div>
          </div>

          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-amber-400">Demo Mode:</span>{" "}
              Trong bản demo, dữ liệu có thể được nhập thủ công qua API hoặc tạo
              trực tiếp trên dashboard. Hệ thống đã sẵn sàng nhận dữ liệu thật
              từ thiết bị phần cứng khi kết nối MQTT được thiết lập.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ title, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}

function Step({ num, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">
        {num}
      </div>
      <div>
        <div className="text-sm font-medium text-foreground mb-1">{title}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
