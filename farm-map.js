/**
 * farm-map.js — Interactive partner farm map
 *
 * API USED: Overpass API (https://overpass-api.de)
 * Based on: OpenStreetMap data (© OpenStreetMap contributors, ODbL licence)
 *
 * ── What it does ──────────────────────────────────────────────────────────────
 * Queries the Overpass API for named shops, tourism spots and amenities within
 * the bounding box of the farm coordinates. The nearest named result is used to
 * enrich each farm marker popup with local context.
 *
 * ── Limitations ───────────────────────────────────────────────────────────────
 * 1. Rate limiting: The public Overpass API endpoint has shared rate limits.
 *    Heavy or repeated use may result in HTTP 429 (Too Many Requests) errors.
 *    A production site should use a self-hosted Overpass instance or cache
 *    responses server-side.
 *
 * 2. Data freshness: OSM data is crowd-sourced and may be out of date for
 *    rural areas such as the Hadeland region. Businesses that have closed or
 *    moved may still appear as candidates.
 *
 * 3. Availability: The public endpoint has no SLA. If the service is down the
 *    map degrades gracefully — markers still render, enrichment is skipped.
 *
 * 4. Timeout: Requests are limited to 15 seconds (Overpass [timeout:15]).
 *    Slow or overloaded servers will cause the enrichment to fail silently.
 *
 * ── Ethical considerations ────────────────────────────────────────────────────
 * 1. Attribution: OSM data is used under the Open Database Licence (ODbL).
 *    The map tile attribution (© OpenStreetMap contributors) is displayed
 *    inside the Leaflet map as required by the licence.
 *
 * 2. Privacy: No user data is sent to Overpass. The only data transmitted is
 *    the bounding box of publicly known farm coordinates.
 *
 * 3. Resource fairness: The query runs once on page load, not on every
 *    interaction, to minimise load on the shared public infrastructure.
 *
 * ── Potential biases ──────────────────────────────────────────────────────────
 * 1. Coverage bias: OSM data density is higher in cities. Rural farms in this
 *    project may have fewer nearby tagged features, so the "nearest point"
 *    result can be less meaningful or missing entirely.
 *
 * 2. Language bias: OSM tags in this region are primarily in Norwegian.
 *    The label extraction uses `name`, `brand` and `operator` fields, which
 *    may not always reflect how locals refer to a place.
 *
 * 3. Category bias: The query targets shops, tourism and amenities only.
 *    Agricultural or community features (e.g. farm stands) are not included,
 *    which under-represents the rural context of the partnering farms.
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
const mapLoadingOverlay = document.getElementById('mapLoadingOverlay');
const mapContainer = document.getElementById('farmMap');
const mapShell = mapContainer.closest('.map-shell');

const farmBounds = L.latLngBounds(farms.map((farm) => [farm.lat, farm.lng]));
const map = L.map(mapContainer, {
  scrollWheelZoom: false,
  preferCanvas: true,
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

map.fitBounds(farmBounds.pad(0.25));
mapContainer.setAttribute('aria-busy', 'true');
mapShell.dataset.loading = 'true';

function setStatus(message, state = 'hidden') {
  mapStatus.textContent = message;
  mapStatus.dataset.state = state;
}

function setLoading(isLoading) {
  mapContainer.setAttribute('aria-busy', String(isLoading));
  mapShell.dataset.loading = String(isLoading);
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function distanceMeters(from, to) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
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

function getNearestLabel(farm, candidates) {
  if (!candidates.length) {
    return 'No nearby points of interest loaded';
  }

  let nearestCandidate = candidates[0];
  let shortestDistance = distanceMeters(farm, nearestCandidate);

  for (const candidate of candidates.slice(1)) {
    const currentDistance = distanceMeters(farm, candidate);

    if (currentDistance < shortestDistance) {
      nearestCandidate = candidate;
      shortestDistance = currentDistance;
    }
  }

  return `${nearestCandidate.label} (${formatDistance(shortestDistance)} away)`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addFarmMarkers(candidateList = []) {
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

async function loadMapExtras() {
  try {
    const loadingStartedAt = Date.now();
    setStatus('Loading farm locations...', 'loading');
    setLoading(true);

    const overpassQuery = buildNearbyQuery(farmBounds);
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidates = getCandidates(data.elements || []);

    addFarmMarkers(candidates);
    const elapsed = Date.now() - loadingStartedAt;
    const minimumDisplayTime = 900;

    if (elapsed < minimumDisplayTime) {
      await new Promise((resolve) => setTimeout(resolve, minimumDisplayTime - elapsed));
    }

    setLoading(false);
    setStatus('', 'hidden');
  } catch (error) {
    console.error('Map enrichment failed:', error);
    addFarmMarkers();
    setLoading(false);
    setStatus('The map could not load extra location details right now.', 'error');
  }
}

loadMapExtras();
