if (!requireAuth()) throw new Error("Unauthorized");

const session = getSession();
const userBadge = document.getElementById("userBadge");
const btnLogout = document.getElementById("btnLogout");
const btnAdmin = document.getElementById("btnAdmin");

if (userBadge && session) {
  userBadge.textContent = session.username;
}
if (btnAdmin && isAdmin()) {
  btnAdmin.style.display = "inline-block";
}
if (btnLogout) {
  btnLogout.addEventListener("click", logout);
}

const mapSelect = document.getElementById("mapSelect");
const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas.getContext("2d");
const mapImageLow = new Image();
const mapImageHigh = new Image();
mapImageLow.crossOrigin = "anonymous";
mapImageHigh.crossOrigin = "anonymous";
const mapViewport = document.getElementById("mapViewport");
const mapStage = document.getElementById("mapStage");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");
const loading = document.getElementById("loading");
const loadingText = loading.querySelector(".loading-text");
const distanceValue = document.getElementById("distanceValue");
const mortarStatus = document.getElementById("mortarStatus");
const mapInfo = document.getElementById("mapInfo");
const coordsText = document.getElementById("coordsText");
const zoomLabel = document.getElementById("zoomLabel");

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 12;
const ZOOM_STEP = 1.25;

let currentMap = MAPS[0];
let baseWidth = 0;
let baseHeight = 0;
let scale = 1;
let panX = 0;
let panY = 0;
let pointA = null;
let pointB = null;
let dragging = false;
let dragCurrent = null;
let panning = false;
let panStart = null;
let pinchStart = null;
let activeMapImage = null;
let mapNativeW = 0;
let mapNativeH = 0;
let hdReady = false;
let hdLoading = false;
let mapLoadToken = 0;
const bunkerImageCache = new Map();

MAPS.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = m.id;
  opt.textContent = `${m.name} (${m.sizeM / 1000}km)`;
  mapSelect.appendChild(opt);
  if (i === 0) mapSelect.value = m.id;
});

function getMapById(id) {
  return MAPS.find((m) => m.id === id) || MAPS[0];
}

function setMapLoading(show, text = "Đang tải bản đồ…") {
  loadingText.textContent = text;
  loading.classList.toggle("hidden", !show);
}

function startMeasure(p) {
  pointA = p;
  pointB = null;
  dragCurrent = p;
  dragging = true;
  mapViewport.classList.add("measuring");
  distanceValue.textContent = "0";
  updateMortarStatus(0);
  redraw();
}

function isMeasureTrigger(e) {
  return e.button === 2;
}

function isPanTrigger(e) {
  return e.button === 0 || e.button === 1;
}

function updateMapInfo() {
  const quality = hdReady ? "HD" : hdLoading ? "SD → HD" : "SD";
  mapInfo.textContent = `${currentMap.sizeM / 1000}×${currentMap.sizeM / 1000} km · ${quality}`;
}

function updateZoomLabel() {
  let label = Math.round(scale * 100) + "%";
  if (hdReady) label += " HD";
  zoomLabel.textContent = label;
}

