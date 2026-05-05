const MOVING_STATUSES = new Set(["Đang vận chuyển", "Có sự cố", "Hủy"]);

const VIETNAM_BOUNDS = {
  minLat: 8,
  maxLat: 24,
  minLng: 102,
  maxLng: 110,
};

const KNOWN_ADDRESS_POINTS = [
  {
    keywords: ["561a điện biên phủ", "561a dien bien phu", "thạnh mỹ tây", "thanh my tay"],
    label: "561A Điện Biên Phủ, Thạnh Mỹ Tây, TP.HCM",
    lat: 10.8019,
    lng: 106.7146,
  },
  {
    keywords: ["23 đường 3/2", "23 duong 3/2", "23 ba tháng hai", "23 ba thang hai"],
    label: "23 Đường 3/2, Quận 10, TP.HCM",
    lat: 10.7754,
    lng: 106.6748,
  },
  {
    keywords: ["bệnh viện đà nẵng", "benh vien da nang"],
    label: "Bệnh viện Đà Nẵng",
    lat: 16.0678,
    lng: 108.2208,
  },
  {
    keywords: ["cảng cát lái", "cang cat lai"],
    label: "Cảng Cát Lái, TP.HCM",
    lat: 10.7564,
    lng: 106.7897,
  },
  {
    keywords: ["ninh kiều", "ninh kieu"],
    label: "Ninh Kiều, Cần Thơ",
    lat: 10.0328,
    lng: 105.7835,
  },
  {
    keywords: ["long biên", "long bien"],
    label: "Long Biên, Hà Nội",
    lat: 21.0479,
    lng: 105.8885,
  },
];

const DISTRICT_FALLBACK_POINTS = {
  "quan-1": [
    { label: "Chợ Bến Thành, Quận 1, TP.HCM", lat: 10.7722, lng: 106.6980 },
    { label: "Nguyễn Huệ, Quận 1, TP.HCM", lat: 10.7743, lng: 106.7038 },
    { label: "Tôn Đức Thắng, Quận 1, TP.HCM", lat: 10.7812, lng: 106.7062 },
  ],
  "quan-3": [
    { label: "Hồ Con Rùa, Quận 3, TP.HCM", lat: 10.7825, lng: 106.6950 },
    { label: "Võ Văn Tần, Quận 3, TP.HCM", lat: 10.7764, lng: 106.6906 },
    { label: "Cách Mạng Tháng 8, Quận 3, TP.HCM", lat: 10.7808, lng: 106.6844 },
  ],
  "quan-5": [
    { label: "An Dương Vương, Quận 5, TP.HCM", lat: 10.7595, lng: 106.6800 },
    { label: "Trần Hưng Đạo, Quận 5, TP.HCM", lat: 10.7547, lng: 106.6675 },
    { label: "Nguyễn Trãi, Quận 5, TP.HCM", lat: 10.7567, lng: 106.6719 },
  ],
  "quan-7": [
    { label: "Nguyễn Văn Linh, Quận 7, TP.HCM", lat: 10.7291, lng: 106.7216 },
    { label: "Phú Mỹ Hưng, Quận 7, TP.HCM", lat: 10.7290, lng: 106.7085 },
    { label: "Huỳnh Tấn Phát, Quận 7, TP.HCM", lat: 10.7415, lng: 106.7310 },
  ],
  "quan-10": [
    { label: "23 Đường 3/2, Quận 10, TP.HCM", lat: 10.7754, lng: 106.6748 },
    { label: "Tô Hiến Thành, Quận 10, TP.HCM", lat: 10.7717, lng: 106.6667 },
    { label: "Sư Vạn Hạnh, Quận 10, TP.HCM", lat: 10.7695, lng: 106.6690 },
    { label: "Lý Thường Kiệt, Quận 10, TP.HCM", lat: 10.7728, lng: 106.6578 },
  ],
  "binh-thanh": [
    { label: "561A Điện Biên Phủ, Bình Thạnh, TP.HCM", lat: 10.8019, lng: 106.7146 },
    { label: "Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM", lat: 10.8064, lng: 106.7104 },
    { label: "Phan Đăng Lưu, Bình Thạnh, TP.HCM", lat: 10.8037, lng: 106.6962 },
  ],
  "tan-binh": [
    { label: "Sân bay Tân Sơn Nhất, Tân Bình, TP.HCM", lat: 10.8188, lng: 106.6519 },
    { label: "Cộng Hòa, Tân Bình, TP.HCM", lat: 10.8019, lng: 106.6464 },
    { label: "Hoàng Văn Thụ, Tân Bình, TP.HCM", lat: 10.7960, lng: 106.6665 },
  ],
  "ba-dinh": [
    { label: "Kim Mã, Ba Đình, Hà Nội", lat: 21.0319, lng: 105.8181 },
    { label: "Liễu Giai, Ba Đình, Hà Nội", lat: 21.0354, lng: 105.8127 },
    { label: "Đội Cấn, Ba Đình, Hà Nội", lat: 21.0377, lng: 105.8219 },
  ],
  "cau-giay": [
    { label: "Cầu Giấy, Hà Nội", lat: 21.0362, lng: 105.7906 },
    { label: "Trần Duy Hưng, Cầu Giấy, Hà Nội", lat: 21.0079, lng: 105.7982 },
    { label: "Duy Tân, Cầu Giấy, Hà Nội", lat: 21.0298, lng: 105.7837 },
  ],
  "hai-chau": [
    { label: "Bạch Đằng, Hải Châu, Đà Nẵng", lat: 16.0679, lng: 108.2242 },
    { label: "Cầu Rồng, Hải Châu, Đà Nẵng", lat: 16.0611, lng: 108.2278 },
    { label: "Nguyễn Văn Linh, Hải Châu, Đà Nẵng", lat: 16.0608, lng: 108.2164 },
  ],
  "ninh-kieu": [
    { label: "Bến Ninh Kiều, Cần Thơ", lat: 10.0342, lng: 105.7887 },
    { label: "Đường 30/4, Ninh Kiều, Cần Thơ", lat: 10.0286, lng: 105.7793 },
    { label: "Đại lộ Hòa Bình, Ninh Kiều, Cần Thơ", lat: 10.0357, lng: 105.7805 },
  ],
};

