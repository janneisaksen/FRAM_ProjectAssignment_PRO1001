const farms = [
  {
    name: 'Braastad Gaard',
    subtitle: 'Oppdalslinna 242, 2740 Roa, Norway',
    lat: 60.2679,
    lng: 10.6056,
  },
  {
    name: 'Haakenstad Gård',
    subtitle: 'Haakenstadlinna 109, 2740 Roa, Norway',
    lat: 60.2815,
    lng: 10.6442,
  },
  {
    name: 'Øvre Kjekshus Gård',
    subtitle: 'Vienlinna 427, 2750 Gran, Norway',
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
    return 'No nearby OSM feature loaded';
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

function addFarmMarkers(candidateList = []) {
  farms.forEach((farm, index) => {
    const marker = L.marker([farm.lat, farm.lng]).addTo(map);
    const nearest = getNearestLabel(farm, candidateList);
    const routeLabel = `${farm.name} — ${farm.subtitle}`;

    marker.bindPopup(`
      <strong>${routeLabel}</strong><br />
      Fixed coordinates in code<br />
      Nearby enrichment: ${nearest}
    `);

    marker.bindTooltip(routeLabel, { direction: 'top', offset: [0, -8] });
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