function renderMapCanvas() {
  if (!activeMapImage || !activeMapImage.naturalWidth || baseWidth <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  const displayW = baseWidth * scale;
  const displayH = baseHeight * scale;
  mapCanvas.style.width = displayW + "px";
  mapCanvas.style.height = displayH + "px";
  mapCanvas.width = Math.max(1, Math.round(displayW * dpr));
  mapCanvas.height = Math.max(1, Math.round(displayH * dpr));
  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mapCtx.imageSmoothingEnabled = true;
  mapCtx.imageSmoothingQuality = "high";
  mapCtx.clearRect(0, 0, displayW, displayH);
  mapCtx.drawImage(
    activeMapImage,
    0, 0, activeMapImage.naturalWidth, activeMapImage.naturalHeight,
    0, 0, displayW, displayH
  );
}

function applyTransform() {
  mapStage.style.transform = `translate(${panX}px, ${panY}px)`;
  renderMapCanvas();
  updateZoomLabel();
  redraw();
}

function fitMapToViewport(resetPan = true) {
  if (!mapNativeW) return;
  const vw = mapViewport.clientWidth;
  const vh = mapViewport.clientHeight;
  const aspect = mapNativeW / mapNativeH;

  if (vw / vh > aspect) {
    baseHeight = vh;
    baseWidth = vh * aspect;
  } else {
    baseWidth = vw;
    baseHeight = vw / aspect;
  }

  if (resetPan) {
    scale = 1;
    panX = (vw - baseWidth) / 2;
    panY = (vh - baseHeight) / 2;
  }
  applyTransform();
}

function resizeOverlay() {
  const dpr = window.devicePixelRatio || 1;
  const w = mapViewport.clientWidth;
  const h = mapViewport.clientHeight;
  overlay.width = w * dpr;
  overlay.height = h * dpr;
  overlay.style.width = w + "px";
  overlay.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (mapNativeW) {
    const savedScale = scale;
    const savedPanX = panX;
    const savedPanY = panY;
    fitMapToViewport(false);
    scale = savedScale;
    panX = savedPanX;
    panY = savedPanY;
    clampPan();
    applyTransform();
  }
}

function viewportPoint(clientX, clientY) {
  const r = mapViewport.getBoundingClientRect();
  return { x: clientX - r.left, y: clientY - r.top };
}

function screenToUV(sx, sy) {
  const mapW = baseWidth * scale;
  const mapH = baseHeight * scale;
  const mx = sx - panX;
  const my = sy - panY;
  if (mx < 0 || my < 0 || mx > mapW || my > mapH) return null;
  return { u: mx / mapW, v: my / mapH };
}

function uvToScreen(uv) {
  return {
    x: panX + uv.u * baseWidth * scale,
    y: panY + uv.v * baseHeight * scale,
  };
}

function clientToMap(clientX, clientY) {
  const vp = viewportPoint(clientX, clientY);
  return screenToUV(vp.x, vp.y);
}

function uvDistanceMeters(p1, p2) {
  const dx = (p2.u - p1.u) * mapNativeW;
  const dy = (p2.v - p1.v) * mapNativeH;
  return Math.hypot(dx, dy) * (currentMap.sizeM / mapNativeW);
}

function formatMeters(m) {
  if (!Number.isFinite(m)) return "—";
  return Math.round(m).toString();
}

function updateMortarStatus(meters) {
  mortarStatus.className = "mortar-status";
  if (!Number.isFinite(meters)) {
    mortarStatus.classList.add("idle");
    mortarStatus.textContent = "Tầm cối: 121m – 700m";
    return;
  }
  if (meters < MORTAR_MIN) {
    mortarStatus.classList.add("too-close");
    mortarStatus.textContent = `Quá gần (<${MORTAR_MIN}m)`;
  } else if (meters > MORTAR_MAX) {
    mortarStatus.classList.add("too-far");
    mortarStatus.textContent = `Quá xa (>${MORTAR_MAX}m)`;
  } else {
    mortarStatus.classList.add("in-range");
    mortarStatus.textContent = "✓ Trong tầm — có thể bắn";
  }
}

function clampPan() {
  const vw = mapViewport.clientWidth;
  const vh = mapViewport.clientHeight;
  const mapW = baseWidth * scale;
  const mapH = baseHeight * scale;
  const margin = 40;

  if (mapW <= vw) {
    panX = (vw - mapW) / 2;
  } else {
    panX = Math.min(margin, Math.max(vw - mapW - margin, panX));
  }
  if (mapH <= vh) {
    panY = (vh - mapH) / 2;
  } else {
    panY = Math.min(margin, Math.max(vh - mapH - margin, panY));
  }
}

function zoomAt(sx, sy, factor) {
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * factor));
  if (newScale === scale) return;
  const mapW = baseWidth * scale;
  const mapH = baseHeight * scale;
  const u = (sx - panX) / mapW;
  const v = (sy - panY) / mapH;
  scale = newScale;
  panX = sx - u * baseWidth * scale;
  panY = sy - v * baseHeight * scale;
  clampPan();
  applyTransform();
  maybeLoadHD();
}