const DISTRICT_PATTERNS = [
  { key: "quan-1", patterns: ["quận 1", "quan 1", "q1", "q.1", "district 1"] },
  { key: "quan-3", patterns: ["quận 3", "quan 3", "q3", "q.3", "district 3"] },
  { key: "quan-5", patterns: ["quận 5", "quan 5", "q5", "q.5", "district 5"] },
  { key: "quan-7", patterns: ["quận 7", "quan 7", "q7", "q.7", "district 7"] },
  { key: "quan-10", patterns: ["quận 10", "quan 10", "q10", "q.10", "district 10"] },
  { key: "binh-thanh", patterns: ["bình thạnh", "binh thanh", "thạnh mỹ tây", "thanh my tay"] },
  { key: "tan-binh", patterns: ["tân bình", "tan binh", "tansonnhat", "tân sơn nhất", "tan son nhat"] },
  { key: "ba-dinh", patterns: ["ba đình", "ba dinh"] },
  { key: "cau-giay", patterns: ["cầu giấy", "cau giay"] },
  { key: "hai-chau", patterns: ["hải châu", "hai chau"] },
  { key: "ninh-kieu", patterns: ["ninh kiều", "ninh kieu"] },
];

function removeVietnameseTones(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function isVietnamCoordinate(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= VIETNAM_BOUNDS.minLat &&
    lat <= VIETNAM_BOUNDS.maxLat &&
    lng >= VIETNAM_BOUNDS.minLng &&
    lng <= VIETNAM_BOUNDS.maxLng
  );
}

