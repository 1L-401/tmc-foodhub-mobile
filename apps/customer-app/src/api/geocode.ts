/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key).
 * Converts an address string to { latitude, longitude } coordinates.
 */

interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

const geocodeCache = new Map<string, GeocodedLocation | null>();

/**
 * Geocode an address string to lat/lng using Nominatim.
 * Results are cached in-memory to avoid redundant network calls.
 */
export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const trimmed = address.trim();
  const fallbackLocation: GeocodedLocation = { latitude: 14.5995, longitude: 120.9842 }; // Manila

  if (!trimmed) {
    return fallbackLocation;
  }

  // Return cached result if available
  if (geocodeCache.has(trimmed)) {
    return geocodeCache.get(trimmed) ?? null;
  }

  try {
    const encodedAddress = encodeURIComponent(trimmed);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TMCFoodHub/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      geocodeCache.set(trimmed, fallbackLocation);
      return fallbackLocation;
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      geocodeCache.set(trimmed, fallbackLocation);
      return fallbackLocation;
    }

    const first = results[0];
    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      geocodeCache.set(trimmed, fallbackLocation);
      return fallbackLocation;
    }

    const location: GeocodedLocation = { latitude, longitude };
    geocodeCache.set(trimmed, location);
    return location;
  } catch {
      geocodeCache.set(trimmed, fallbackLocation);
      return fallbackLocation;
  }
}

/**
 * Build a static map tile image URL for given coordinates.
 * Using Yandex Static Maps API as a highly reliable fallback that resembles Google Maps styling.
 * Note: Yandex uses longitude,latitude format.
 */
export function buildStaticMapUrl(
  latitude: number,
  longitude: number,
  zoom = 18,
  width = 600,
  height = 300,
): string {
  // Yandex max size is 600x450, we clamp to that.
  const w = Math.min(width, 600);
  const h = Math.min(height, 450);
  return `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&size=${w},${h}&z=${zoom}&l=map&pt=${longitude},${latitude},pm2rdm`;
}

/**
 * Build a static map URL with a route line (polyline) between two coordinates
 */
export function buildRouteStaticMapUrl(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  width = 600,
  height = 300,
): string {
  const w = Math.min(width, 600);
  const h = Math.min(height, 450);
  
  // Polyline coordinates (start to end)
  const pl = `c:AC1D10FF,w:4,${startLng},${startLat},${endLng},${endLat}`;
  
  // Markers: pm2rdm (red) for start, pm2gnm (green) for end
  const pt = `${startLng},${startLat},pm2rdm~${endLng},${endLat},pm2gnm`;
  
  return `https://static-maps.yandex.ru/1.x/?l=map&size=${w},${h}&pt=${pt}&pl=${pl}`;
}
