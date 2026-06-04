/**
 * Loads and displays the partner farm map using Leaflet.
 * The map only loads when it scrolls into view to keep the page fast.
 * Farm data is shown from local data. The Overpass API adds extra
 * map context in the background and results are cached for 12 hours.
 */

const farms = [
  {
    name: 'Braastad Gaard',
    subtitle: 'Oppdalslinna 242, 2740 Roa, Norway',
    description:
      'Family-run farm focused on crisp root vegetables and seasonal greens grown with soil-friendly methods.',
    signatureProduce: ['Carrots', 'Potatoes', 'Leafy greens'],
    deliveryArea: 'Roa, Lunner and surrounding areas',
    seasonWindow: 'June–October',
    lat: 60.2679,
    lng: 10.6056,
  },
  {
    name: 'Haakenstad Gård',
    subtitle: 'Haakenstadlinna 109, 2740 Roa, Norway',
    description:
      'Known for robust onion varieties and storage crops harvested at peak maturity for long-lasting flavor.',
    signatureProduce: ['Red onions', 'Yellow onions', 'Leeks'],
    deliveryArea: 'Roa, Gran and Jaren',
    seasonWindow: 'August–March',
    lat: 60.2815,
    lng: 10.6442,
  },
  {
    name: 'Øvre Kjekshus Gård',
    subtitle: 'Vienlinna 427, 2750 Gran, Norway',
    description:
      'Produces high-quality grains and garlic with attention to biodiversity and traditional cultivation.',
    signatureProduce: ['Oats', 'Garlic', 'Seasonal herbs'],
    deliveryArea: 'Gran, Brandbu and Hadeland',
    seasonWindow: 'Year-round (season-dependent selection)',
    lat: 60.3768,
    lng: 10.5628,
  },
];

const mapStatus = document.getElementById('mapStatus');
const mapContainer = document.getElementById('farmMap');
const mapShell = mapContainer?.closest('.map-shell');

const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_ASSET_INTEGRITY = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';

const OVERPASS_CACHE_KEY = 'fram-map-overpass-cache-v1';
const OVERPASS_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

if (!mapContainer || !mapShell || !mapStatus) {
  // Not on a page that contains the map.
} else {
  startWhenVisible();
}

function setStatus(message, state = 'hidden') {
  mapStatus.textContent = message;
  mapStatus.dataset.state = state;
}

function setLoading(isLoading) {
  mapContainer.setAttribute('aria-busy', String(isLoading));
  mapShell.dataset.loading = String(isLoading);
}

function loadLeafletCss() {
  if (document.querySelector('link[data-leaflet-style="true"]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS_URL;
  link.integrity = LEAFLET_ASSET_INTEGRITY;
  link.crossOrigin = '';
  link.dataset.leafletStyle = 'true';
  document.head.appendChild(link);
}

function loadLeafletJs() {
  if (window.L) {
    return Promise.resolve();
  }

  const existing = document.querySelector('script[data-leaflet-script="true"]');

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Leaflet.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.crossOrigin = '';
    script.defer = true;
    script.dataset.leafletScript = 'true';

    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Leaflet.')), { once: true });

    document.head.appendChild(script);
  });
}

async function ensureLeafletLoaded() {
  loadLeafletCss();
  await loadLeafletJs();
}

function getCachedCandidates() {
  try {
    const raw = sessionStorage.getItem(OVERPASS_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const isValid =
      parsed &&
      typeof parsed.savedAt === 'number' &&
      Array.isArray(parsed.candidates) &&
      Date.now() - parsed.savedAt < OVERPASS_CACHE_TTL_MS;

    if (!isValid) {
      sessionStorage.removeItem(OVERPASS_CACHE_KEY);
      return null;
    }

    return parsed.candidates;
  } catch {
    return null;
  }
}

function setCachedCandidates(candidates) {
  try {
    sessionStorage.setItem(
      OVERPASS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        candidates,
      })
    );
  } catch {
    // Ignore storage quota/privacy mode errors.
  }
}

