import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrderFormDialog from "../components/OrderFormDialog";
import { getOrderDisplayAddress, getOrderMapHref } from "@/utils/locationResolver";

const statusColors = {
  "Đang vận chuyển": "text-primary bg-primary/10 border-primary/20",
  "Đã giao": "text-green-400 bg-green-400/10 border-green-400/20",
  "Chờ xử lý": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Có sự cố": "text-red-400 bg-red-400/10 border-red-400/20",
  Hủy: "text-muted-foreground bg-secondary border-border",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const loadOrders = () => {
    base44.entities.Order.list("-created_date", 100).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
    // listen demo events to inject orders
    const onDemo = (e) => {
      const evt = e?.detail;
      if (!evt || evt.type !== "order") return;
      setOrders((prev) => {
        const id = evt.orderId || evt.order_id || (evt.data && evt.data.id) || evt.id;
        // prefer full data payload when available
        const base = evt.data || {};
        const exists = prev.find((o) => o.id === id || o.order_code === base.order_code || o.order_code === `DM-${id}`);
        const mappedStatus =
          base.status ||
          (evt.status === "created"
            ? "Chờ xử lý"
            : evt.status === "picked"
            ? "Đang vận chuyển"
            : evt.status === "shipped"
            ? "Đang vận chuyển"
            : evt.status === "delivered"
            ? "Đã giao"
            : evt.status || "Chờ xử lý");
        const newOrder = {
          ...base,
          id,
          order_code: base.order_code || `DM-${id}`,
          sender_name: base.sender_name || "Demo Sender",
          receiver_name: base.receiver_name || "Demo Receiver",
          origin: base.origin || base.from || "Demo",
          destination: base.destination || base.to || "Demo",
          cargo_type: base.cargo_type || base.cargo || "Demo",
          status: mappedStatus,
          smartbox_id: base.smartbox_id || base.box_id || null,
          estimated_delivery: base.estimated_delivery || null,
          notes: base.notes || null,
          suborders: (exists && exists.suborders) || base.suborders || [],
        };

        if (exists) {
          return prev.map((o) => (o.id === exists.id ? { ...o, ...newOrder } : o));
        }
        return [newOrder, ...prev].slice(0, 200);
      });
    };
    window.addEventListener("demo:event", onDemo);
    // cleanup
    return () => window.removeEventListener("demo:event", onDemo);
  }, []);


  // Also listen for demo smartbox events so we can link boxes -> orders when box.current_order_id is set
  useEffect(() => {
    const onDemoBox = (e) => {
      const evt = e?.detail;
      if (!evt || evt.type !== 'smartbox') return;
  const { data } = evt;
      if (!data) return;
      const orderId = data.current_order_id;
      if (!orderId) return;
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === orderId || o.order_code === `DM-${orderId}`);
        if (exists) {
          return prev.map((o) => (o.id === exists.id ? { ...o, smartbox_id: data.box_id || data.id } : o));
        }
        // create a lightweight order record if missing
        const newOrder = {
          id: orderId,
          order_code: `DM-${orderId}`,
          sender_name: 'Demo Sender',
          receiver_name: 'Demo Receiver',
          origin: 'Demo',
          destination: 'Demo',
          cargo_type: 'Demo',
          status: 'Chờ xử lý',
          smartbox_id: data.box_id || data.id,
          suborders: [],
        };
        return [newOrder, ...prev].slice(0, 200);
      });
    };
    window.addEventListener('demo:event', onDemoBox);
    return () => window.removeEventListener('demo:event', onDemoBox);
  }, []);

  // listen suborders
  useEffect(() => {
    const onDemoSub = (e) => {
      const evt = e?.detail;
      if (!evt || evt.type !== "suborder") return;
      const id = evt.orderId;
      const parentId = evt.parentId;
      setOrders((prev) => {
        // ensure parent exists
        let parent = prev.find((o) => o.id === parentId || o.order_code === `DM-${parentId}`);
        if (!parent) {
          parent = { id: parentId, order_code: `DM-${parentId}`, sender_name: 'Demo Sender', receiver_name: 'Demo Receiver', status: 'Chờ xử lý', suborders: [] };
        }
        // attach or update suborder
        const sub = { id, order_code: `DM-${id}`, status: evt.status === 'created' ? 'Chờ xử lý' : evt.status === 'picked' ? 'Đang vận chuyển' : evt.status === 'shipped' ? 'Đang vận chuyển' : 'Đã giao', parentId };
        const updatedParent = {
          ...parent,
          suborders: [sub, ...(parent.suborders || [])].slice(0, 10),
        };
        // merge into list
        const others = prev.filter((o) => o.id !== parent.id);
        return [updatedParent, ...others].slice(0, 200);
      });
    };
    window.addEventListener('demo:event', onDemoSub);
    return () => window.removeEventListener('demo:event', onDemoSub);
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_code?.toLowerCase().includes(search.toLowerCase()) ||
      o.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.receiver_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} đơn hàng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> Tạo đơn mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, người gửi, người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Tất cả trạng thái</option>
          {["Chờ xử lý", "Đang vận chuyển", "Đã giao", "Có sự cố", "Hủy"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  Mã đơn
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Người gửi → Nhận
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Tuyến đường
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Loại hàng
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  SmartBox
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground text-sm"
                  >
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const rows = [];
                  const originDisplay = getOrderDisplayAddress(order, "origin");
                  const destinationDisplay = getOrderDisplayAddress(order, "destination");
                  const originHref = getOrderMapHref(order, "origin");
                  const destinationHref = getOrderMapHref(order, "destination");
                  // parent row
                  rows.push(
                    <tr
                      key={order.id}
                      className="border-b border-border/40 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-mono text-xs text-primary hover:underline font-medium"
                        >
                          {order.order_code}
                        </Link>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <div className="text-xs text-foreground">
                          {order.sender_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          → {order.receiver_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground hidden md:table-cell">
                        <a
                          href={originHref}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {originDisplay}
                        </a>{" "}
                        →{" "}
                        <a
                          href={destinationHref}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {destinationDisplay}
                        </a>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {order.cargo_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${statusColors[order.status] || ""}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {order.smartbox_id ? (
                          <span className="font-mono text-xs text-gray">
                            {order.smartbox_id}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>,
                  );

                  // suborders rows
                  if (order.suborders && order.suborders.length > 0) {
                    order.suborders.forEach((s) => {
                      rows.push(
                        <tr key={s.id} className="bg-background/5">
                          <td className="py-2 px-4">
                            <Link
                              to={`/orders/${s.id}`}
                              className="font-mono text-xs text-muted-foreground hover:underline"
                            >
                              {s.order_code}
                            </Link>
                          </td>
                          <td className="py-2 px-4 hidden sm:table-cell">
                            <div className="text-xs text-muted-foreground">—</div>
                            <div className="text-xs text-muted-foreground">—</div>
                          </td>
                          <td className="py-2 px-4 text-xs text-muted-foreground hidden md:table-cell">—</td>
                          <td className="py-2 px-4 hidden lg:table-cell">—</td>
                          <td className="py-2 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${statusColors[s.status] || "text-muted-foreground"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 hidden md:table-cell">—</td>
                        </tr>,
                      );
                    });
                  }

                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <OrderFormDialog
          onClose={() => {
            setShowForm(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}
