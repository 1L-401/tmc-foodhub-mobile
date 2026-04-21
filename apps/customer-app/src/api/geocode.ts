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
  if (!trimmed) {
    return null;
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
      geocodeCache.set(trimmed, null);
      return null;
    }

    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      geocodeCache.set(trimmed, null);
      return null;
    }

    const first = results[0];
    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      geocodeCache.set(trimmed, null);
      return null;
    }

    const location: GeocodedLocation = { latitude, longitude };
    geocodeCache.set(trimmed, location);
    return location;
  } catch {
    geocodeCache.set(trimmed, null);
    return null;
  }
}

/**
 * Build a static OpenStreetMap tile image URL for given coordinates.
 * Uses the free staticmap.openstreetmap.de service.
 */
export function buildStaticMapUrl(
  latitude: number,
  longitude: number,
  zoom = 16,
  width = 400,
  height = 200,
): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;
}
