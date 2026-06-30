const MAP_CACHE_NAME = "pubg-map-hd-v1";

async function getCachedMapBlob(url) {
  if (!window.caches) return null;
  try {
    const cache = await caches.open(MAP_CACHE_NAME);
    const res = await cache.match(url);
    return res ? await res.blob() : null;
  } catch {
    return null;
  }
}

async function cacheMapBlob(url, blob) {
  if (!window.caches) return;
  try {
    const cache = await caches.open(MAP_CACHE_NAME);
    await cache.put(url, new Response(blob));
  } catch {}
}

async function isMapCached(url) {
  return !!(await getCachedMapBlob(url));
}

async function fetchMapBlob(url) {
  const cached = await getCachedMapBlob(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được: ${url}`);
  const blob = await res.blob();
  await cacheMapBlob(url, blob);
  return blob;
}

function decodeImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      img._blobUrl = url;
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không giải mã được ảnh"));
    };
    img.src = url;
  });
}

function revokeMapImage(img) {
  if (img?._blobUrl) {
    URL.revokeObjectURL(img._blobUrl);
    img._blobUrl = null;
  }
}

async function loadMapImage(url) {
  const blob = await fetchMapBlob(url);
  return decodeImageFromBlob(blob);
}

async function preloadMapUrl(url) {
  try {
    await fetchMapBlob(url);
    return true;
  } catch {
    return false;
  }
}
