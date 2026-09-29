// Region helpers for the Bengal-wide Puja explorer.
// Regions are deliberately coordinate-first: they do not depend on GPS and
// work when the user is testing from outside Kolkata.

export const EXPLORE_REGIONS = [
  { id: 'KOLKATA', label: 'Kolkata', center: [88.3639, 22.5726], zoom: 11.4 },
  { id: 'HOWRAH', label: 'Howrah', center: [88.3426, 22.583], zoom: 12.2 },
  { id: 'SERAMPORE', label: 'Serampore', center: [88.3398, 22.7533], zoom: 13.2 },
  { id: 'CHANDANNAGAR', label: 'Chandannagar', center: [88.3695, 22.8653], zoom: 13.2 },
  { id: 'OTHER', label: 'Other Areas', center: [88.45, 22.75], zoom: 9.5 },
];

const BOXES = {
  KOLKATA: { minLat: 22.42, maxLat: 22.69, minLng: 88.25, maxLng: 88.49 },
  HOWRAH: { minLat: 22.50, maxLat: 22.66, minLng: 88.23, maxLng: 88.36 },
  SERAMPORE: { minLat: 22.69, maxLat: 22.82, minLng: 88.29, maxLng: 88.39 },
  CHANDANNAGAR: { minLat: 22.81, maxLat: 22.92, minLng: 88.32, maxLng: 88.42 },
};

export function getExploreRegion(id) {
  return EXPLORE_REGIONS.find((item) => item.id === id) || EXPLORE_REGIONS[0];
}

export function classifyRegion(puja) {
  const lat = Number(puja?.latitude);
  const lng = Number(puja?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'OTHER';

  for (const [id, box] of Object.entries(BOXES)) {
    if (lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng) {
      return id;
    }
  }

  const text = `${puja?.area || ''} ${puja?.name || ''}`.toLowerCase();
  if (text.includes('serampore') || text.includes('srirampur')) return 'SERAMPORE';
  if (text.includes('chandannagar') || text.includes('chinsurah')) return 'CHANDANNAGAR';
  if (text.includes('howrah')) return 'HOWRAH';
  return 'OTHER';
}

export function filterByRegion(pujas, regionId) {
  if (!regionId || regionId === 'ALL') return pujas;
  if (regionId === 'OTHER') {
    return pujas.filter((puja) => classifyRegion(puja) === 'OTHER');
  }
  return pujas.filter((puja) => classifyRegion(puja) === regionId);
}