function buildNearbyQuery(bounds) {
  const south = bounds.getSouth() - 0.02;
  const west = bounds.getWest() - 0.02;
  const north = bounds.getNorth() + 0.02;
  const east = bounds.getEast() + 0.02;

  return `[out:json][timeout:15];(
    node["shop"](${south},${west},${north},${east});
    node["tourism"](${south},${west},${north},${east});
    node["amenity"](${south},${west},${north},${east});
  );out center tags;`;
}

function getCandidates(apiElements) {
  return apiElements
    .map((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lng = element.lon ?? element.center?.lon;
      const label = element.tags && (element.tags.name || element.tags.brand || element.tags.operator);

      if (!label || typeof lat !== 'number' || typeof lng !== 'number') {
        return null;
      }

      return {
        label,
        lat,
        lng,
      };
    })
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addFarmMarkers(map) {
  farms.forEach((farm, index) => {
    const marker = L.marker([farm.lat, farm.lng]).addTo(map);

    const hoverLabel = `
      <div class="farm-tooltip__name">${escapeHtml(farm.name)}</div>
      <div class="farm-tooltip__meta">${escapeHtml(farm.signatureProduce.join(' • '))}</div>
    `;

    const popupDetails = `
      <article class="farm-popup">
        <p class="farm-popup__eyebrow">Partner farm #${index + 1}</p>
        <h3 class="farm-popup__title">${escapeHtml(farm.name)}</h3>
        <p class="farm-popup__address">${escapeHtml(farm.subtitle)}</p>
        <p class="farm-popup__description">${escapeHtml(farm.description)}</p>
        <p class="farm-popup__produce"><strong>Signature produce:</strong> ${escapeHtml(farm.signatureProduce.join(', '))}</p>
        <p class="farm-popup__nearby"><strong>Delivery area:</strong> ${escapeHtml(farm.deliveryArea)}</p>
        <p class="farm-popup__nearby"><strong>Main season:</strong> ${escapeHtml(farm.seasonWindow)}</p>
      </article>
    `;

    marker.bindPopup(popupDetails, {
      className: 'farm-popup-frame',
      maxWidth: 320,
      minWidth: 240,
      autoPanPadding: [18, 24],
    });

    marker.bindTooltip(hoverLabel, {
      className: 'farm-tooltip-frame',
      direction: 'top',
      offset: [0, -10],
      opacity: 1,
    });
  });
}

async function fetchOverpassCandidates(farmBounds) {
  const cached = getCachedCandidates();

  if (cached) {
    return cached;
  }

  const overpassQuery = buildNearbyQuery(farmBounds);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidates = getCandidates(data.elements || []);

    setCachedCandidates(candidates);
    return candidates;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function loadMapExtrasInBackground() {
  try {
    setStatus('Loading extra map context...', 'loading');
    const farmBounds = window.L.latLngBounds(farms.map((farm) => [farm.lat, farm.lng]));
    await fetchOverpassCandidates(farmBounds);
    setStatus('', 'hidden');
  } catch (error) {
    console.warn('Map enrichment skipped:', error);
    setStatus('Extra map context is unavailable right now.', 'error');
  }
}

async function initMap() {
  setLoading(true);
  setStatus('Loading map...', 'loading');

  try {
    await ensureLeafletLoaded();

    const farmBounds = window.L.latLngBounds(farms.map((farm) => [farm.lat, farm.lng]));

    const map = L.map(mapContainer, {
      scrollWheelZoom: false,
      preferCanvas: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.fitBounds(farmBounds.pad(0.25));
    addFarmMarkers(map);

    setLoading(false);
    setStatus('', 'hidden');

    // Avoid size glitches after hidden/transitioned containers.
    window.setTimeout(() => map.invalidateSize(), 60);

    // Optional enrichment should never block map interactivity.
    void loadMapExtrasInBackground();
  } catch (error) {
    console.warn('Map failed to initialize:', error);
    setLoading(false);
    setStatus('Map is unavailable right now.', 'error');
  }
}

function startWhenVisible() {
  let hasStarted = false;

  const start = () => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    void initMap();
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);

      if (!isVisible) {
        return;
      }

      observer.disconnect();
      start();
    },
    {
      rootMargin: '180px 0px',
      threshold: 0.01,
    }
  );

  observer.observe(mapShell);
}
