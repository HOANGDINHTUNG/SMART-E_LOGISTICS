import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LIVE_SCENARIO, LIVE_TIMELINE } from "@/utils/liveScenario";
import {
  appendGeneratedEntity,
  appendLiveLog,
  clearLiveLog,
  formatLiveClock,
  getLiveState,
  markEventApplied,
  resetLiveForDevOnly,
  saveLiveState,
} from "@/lib/liveStorage";

const TICK_MS = 1000;

function nowIso() {
  return new Date().toISOString();
}

function withRuntimeValues(data = {}) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === "NOW" ? nowIso() : value]),
  );
}

async function findOne(entityName, match = {}) {
  if (match.id) {
    const byId = await base44.entities[entityName].get(match.id);
    if (byId) return byId;
  }
  const found = await base44.entities[entityName].filter(match, "-updated_date", 1);
  return found?.[0] || null;
}

async function upsertByMatch(entityName, match, payload) {
  const existing = await findOne(entityName, match);
  if (existing) {
    return base44.entities[entityName].update(existing.id, withRuntimeValues(payload));
  }
  return base44.entities[entityName].create(withRuntimeValues(payload));
}

function broadcastDemoEvent(evt) {
  try {
    window.dispatchEvent(new CustomEvent("demo:event", { detail: evt }));
  } catch {
    // ignore non-browser environments
  }
}

function buildLog(event, second) {
  return {
    id: `log_${event.id}`,
    second,
    level: event.level || "info",
    eventType: event.type,
    message: event.message || `Live event ${event.id}`,
  };
}

