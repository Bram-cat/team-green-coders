import { Address, GeocodedLocation } from '@/types/address';
import { SolarPotentialResult } from '@/types/analysis';

/**
 * Geocodes an address to get latitude/longitude.
 *
 * TODO: Replace with actual geocoding API:
 * - Google Maps Geocoding API
 * - Mapbox Geocoding API
 * - OpenStreetMap Nominatim
 *
 * @param address - User-provided address
 * @returns Promise<GeocodedLocation>
 */
async function geocodeAddress(address: Address): Promise<GeocodedLocation> {
  // TODO: Implement actual geocoding
  // const apiKey = process.env.GEOCODE_API_KEY;
  // const response = await fetch(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`
  //   )}&key=${apiKey}`
  // );
  // const data = await response.json();
  // return {
  //   latitude: data.results[0].geometry.location.lat,
  //   longitude: data.results[0].geometry.location.lng,
  //   formattedAddress: data.results[0].formatted_address,
  // };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock geocoded location (defaults to a sunny location)
  return {
    latitude: 34.0522 + (Math.random() - 0.5) * 10,
    longitude: -118.2437 + (Math.random() - 0.5) * 10,
    formattedAddress: `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`,
  };
}

/**
 * Retrieves solar potential data for a given location.
 *
 * TODO: Replace with actual solar irradiance API:
 * - NREL PVWatts API (https://developer.nrel.gov/docs/solar/pvwatts/)
 * - SolarAnywhere API
 * - Google Project Sunroof API
 *
 * @param address - User-provided address
 * @returns Promise<SolarPotentialResult>
 */
export async function getLocationSolarPotential(address: Address): Promise<SolarPotentialResult> {
  const location = await geocodeAddress(address);

  // TODO: Implement actual solar potential API call
  // const apiKey = process.env.SOLAR_API_KEY;
  // const response = await fetch(
  //   `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${apiKey}` +
  //   `&lat=${location.latitude}&lon=${location.longitude}&system_capacity=4&...`
  // );
  // const data = await response.json();

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Calculate mock solar potential based on latitude (higher at equator)
  const latitudeFactor = 1 - Math.abs(location.latitude) / 90 * 0.5;
  const baseIrradiance = 1400 * latitudeFactor; // kWh/m²/year

  return {
    yearlySolarPotentialKWh: Math.round(baseIrradiance * 20), // Assuming ~20m² usable
    averageIrradianceKWhPerSqM: Math.round(baseIrradiance),
    optimalPanelCount: Math.floor(Math.random() * 10) + 10, // 10-20 panels
    peakSunHoursPerDay: 4 + Math.random() * 2, // 4-6 hours
  };
}