function zoomBy(factor) {
  const vw = mapViewport.clientWidth;
  const vh = mapViewport.clientHeight;
  zoomAt(vw / 2, vh / 2, factor);
}

function resetZoom() {
  fitMapToViewport(true);
}

function drawMarker(canvasPt, color, label) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvasPt.x, canvasPt.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (label) {
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeText(label, canvasPt.x + 10, canvasPt.y - 8);
    ctx.fillText(label, canvasPt.x + 10, canvasPt.y - 8);
  }
  ctx.restore();
}

function drawLine(p1, p2, color, dashed) {
  const c1 = uvToScreen(p1);
  const c2 = uvToScreen(p2);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  if (dashed) ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.stroke();
  ctx.restore();
}

function redraw() {
  const w = mapViewport.clientWidth;
  const h = mapViewport.clientHeight;
  ctx.clearRect(0, 0, w, h);
  if (baseWidth <= 0) return;

  if (pointA) drawMarker(uvToScreen(pointA), "#3dd68c", "Bạn");
  if (pointB) drawMarker(uvToScreen(pointB), "#ff6b6b", "Địch");

  if (pointA && pointB) {
    drawLine(pointA, pointB, "#f5a623", false);
    const mid = uvToScreen({
      u: (pointA.u + pointB.u) / 2,
      v: (pointA.v + pointB.v) / 2,
    });
    const dist = uvDistanceMeters(pointA, pointB);
    ctx.save();
    ctx.font = "bold 13px Segoe UI, sans-serif";
    ctx.fillStyle = "#f5a623";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    const text = formatMeters(dist) + " m";
    ctx.strokeText(text, mid.x + 8, mid.y - 8);
    ctx.fillText(text, mid.x + 8, mid.y - 8);
    ctx.restore();
  } else if (pointA && dragCurrent && dragging) {
    drawLine(pointA, dragCurrent, "rgba(245, 166, 35, 0.7)", true);
    const dist = uvDistanceMeters(pointA, dragCurrent);
    distanceValue.textContent = formatMeters(dist);
    updateMortarStatus(dist);
  }
}

function finishMeasure(endPoint) {
  pointB = endPoint;
  dragging = false;
  dragCurrent = null;
  const dist = uvDistanceMeters(pointA, pointB);
  distanceValue.textContent = formatMeters(dist);
  updateMortarStatus(dist);
  coordsText.textContent = `${formatMeters(dist)} m`;
  redraw();
}

function maybeLoadHD() {
  if (hdReady || hdLoading || scale < 1.5) return;
  hdLoading = true;
  updateMapInfo();
  mapImageHigh.src = currentMap.imgHigh;
}

function loadMap(map) {
  const token = ++mapLoadToken;
  currentMap = map;
  setMapLoading(true, "Đang tải bản đồ…");
  pointA = null;
  pointB = null;
  dragging = false;
  dragCurrent = null;
  distanceValue.textContent = "—";
  updateMortarStatus(NaN);
  coordsText.textContent = "";
  hdReady = false;
  hdLoading = false;
  activeMapImage = null;
  mapNativeW = 0;
  mapNativeH = 0;
  mapImageHigh.src = "";
  updateMapInfo();

  mapImageLow.onload = () => {
    if (token !== mapLoadToken) return;
    activeMapImage = mapImageLow;
    mapNativeW = mapImageLow.naturalWidth;
    mapNativeH = mapImageLow.naturalHeight;
    setMapLoading(false);
    fitMapToViewport(true);
    resizeOverlay();
    updateMapInfo();
  };

  mapImageLow.onerror = () => {
    if (token !== mapLoadToken) return;
    setMapLoading(true, "Không tải được map — cần internet");
  };

  mapImageHigh.onload = () => {
    if (token !== mapLoadToken) return;
    activeMapImage = mapImageHigh;
    mapNativeW = mapImageHigh.naturalWidth;
    mapNativeH = mapImageHigh.naturalHeight;
    hdReady = true;
    hdLoading = false;
    applyTransform();
    updateMapInfo();
  };

  mapImageHigh.onerror = () => {
    if (token !== mapLoadToken) return;
    hdLoading = false;
    updateMapInfo();
  };

  mapImageLow.src = map.imgLow;
}

