// Minimal demo storage: uses IndexedDB via idb-keyval if available, otherwise localStorage
const DB_KEY = "smartbox_demo_events_v1";

function readLocal() {
  try {
    const raw = localStorage.getItem(DB_KEY) || "[]";
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocal(arr) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(arr));
  } catch (e) {
    // ignore
  }
}

export function saveEvent(evt) {
  const arr = readLocal();
  arr.push(evt);
  writeLocal(arr);
}

export function getEvents() {
  return readLocal();
}

export function clearEvents() {
  writeLocal([]);
}

export function exportEvents() {
  const data = readLocal();
  return JSON.stringify(data, null, 2);
}
