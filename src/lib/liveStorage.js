const LIVE_STATE_KEY = "smartbox_live_run_state_v1";
const LIVE_LOG_KEY = "smartbox_live_event_log_v1";

export const LIVE_TOTAL_DURATION = 120;
export const LIVE_SCENARIO_ID = "SMARTBOX_COLD_CHAIN_HANOI_DANANG_V1";

const defaultState = {
  status: "not_started",
  currentSecond: 0,
  totalDuration: LIVE_TOTAL_DURATION,
  startedAt: null,
  pausedAt: null,
  completedAt: null,
  scenarioId: LIVE_SCENARIO_ID,
  appliedEventIds: [],
  generatedEntityIds: {
    orders: [],
    smartboxes: [],
    alerts: [],
    sensorData: [],
  },
};

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeState(state = {}) {
  return {
    ...defaultState,
    ...state,
    totalDuration: state.totalDuration || LIVE_TOTAL_DURATION,
    scenarioId: state.scenarioId || LIVE_SCENARIO_ID,
    appliedEventIds: Array.isArray(state.appliedEventIds)
      ? state.appliedEventIds
      : [],
    generatedEntityIds: {
      ...defaultState.generatedEntityIds,
      ...(state.generatedEntityIds || {}),
    },
  };
}

export function getLiveState() {
  if (typeof localStorage === "undefined") return { ...defaultState };
  return normalizeState(safeParse(localStorage.getItem(LIVE_STATE_KEY), defaultState));
}

export function saveLiveState(partialOrState) {
  if (typeof localStorage === "undefined") return getLiveState();
  const current = getLiveState();
  const next = normalizeState({
    ...current,
    ...partialOrState,
    generatedEntityIds: {
      ...current.generatedEntityIds,
      ...(partialOrState?.generatedEntityIds || {}),
    },
  });
  localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(next));
  emitLiveStateChanged(next);
  return next;
}

export function appendGeneratedEntity(type, id) {
  if (!id) return getLiveState();
  const state = getLiveState();
  const list = state.generatedEntityIds[type] || [];
  if (list.includes(id)) return state;
  return saveLiveState({
    generatedEntityIds: {
      ...state.generatedEntityIds,
      [type]: [...list, id],
    },
  });
}

export function markEventApplied(eventId) {
  const state = getLiveState();
  if (!eventId || state.appliedEventIds.includes(eventId)) return state;
  return saveLiveState({
    appliedEventIds: [...state.appliedEventIds, eventId],
  });
}

export function getLiveLog() {
  if (typeof localStorage === "undefined") return [];
  return safeParse(localStorage.getItem(LIVE_LOG_KEY), []);
}

export function appendLiveLog(entry) {
  if (typeof localStorage === "undefined") return [];
  const log = getLiveLog();
  const normalized = {
    id: entry.id || `log_${Date.now()}`,
    second: Number.isFinite(entry.second) ? entry.second : getLiveState().currentSecond,
    level: entry.level || "info",
    message: entry.message || "Live event",
    createdAt: entry.createdAt || new Date().toISOString(),
    eventType: entry.eventType || entry.type || "system",
  };
  const exists = log.some((item) => item.id === normalized.id);
  const next = exists ? log : [...log, normalized].slice(-80);
  localStorage.setItem(LIVE_LOG_KEY, JSON.stringify(next));
  emitLiveLogChanged(next);
  return next;
}

export function clearLiveLog() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LIVE_LOG_KEY, JSON.stringify([]));
  emitLiveLogChanged([]);
}

export function resetLiveForDevOnly() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(LIVE_STATE_KEY);
  localStorage.removeItem(LIVE_LOG_KEY);
  emitLiveStateChanged(defaultState);
  emitLiveLogChanged([]);
}

export function formatLiveClock(second = 0) {
  const safeSecond = Math.max(0, Math.floor(second));
  const minutes = String(Math.floor(safeSecond / 60)).padStart(2, "0");
  const seconds = String(safeSecond % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function emitLiveStateChanged(state) {
  try {
    window.dispatchEvent(new CustomEvent("live:state", { detail: state }));
  } catch {
    // ignore non-browser environments
  }
}

function emitLiveLogChanged(log) {
  try {
    window.dispatchEvent(new CustomEvent("live:log", { detail: log }));
  } catch {
    // ignore non-browser environments
  }
}