mapSelect.addEventListener("change", () => {
  loadMap(getMapById(mapSelect.value));
});

mapViewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const vp = viewportPoint(e.clientX, e.clientY);
  const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
  zoomAt(vp.x, vp.y, factor);
}, { passive: false });

mapViewport.addEventListener("mousedown", (e) => {
  if (isPanTrigger(e)) {
    e.preventDefault();
    panning = true;
    panStart = { x: e.clientX, y: e.clientY, panX, panY };
    mapViewport.classList.add("panning");
    return;
  }
  if (!isMeasureTrigger(e)) return;
  const p = clientToMap(e.clientX, e.clientY);
  if (!p) return;
  e.preventDefault();
  startMeasure(p);
});

mapViewport.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("mousemove", (e) => {
  if (panning && panStart) {
    panX = panStart.panX + (e.clientX - panStart.x);
    panY = panStart.panY + (e.clientY - panStart.y);
    clampPan();
    applyTransform();
    return;
  }
  if (!dragging || !pointA) return;
  const p = clientToMap(e.clientX, e.clientY);
  if (!p) return;
  dragCurrent = p;
  const dist = uvDistanceMeters(pointA, dragCurrent);
  distanceValue.textContent = formatMeters(dist);
  updateMortarStatus(dist);
  redraw();
});

window.addEventListener("mouseup", (e) => {
  if (panning) {
    panning = false;
    panStart = null;
    mapViewport.classList.remove("panning");
    return;
  }
  if (!dragging) return;
  mapViewport.classList.remove("measuring");
  const p = clientToMap(e.clientX, e.clientY);
  if (p && pointA) {
    finishMeasure(p);
  } else {
    dragging = false;
    dragCurrent = null;
    redraw();
  }
});

mapViewport.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    dragging = false;
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    const p0 = viewportPoint(t0.clientX, t0.clientY);
    const p1 = viewportPoint(t1.clientX, t1.clientY);
    pinchStart = {
      dist: Math.hypot(p1.x - p0.x, p1.y - p0.y),
      scale,
      midX: (p0.x + p1.x) / 2,
      midY: (p0.y + p1.y) / 2,
      panX,
      panY,
    };
    return;
  }
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  e.preventDefault();
  panning = true;
  panStart = { x: t.clientX, y: t.clientY, panX, panY };
  mapViewport.classList.add("panning");
}, { passive: false });

mapViewport.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && pinchStart) {
    e.preventDefault();
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    const p0 = viewportPoint(t0.clientX, t0.clientY);
    const p1 = viewportPoint(t1.clientX, t1.clientY);
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    const newScale = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, pinchStart.scale * (dist / pinchStart.dist))
    );
    const mapW = baseWidth * pinchStart.scale;
    const mapH = baseHeight * pinchStart.scale;
    const u = (pinchStart.midX - pinchStart.panX) / mapW;
    const v = (pinchStart.midY - pinchStart.panY) / mapH;
    scale = newScale;
    panX = midX - u * baseWidth * scale;
    panY = midY - v * baseHeight * scale;
    clampPan();
    applyTransform();
    maybeLoadHD();
    return;
  }
  if (panning && panStart && e.touches.length === 1) {
    e.preventDefault();
    const t = e.touches[0];
    panX = panStart.panX + (t.clientX - panStart.x);
    panY = panStart.panY + (t.clientY - panStart.y);
    clampPan();
    applyTransform();
    return;
  }
  if (!dragging || e.touches.length !== 1) return;
  e.preventDefault();
  const t = e.touches[0];
  const p = clientToMap(t.clientX, t.clientY);
  if (!p) return;
  dragCurrent = p;
  const dist = uvDistanceMeters(pointA, dragCurrent);
  distanceValue.textContent = formatMeters(dist);
  updateMortarStatus(dist);
  redraw();
}, { passive: false });

