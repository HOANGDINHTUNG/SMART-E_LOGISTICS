// Simple demo event generator
// start(generatorCallback) -> returns stop()
export function startDemoGenerator(emit, opts = {}) {
  const {
    sensorInterval = 2000,
    alertChancePerTick = 0.15, // increased from 0.05 to 0.15 (15% chance per tick)
    // defaults for paced mock data
    totalDuration = 300000,
    ordersCount = 80, // increased from 20 to 80
    boxesCount = 40, // increased from 20 to 40
  } = opts;
  const intervals = [];
  const timeouts = [];
  // keep demoBoxes as objects so we can assign orders to boxes and emit updates
  const demoBoxes = [];

  // sensor readings
  const sensorTimer = setInterval(() => {
    const event = {
      type: "sensor",
      sensorId: `S-${Math.ceil(Math.random() * 10)}`,
      value: +(20 + Math.random() * 10).toFixed(2),
      unit: "°C",
      ts: Date.now(),
    };
    emit(event);
    // occasional alert based on reading
    if (event.value > 28 && Math.random() > 0.6) {
      emit({
        type: "alert",
        alertId: `A-${Date.now()}`,
        level: event.value > 30 ? "critical" : "warning",
        severity: event.value > 30 ? "Khẩn cấp" : "Cao", // Vietnamese severity levels
        message: `High temperature ${event.value}°C on ${event.sensorId}`,
        is_resolved: false, // mark as unresolved
        ts: Date.now(),
      });
    }
  }, sensorInterval);
  intervals.push(sensorTimer);

  // random alerts occasionally
  const alertTimer = setInterval(() => {
    if (Math.random() < alertChancePerTick) {
      const isWarning = Math.random() > 0.7;
      emit({
        type: "alert",
        alertId: `A-${Date.now()}`,
        level: isWarning ? "critical" : "warning",
        severity: isWarning ? "Khẩn cấp" : "Cao", // Vietnamese severity
        message: isWarning 
          ? "Cảnh báo: Nhiệt độ quá cao" 
          : "Cảnh báo: Độ ẩm bất thường",
        is_resolved: false, // mark as unresolved
        ts: Date.now(),
      });
    }
  }, 3000);``
  intervals.push(alertTimer);

  // order updates
  // existing free-running order updates (kept small frequency)
  const orderTimer = setInterval(() => {
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const statuses = ["created", "picked", "shipped", "delivered"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    // try to assign to an existing demo box if available
    const orderPayload = { type: "order", orderId: orderId, status, ts: Date.now() };
    if (demoBoxes.length > 0 && Math.random() > 0.3) {
      const box = demoBoxes[Math.floor(Math.random() * demoBoxes.length)];
      orderPayload.data = orderPayload.data || {};
      orderPayload.data.smartbox_id = box.box_id || box.id;
      // update the box to reference this order and emit an update event
  box.current_order_id = orderId;
      // emit the order first, then a box update shortly after so UI can reflect linkage
      emit(orderPayload);
      const tBoxUpd = setTimeout(() => emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() }), 400);
      timeouts.push(tBoxUpd);
      return;
    }
    emit(orderPayload);
  }, Math.max(20000, totalDuration / Math.max(1, ordersCount)));
  intervals.push(orderTimer);

  // Parent + suborder flows: create a parent every 60s and spawn 1-4 suborders
  const parentInterval = setInterval(() => {
    const parentId = `P${Date.now()}`;
    // parent order may also be linked to a box
    const parentPayload = { type: "order", orderId: parentId, status: "created", ts: Date.now(), isParent: true };
    if (demoBoxes.length > 0 && Math.random() > 0.4) {
      const box = demoBoxes[Math.floor(Math.random() * demoBoxes.length)];
      parentPayload.data = { smartbox_id: box.box_id || box.id };
      box.current_order_id = parentId;
      emit(parentPayload);
      const tBoxUpd = setTimeout(() => emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() }), 400);
      timeouts.push(tBoxUpd);
    } else {
      emit(parentPayload);
    }

    const subCount = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < subCount; i++) {
      const subId = `${parentId}-${i + 1}`;
      // create suborder after small stagger
      const createDelay = 1000 + i * 800;
      const tCreate = setTimeout(() => {
        emit({ type: "suborder", orderId: subId, parentId, status: "created", ts: Date.now() });
        // schedule status transitions for this suborder
        const t1 = setTimeout(() => emit({ type: "suborder", orderId: subId, parentId, status: "picked", ts: Date.now() }), 4000 + Math.random() * 4000);
        const t2 = setTimeout(() => emit({ type: "suborder", orderId: subId, parentId, status: "shipped", ts: Date.now() }), 8000 + Math.random() * 6000);
        const t3 = setTimeout(() => emit({ type: "suborder", orderId: subId, parentId, status: "delivered", ts: Date.now() }), 15000 + Math.random() * 10000);
        timeouts.push(t1, t2, t3);
      }, createDelay);
      timeouts.push(tCreate);
    }
  }, Math.max(10000, totalDuration / Math.max(1, Math.floor(ordersCount / 2))));
  intervals.push(parentInterval);

  // SmartBox create/update simulation
  const smartBoxTimer = setInterval(() => {
    // create new smartbox
    const boxId = `B${Math.floor(1000 + Math.random() * 9000)}`;
    const box = {
      id: boxId,
      box_id: boxId,
      box_name: `DemoBox ${boxId}`,
      status: Math.random() > 0.2 ? "Sẵn sàng" : "Đang vận chuyển",
      battery_level: Math.floor(30 + Math.random() * 70),
      last_seen: Date.now(),
    };
  // store the whole box object for later linking
  demoBoxes.push(box);
  emit({ type: "smartbox", action: "create", data: box, ts: Date.now() });

    // schedule a few updates for this box
    const up1 = setTimeout(() => {
      box.battery_level = Math.max(5, box.battery_level - Math.floor(Math.random() * 20));
      box.last_seen = Date.now();
      box.status = Math.random() > 0.8 ? "Ngoại tuyến" : box.status;
      emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() });
    }, 5000 + Math.random() * 8000);
    const up2 = setTimeout(() => {
      box.battery_level = Math.max(1, box.battery_level - Math.floor(Math.random() * 30));
      box.last_seen = Date.now();
      emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() });
    }, 15000 + Math.random() * 10000);
    timeouts.push(up1, up2);
  }, Math.max(5000, totalDuration / Math.max(1, boxesCount)));
  intervals.push(smartBoxTimer);

  // Schedule paced mock orders across totalDuration
  try {
    const orderIntervalPaced = Math.max(1000, Math.floor(totalDuration / Math.max(1, ordersCount)));
    for (let i = 0; i < ordersCount; i++) {
      const delay = Math.round(i * orderIntervalPaced);
      const t = setTimeout(() => {
        const oid = `MO-${Date.now()}-${i}`;
        const order = {
          id: oid,
          order_code: `MO${String(i + 1).padStart(3, "0")}`,
          sender_name: "Demo Sender",
          receiver_name: "Demo Receiver",
          origin: "Warehouse A",
          destination: "Customer",
          cargo_type: "General",
          status: "Chờ xử lý",
        };
        // assign to an existing box when possible for a realistic pairing
        if (demoBoxes.length > 0 && Math.random() > 0.25) {
          const box = demoBoxes[Math.floor(Math.random() * demoBoxes.length)];
          order.smartbox_id = box.box_id || box.id;
          box.current_order_id = order.id;
          emit({ type: "order", orderId: order.id, status: "created", data: order, ts: Date.now() });
          // emit a box update so the UI knows the box is carrying this order
          const tBox = setTimeout(() => emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() }), 500);
          timeouts.push(tBox);
        } else {
          emit({ type: "order", orderId: order.id, status: "created", data: order, ts: Date.now() });
        }
        // optional status transitions
        const t1 = setTimeout(() => emit({ type: "order", orderId: order.id, status: "picked", data: order, ts: Date.now() }), Math.min(20000, totalDuration - delay));
        const t2 = setTimeout(() => emit({ type: "order", orderId: order.id, status: "shipped", data: order, ts: Date.now() }), Math.min(40000, totalDuration - delay));
        const t3 = setTimeout(() => emit({ type: "order", orderId: order.id, status: "delivered", data: order, ts: Date.now() }), Math.min(90000, totalDuration - delay));
        timeouts.push(t1, t2, t3);
      }, delay);
      timeouts.push(t);
    }
  } catch {}

  // Schedule paced mock smartboxes across totalDuration
  try {
    const boxIntervalPaced = Math.max(1000, Math.floor(totalDuration / Math.max(1, boxesCount)));
    for (let i = 0; i < boxesCount; i++) {
      const delay = Math.round(i * boxIntervalPaced);
      const t = setTimeout(() => {
        const boxId = `MB-${Date.now()}-${i}`;
        const box = {
          id: boxId,
          box_id: boxId,
          box_name: `MockBox ${i + 1}`,
          status: "Sẵn sàng",
          battery_level: 80 - Math.floor(Math.random() * 30),
          last_seen: Date.now(),
        };
  // store paced boxes as full objects
  demoBoxes.push(box);
  emit({ type: "smartbox", action: "create", data: box, ts: Date.now() });
        const up1 = setTimeout(() => {
          box.battery_level = Math.max(1, box.battery_level - Math.floor(Math.random() * 40));
          box.last_seen = Date.now();
          emit({ type: "smartbox", action: "update", data: { ...box }, ts: Date.now() });
        }, Math.min(15000, totalDuration - delay));
        timeouts.push(up1);
      }, delay);
      timeouts.push(t);
    }
  } catch {}

  return function stop() {
    intervals.forEach((id) => clearInterval(id));
  timeouts.forEach((id) => clearTimeout(id));
  };
}
