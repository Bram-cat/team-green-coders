/**
 * Geocoding Service for PEI Solar Panel Advisor
 *
 * Uses Google Maps Geocoding API to convert addresses to coordinates.
 * Falls back to PEI default coordinates if API fails.
 */

import { Address, GeocodedLocation } from '@/types/address';
import { PEI_COORDINATES } from '@/lib/data/peiSolarData';

// ============================================
// TYPES
// ============================================

interface GoogleGeocodingResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
  error_message?: string;
}

interface GeocodingResponse {
  success: boolean;
  location: GeocodedLocation;
  isDefault: boolean;
  error?: string;
}

// ============================================
// PEI BOUNDS (for validation)
// ============================================

const PEI_BOUNDS = {
  north: 47.1,
  south: 45.9,
  east: -61.9,
  west: -64.5,
};

// ============================================
// GEOCODING FUNCTIONS
// ============================================

/**
 * Geocode an address using Google Maps Geocoding API
 *
 * @param address - User-provided address
 * @returns Promise<GeocodingResponse>
 */
export async function geocodeAddress(address: Address): Promise<GeocodingResponse> {
  const apiKey = process.env.GEOCODE_API_KEY;

  if (!apiKey) {
    console.warn('GEOCODE_API_KEY not configured, using PEI defaults');
    return {
      success: true,
      location: getDefaultLocation(address),
      isDefault: true,
      error: 'Geocoding API key not configured',
    };
  }

  try {
    // Build the address string
    const addressString = buildAddressString(address);

    // Call Google Geocoding API
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', addressString);
    url.searchParams.append('key', apiKey);
    // Bias results towards PEI region
    url.searchParams.append('bounds', `${PEI_BOUNDS.south},${PEI_BOUNDS.west}|${PEI_BOUNDS.north},${PEI_BOUNDS.east}`);

    const response = await fetch(url.toString());
    const data: GoogleGeocodingResult = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`Geocoding failed: ${data.status}`, data.error_message);
      return {
        success: true,
        location: getDefaultLocation(address),
        isDefault: true,
        error: `Geocoding failed: ${data.status}`,
      };
    }

    const result = data.results[0];
    const location: GeocodedLocation = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };

    // Validate the location is within PEI bounds
    const inPEI = isLocationInPEI(location.latitude, location.longitude);

    if (!inPEI) {
      console.warn('Geocoded location is outside PEI bounds, using defaults');
      return {
        success: true,
        location: getDefaultLocation(address),
        isDefault: true,
        error: 'Address is outside Prince Edward Island',
      };
    }

    return {
      success: true,
      location,
      isDefault: false,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: true,
      location: getDefaultLocation(address),
      isDefault: true,
      error: error instanceof Error ? error.message : 'Geocoding request failed',
    };
  }
}

/**
 * Build a formatted address string for geocoding
 */
function buildAddressString(address: Address): string {
  const parts = [
    address.street,
    address.city,
    'PE', // Always append PE for Prince Edward Island
    address.postalCode,
    address.country || 'Canada',
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Get the default PEI location (Charlottetown)
 */
function getDefaultLocation(address: Address): GeocodedLocation {
  return {
    latitude: PEI_COORDINATES.latitude,
    longitude: PEI_COORDINATES.longitude,
    formattedAddress: `${address.street}, ${address.city}, PE ${address.postalCode}, Canada`,
  };
}

/**
 * Check if a location is within PEI bounds
 */
export function isLocationInPEI(latitude: number, longitude: number): boolean {
  return (
    latitude >= PEI_BOUNDS.south &&
    latitude <= PEI_BOUNDS.north &&
    longitude >= PEI_BOUNDS.west &&
    longitude <= PEI_BOUNDS.east
  );
}

/**
 * Calculate distance between two coordinates (in km)
 * Uses Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Validate a PEI postal code format
 * PEI postal codes start with C0A, C0B, C1A, C1B, C1C, C1E, or C1N
 */
export function isValidPEIPostalCode(postalCode: string): boolean {
  const normalized = postalCode.replace(/\s/g, '').toUpperCase();
  const peiPattern = /^C[01][ABCEN]\d[A-Z]\d$/;
  return peiPattern.test(normalized);
}

/**
 * Check if geocoding API is available
 */
export function isGeocodingAvailable(): boolean {
  return !!process.env.GEOCODE_API_KEY;
}