mapViewport.addEventListener("touchend", (e) => {
  if (pinchStart && e.touches.length < 2) {
    pinchStart = null;
    return;
  }
  if (panning && e.touches.length === 0) {
    panning = false;
    panStart = null;
    mapViewport.classList.remove("panning");
    return;
  }
  if (!dragging) return;
  mapViewport.classList.remove("measuring");
  const t = e.changedTouches[0];
  const p = clientToMap(t.clientX, t.clientY);
  if (p && pointA) finishMeasure(p);
});

function bindZoomButtons(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", fn);
}
bindZoomButtons("btnZoomInFloat", () => zoomBy(ZOOM_STEP));
bindZoomButtons("btnZoomOutFloat", () => zoomBy(1 / ZOOM_STEP));
bindZoomButtons("btnZoomFit", resetZoom);

document.getElementById("btnClear").addEventListener("click", () => {
  pointA = null;
  pointB = null;
  dragging = false;
  dragCurrent = null;
  distanceValue.textContent = "—";
  updateMortarStatus(NaN);
  coordsText.textContent = "";
  redraw();
});

window.addEventListener("resize", resizeOverlay);
loadMap(MAPS[0]);

/* Modal hầm bí mật — preload + cache */
const bunkerModal = document.getElementById("bunkerModal");
const bunkerMapSelect = document.getElementById("bunkerMapSelect");
const bunkerImage = document.getElementById("bunkerImage");
const bunkerLoading = document.getElementById("bunkerLoading");
const btnOpenBunker = document.getElementById("btnOpenBunker");
const btnCloseBunker = document.getElementById("btnCloseBunker");

Object.entries(BUNKER_MAP_IMAGES).forEach(([id, data]) => {
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = data.name;
  bunkerMapSelect.appendChild(opt);

  const img = new Image();
  const entry = { img, ready: false, error: false };
  bunkerImageCache.set(id, entry);
  img.onload = () => { entry.ready = true; };
  img.onerror = () => { entry.error = true; };
  img.src = data.image;
});

function showBunkerImage(mapId) {
  const data = BUNKER_MAP_IMAGES[mapId];
  if (!data) return;

  const cached = bunkerImageCache.get(mapId);
  bunkerImage.hidden = true;
  bunkerLoading.classList.remove("hidden");

  function display(src) {
    bunkerImage.src = src;
    if (bunkerImage.decode) {
      bunkerImage.decode().then(() => {
        bunkerLoading.classList.add("hidden");
        bunkerImage.hidden = false;
      }).catch(() => {
        bunkerLoading.classList.add("hidden");
        bunkerImage.hidden = false;
      });
    } else {
      bunkerImage.onload = () => {
        bunkerLoading.classList.add("hidden");
        bunkerImage.hidden = false;
      };
    }
  }

  if (cached?.ready) {
    display(cached.img.src);
    return;
  }
  if (cached?.error) {
    bunkerLoading.querySelector("span").textContent = "Không tải được ảnh";
    return;
  }

  const wait = setInterval(() => {
    if (cached.ready) {
      clearInterval(wait);
      display(cached.img.src);
    } else if (cached.error) {
      clearInterval(wait);
      bunkerLoading.querySelector("span").textContent = "Không tải được ảnh";
    }
  }, 50);
}

function openBunkerModal() {
  bunkerModal.classList.add("open");
  document.body.style.overflow = "hidden";
  if (BUNKER_MAP_IMAGES[currentMap.id]) {
    bunkerMapSelect.value = currentMap.id;
  }
  showBunkerImage(bunkerMapSelect.value);
}

function closeBunkerModal() {
  bunkerModal.classList.remove("open");
  document.body.style.overflow = "";
}

btnOpenBunker.addEventListener("click", openBunkerModal);
btnCloseBunker.addEventListener("click", closeBunkerModal);
bunkerMapSelect.addEventListener("change", () => {
  showBunkerImage(bunkerMapSelect.value);
});
bunkerModal.addEventListener("click", (e) => {
  if (e.target === bunkerModal) closeBunkerModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && bunkerModal.classList.contains("open")) {
    closeBunkerModal();
  }
});