function hashText(text = "") {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export function isMovingOrderStatus(status) {
  return MOVING_STATUSES.has(status);
}

export function extractCoordinatesFromGoogleMaps(input = "") {
  const value = String(input || "").trim();
  if (!value) return null;

  const decoded = safeDecode(value);
  const patterns = [
    /@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /(?:q|query|ll)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /(?:^|[^\d.-])(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)(?:$|[^\d.-])/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (isVietnamCoordinate(lat, lng)) return { lat, lng };
  }

  return null;
}

export function extractReadableAddress(input = "") {
  const value = String(input || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return value;

  try {
    const url = new URL(value);
    const queryAddress = url.searchParams.get("query") || url.searchParams.get("q") || url.searchParams.get("address");
    if (queryAddress && !extractCoordinatesFromGoogleMaps(queryAddress)) return safeDecode(queryAddress);
  } catch {
    // Invalid URL-like string; keep the original value.
  }

  return value;
}

export function buildGoogleMapsSearchUrl(value = "") {
  const text = String(value || "").trim();
  if (!text) return "#";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
}

export function buildGoogleMapsCoordinateUrl(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "#";
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function detectDistrictKey(...values) {
  const text = removeVietnameseTones(values.filter(Boolean).join(" "));
  if (!text) return null;

  const entries = DISTRICT_PATTERNS.flatMap((item) =>
    item.patterns.map((pattern) => ({
      key: item.key,
      pattern: removeVietnameseTones(pattern),
    })),
  ).sort((a, b) => b.pattern.length - a.pattern.length);

  const found = entries.find(({ pattern }) => text.includes(pattern));
  return found?.key || null;
}

function resolveKnownPoint(...values) {
  const text = removeVietnameseTones(values.filter(Boolean).join(" "));
  if (!text) return null;

  const found = KNOWN_ADDRESS_POINTS.find((item) =>
    item.keywords.some((keyword) => text.includes(removeVietnameseTones(keyword))),
  );

  return found ? { ...found, source: "known-address" } : null;
}

function resolveAddressPoint(input, fallbackText = "") {
  const coords = extractCoordinatesFromGoogleMaps(input);
  const readableAddress = extractReadableAddress(input) || fallbackText;
  if (coords) {
    return {
      ...coords,
      label: readableAddress || `${coords.lat}, ${coords.lng}`,
      mapsUrl: buildGoogleMapsCoordinateUrl(coords.lat, coords.lng),
      source: "google-map-coordinates",
    };
  }

  const known = resolveKnownPoint(input, fallbackText);
  if (known) {
    return {
      ...known,
      mapsUrl: buildGoogleMapsCoordinateUrl(known.lat, known.lng),
    };
  }

  const districtKey = detectDistrictKey(input, fallbackText);
  const points = districtKey ? DISTRICT_FALLBACK_POINTS[districtKey] : null;
  if (points?.length) {
    const point = points[0];
    return {
      ...point,
      mapsUrl: buildGoogleMapsCoordinateUrl(point.lat, point.lng),
      source: "district-fallback",
    };
  }

  return null;
}

function pickDistrictPoint(districtInput = "", seed = "") {
  const districtKey = detectDistrictKey(districtInput);
  const points = districtKey ? DISTRICT_FALLBACK_POINTS[districtKey] : null;
  if (!points?.length) return null;
  const index = hashText(`${districtInput}-${seed}`) % points.length;
  const point = points[index];
  return {
    ...point,
    districtKey,
    mapsUrl: buildGoogleMapsCoordinateUrl(point.lat, point.lng),
    source: "district-random",
  };
}

function midpointPoint(originPoint, destinationPoint, seed = "") {
  if (!originPoint || !destinationPoint) return null;
  const ratio = 0.25 + (hashText(seed) % 50) / 100;
  const lat = originPoint.lat + (destinationPoint.lat - originPoint.lat) * ratio;
  const lng = originPoint.lng + (destinationPoint.lng - originPoint.lng) * ratio;
  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    label: "Vị trí mô phỏng trên lộ trình vận chuyển",
    mapsUrl: buildGoogleMapsCoordinateUrl(lat, lng),
    source: "route-midpoint",
  };
}

function fallbackCityPoint(seed = "") {
  const points = DISTRICT_FALLBACK_POINTS["quan-10"];
  const point = points[hashText(seed) % points.length];
  return {
    ...point,
    mapsUrl: buildGoogleMapsCoordinateUrl(point.lat, point.lng),
    source: "default-fallback",
  };
}

export function resolveOrderGps(form = {}) {
  const originInput = form.origin_map_link || form.origin_detail_address || form.origin;
  const destinationInput = form.destination_map_link || form.destination_detail_address || form.destination;
  const seed = `${form.order_code || Date.now()}-${form.status || ""}`;

  const originPoint = resolveAddressPoint(originInput, form.origin);
  const destinationPoint = resolveAddressPoint(destinationInput, form.destination);

  let currentPoint;
  let locationType;

  if (form.status === "Chờ xử lý") {
    currentPoint = originPoint || pickDistrictPoint(form.origin, seed) || fallbackCityPoint(seed);
    locationType = "Điểm xuất phát";
  } else if (form.status === "Đã giao") {
    currentPoint = destinationPoint || pickDistrictPoint(form.destination, seed) || fallbackCityPoint(seed);
    locationType = "Điểm đến";
  } else if (isMovingOrderStatus(form.status)) {
    currentPoint =
      pickDistrictPoint(form.current_district, seed) ||
      midpointPoint(originPoint, destinationPoint, seed) ||
      pickDistrictPoint(`${form.origin} ${form.destination}`, seed) ||
      fallbackCityPoint(seed);
    locationType = form.status === "Đang vận chuyển" ? "Đang trên lộ trình" : `Vị trí khi ${form.status.toLowerCase()}`;
  } else {
    currentPoint = originPoint || destinationPoint || fallbackCityPoint(seed);
    locationType = "Vị trí GPS";
  }

  const currentMapLink =
    form.status === "Chờ xử lý" && form.origin_map_link
      ? form.origin_map_link
      : form.status === "Đã giao" && form.destination_map_link
        ? form.destination_map_link
        : currentPoint?.mapsUrl || "";

  return {
    originPoint,
    destinationPoint,
    currentPoint,
    locationType,
    orderPatch: {
      origin_detail_address: extractReadableAddress(form.origin_detail_address || form.origin_map_link || form.origin),
      destination_detail_address: extractReadableAddress(
        form.destination_detail_address || form.destination_map_link || form.destination,
      ),
      origin_map_link: form.origin_map_link || buildGoogleMapsSearchUrl(form.origin_detail_address || form.origin),
      destination_map_link:
        form.destination_map_link || buildGoogleMapsSearchUrl(form.destination_detail_address || form.destination),
      origin_latitude: originPoint?.lat ?? null,
      origin_longitude: originPoint?.lng ?? null,
      destination_latitude: destinationPoint?.lat ?? null,
      destination_longitude: destinationPoint?.lng ?? null,
      current_latitude: currentPoint?.lat ?? null,
      current_longitude: currentPoint?.lng ?? null,
      current_location_address: currentPoint?.label || "",
      current_location_type: locationType,
      current_map_link: currentMapLink,
      gps_source: currentPoint?.source || "manual-fallback",
    },
  };
}

export function getOrderDisplayAddress(order = {}, type = "origin") {
  if (type === "destination") return order.destination_detail_address || order.destination || "";
  return order.origin_detail_address || order.origin || "";
}

export function getOrderMapHref(order = {}, type = "origin") {
  if (type === "destination") {
    return order.destination_map_link || buildGoogleMapsSearchUrl(getOrderDisplayAddress(order, "destination"));
  }
  return order.origin_map_link || buildGoogleMapsSearchUrl(getOrderDisplayAddress(order, "origin"));
}

export function getOrderGpsPoint(order = {}) {
  const lat = Number(order.current_latitude);
  const lng = Number(order.current_longitude);
  if (isVietnamCoordinate(lat, lng)) {
    return {
      lat,
      lng,
      label: order.current_location_address || order.current_location_type || "Vị trí GPS đơn hàng",
      mapsUrl: order.current_map_link || buildGoogleMapsCoordinateUrl(lat, lng),
      source: order.gps_source,
    };
  }
  return null;
}

export function buildOrderRouteCoords(order = {}, latestPoint = null) {
  const coords = [];
  const originLat = Number(order.origin_latitude);
  const originLng = Number(order.origin_longitude);
  const destLat = Number(order.destination_latitude);
  const destLng = Number(order.destination_longitude);

  if (isVietnamCoordinate(originLat, originLng)) coords.push([originLat, originLng]);
  if (latestPoint?.lat && latestPoint?.lng) coords.push([latestPoint.lat, latestPoint.lng]);
  if (isVietnamCoordinate(destLat, destLng)) coords.push([destLat, destLng]);

  return coords;
}