async function applyLiveEvent(event, second) {
  const timestamp = nowIso();

  if (event.type === "log") {
    broadcastDemoEvent({
      type: "live_log",
      action: "log",
      second,
      message: event.message,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "create_smartboxes") {
    for (const box of event.payload || []) {
      const payload = { ...box, last_seen: timestamp };
      const saved = await upsertByMatch("SmartBox", { box_id: box.box_id }, payload);
      appendGeneratedEntity("smartboxes", saved.id);
      broadcastDemoEvent({
        type: "smartbox",
        action: "create",
        data: saved,
        second,
        ts: Date.now(),
      });
    }
    return;
  }

  if (event.type === "create_orders") {
    for (const order of event.payload || []) {
      const saved = await upsertByMatch("Order", { order_code: order.order_code }, order);
      appendGeneratedEntity("orders", saved.id);
      broadcastDemoEvent({
        type: "order",
        action: "create",
        orderId: saved.id,
        status: "created",
        data: saved,
        second,
        ts: Date.now(),
      });
    }
    return;
  }

  if (event.type === "update_smartbox") {
    const { match, data } = event.payload || {};
    const existing = await findOne("SmartBox", match);
    if (!existing) return;
    const saved = await base44.entities.SmartBox.update(existing.id, withRuntimeValues(data));
    broadcastDemoEvent({
      type: "smartbox",
      action: "update",
      data: saved,
      second,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "update_order") {
    const { match, data } = event.payload || {};
    const existing = await findOne("Order", match);
    if (!existing) return;
    const saved = await base44.entities.Order.update(existing.id, withRuntimeValues(data));
    broadcastDemoEvent({
      type: "order",
      action: "update",
      orderId: saved.id,
      status: saved.status,
      data: saved,
      second,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "sensor_reading") {
    const payload = {
      ...event.payload,
      timestamp,
      live_generated: true,
    };
    const saved = await upsertByMatch("SensorData", { id: payload.id }, payload);
    appendGeneratedEntity("sensorData", saved.id);

    const boxes = await base44.entities.SmartBox.filter(
      { box_id: saved.smartbox_id },
      "-updated_date",
      1,
    );
    if (boxes[0]) {
      const updatedBox = await base44.entities.SmartBox.update(boxes[0].id, {
        last_temperature: saved.temperature,
        last_humidity: saved.humidity,
        last_shock: saved.shock_g,
        last_latitude: saved.latitude,
        last_longitude: saved.longitude,
        battery_level: saved.battery,
        last_seen: timestamp,
      });
      broadcastDemoEvent({
        type: "smartbox",
        action: "update",
        data: updatedBox,
        second,
        ts: Date.now(),
      });
    }

    broadcastDemoEvent({
      type: "sensor",
      action: "create",
      data: saved,
      sensorId: saved.smartbox_id,
      value: saved.temperature,
      humidity: saved.humidity,
      second,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "create_alert") {
    const payload = withRuntimeValues({
      ...event.payload,
      created_date: timestamp,
    });
    const saved = await upsertByMatch("Alert", { id: payload.id }, payload);
    appendGeneratedEntity("alerts", saved.id);
    broadcastDemoEvent({
      type: "alert",
      action: "create",
      alertId: saved.id,
      data: saved,
      second,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "resolve_alert") {
    const { match, data } = event.payload || {};
    const existing = await findOne("Alert", match);
    if (!existing) return;
    const saved = await base44.entities.Alert.update(existing.id, withRuntimeValues(data));
    broadcastDemoEvent({
      type: "alert",
      action: "update",
      alertId: saved.id,
      data: saved,
      second,
      ts: Date.now(),
    });
    return;
  }

  if (event.type === "complete") {
    saveLiveState({
      status: "completed",
      currentSecond: LIVE_SCENARIO.totalDuration,
      completedAt: timestamp,
    });
    broadcastDemoEvent({
      type: "live_completed",
      action: "complete",
      second,
      ts: Date.now(),
    });
  }
}

export function useLiveRunner({ onEvent } = {}) {
  const [liveState, setLiveState] = useState(() => getLiveState());
  const timerRef = useRef(null);
  const applyingRef = useRef(false);
  const liveStateRef = useRef(liveState);

  const syncState = useCallback((state) => {
    liveStateRef.current = state;
    setLiveState(state);
  }, []);

  const persist = useCallback(
    (partial) => {
      const next = saveLiveState(partial);
      syncState(next);
      return next;
    },
    [syncState],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyDueEvents = useCallback(
    async (targetSecond) => {
      if (applyingRef.current) return;
      applyingRef.current = true;
      try {
        let state = getLiveState();
        const dueEvents = LIVE_TIMELINE.filter(
          (event) => event.at <= targetSecond && !state.appliedEventIds.includes(event.id),
        );

        for (const event of dueEvents) {
          await applyLiveEvent(event, event.at);
          appendLiveLog(buildLog(event, event.at));
          state = markEventApplied(event.id);
          syncState(state);
          if (typeof onEvent === "function") onEvent(event);
        }
      } finally {
        applyingRef.current = false;
      }
    },
    [onEvent, syncState],
  );

  const completeIfNeeded = useCallback(
    (second) => {
      if (second < LIVE_SCENARIO.totalDuration) return false;
      stopTimer();
      const next = persist({
        status: "completed",
        currentSecond: LIVE_SCENARIO.totalDuration,
        completedAt: nowIso(),
      });
      appendLiveLog({
        id: "log_live_locked",
        second: LIVE_SCENARIO.totalDuration,
        eventType: "completed",
        message: "Live đã hoàn tất và bị khóa, không thể chạy lại lần thứ hai.",
      });
      syncState(next);
      return true;
    },
    [persist, stopTimer, syncState],
  );

  const tick = useCallback(async () => {
    const current = getLiveState();
    if (current.status !== "running") return;
    const nextSecond = Math.min(
      LIVE_SCENARIO.totalDuration,
      Number(current.currentSecond || 0) + 1,
    );
    let next = persist({ currentSecond: nextSecond });
    await applyDueEvents(nextSecond);
    next = getLiveState();
    syncState(next);
    completeIfNeeded(nextSecond);
  }, [applyDueEvents, completeIfNeeded, persist, syncState]);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      tick();
    }, TICK_MS);
  }, [stopTimer, tick]);

  const start = useCallback(async () => {
    const current = getLiveState();
    if (current.status === "completed") return current;

    if (current.status === "not_started") {
      clearLiveLog();
      appendLiveLog({
        id: "log_live_started",
        second: 0,
        eventType: "started",
        message: "Người dùng bắt đầu phiên Live lần đầu tiên.",
      });
    } else if (current.status === "paused") {
      appendLiveLog({
        id: `log_live_resumed_${Date.now()}`,
        second: current.currentSecond,
        eventType: "resumed",
        message: `Resume Live từ giây ${formatLiveClock(current.currentSecond)}.`,
      });
    }

    const next = persist({
      status: "running",
      startedAt: current.startedAt || nowIso(),
      pausedAt: null,
      totalDuration: LIVE_SCENARIO.totalDuration,
      scenarioId: LIVE_SCENARIO.id,
    });
    await applyDueEvents(next.currentSecond || 0);
    startTimer();
    return next;
  }, [applyDueEvents, persist, startTimer]);

  const pause = useCallback(() => {
    const current = getLiveState();
    stopTimer();
    if (current.status !== "running") return current;
    appendLiveLog({
      id: `log_live_paused_${Date.now()}`,
      second: current.currentSecond,
      eventType: "paused",
      message: `Live tạm dừng tại giây ${formatLiveClock(current.currentSecond)}.`,
    });
    return persist({
      status: "paused",
      pausedAt: nowIso(),
      currentSecond: current.currentSecond,
    });
  }, [persist, stopTimer]);

  useEffect(() => {
    const onState = (event) => syncState(event.detail || getLiveState());
    const onBeforeUnload = () => {
      const current = getLiveState();
      if (current.status === "running") {
        saveLiveState({
          status: "paused",
          pausedAt: nowIso(),
          currentSecond: current.currentSecond,
        });
      }
    };

    window.addEventListener("live:state", onState);
    window.addEventListener("beforeunload", onBeforeUnload);

    const current = getLiveState();
    if (current.status === "running") {
      startTimer();
    }

    try {
      window.__liveRunner = {
        start,
        pause,
        getState: getLiveState,
        resetForDevOnly: resetLiveForDevOnly,
      };
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("live:state", onState);
      window.removeEventListener("beforeunload", onBeforeUnload);
      stopTimer();
      const latest = getLiveState();
      if (latest.status === "running") {
        saveLiveState({
          status: "paused",
          pausedAt: nowIso(),
          currentSecond: latest.currentSecond,
        });
      }
    };
  }, [pause, start, startTimer, stopTimer, syncState]);

  const progress = Math.min(
    100,
    Math.round(((liveState.currentSecond || 0) / LIVE_SCENARIO.totalDuration) * 100),
  );

  return {
    liveState,
    scenario: LIVE_SCENARIO,
    running: liveState.status === "running",
    completed: liveState.status === "completed",
    progress,
    start,
    pause,
  };
}
