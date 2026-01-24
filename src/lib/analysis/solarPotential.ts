import { Address, GeocodedLocation } from '@/types/address';
import { SolarPotentialResult } from '@/types/analysis';
import {
  PEI_COORDINATES,
  PEI_SOLAR_DATA,
  PEI_CLIMATE_FACTORS,
  PEI_COMBINED_EFFICIENCY,
  PEI_INSTALLATION_COSTS,
} from '@/lib/data/peiSolarData';

/**
 * Geocodes an address to get latitude/longitude.
 *
 * For PEI MVP: Returns PEI coordinates for any address.
 * TODO: Replace with actual geocoding API when API keys are provided:
 * - Google Maps Geocoding API
 * - Mapbox Geocoding API
 * - OpenStreetMap Nominatim
 *
 * @param address - User-provided address
 * @returns Promise<GeocodedLocation>
 */
async function geocodeAddress(address: Address): Promise<GeocodedLocation> {
  // TODO: Implement actual geocoding when API key is available
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
  await new Promise(resolve => setTimeout(resolve, 300));

  // Return PEI coordinates (Charlottetown area)
  // In production, this would return actual geocoded coordinates
  return {
    latitude: PEI_COORDINATES.latitude,
    longitude: PEI_COORDINATES.longitude,
    formattedAddress: `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`,
  };
}

/**
 * Retrieves solar potential data for a PEI location.
 *
 * Uses hardcoded PEI-specific solar data from Natural Resources Canada.
 * TODO: Replace with actual solar irradiance API when API keys are provided:
 * - NREL PVWatts API (https://developer.nrel.gov/docs/solar/pvwatts/)
 * - SolarAnywhere API
 * - Google Project Sunroof API
 *
 * @param address - User-provided address
 * @returns Promise<SolarPotentialResult>
 */
export async function getLocationSolarPotential(address: Address): Promise<SolarPotentialResult> {
  const location = await geocodeAddress(address);

  // TODO: Implement actual solar potential API call when API key is available
  // const apiKey = process.env.SOLAR_API_KEY;
  // const response = await fetch(
  //   `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${apiKey}` +
  //   `&lat=${location.latitude}&lon=${location.longitude}&system_capacity=4&...`
  // );
  // const data = await response.json();

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Use PEI-specific solar data
  const peakSunHours = PEI_SOLAR_DATA.averagePeakSunHours;
  const averageIrradiance = PEI_SOLAR_DATA.annualGHI;

  // Calculate optimal panel count based on a typical 20m² usable roof area
  // This will be refined when combined with actual roof analysis
  const assumedUsableAreaSqM = 25; // Conservative estimate for initial calculation
  const panelsPerSqM = 1 / PEI_INSTALLATION_COSTS.panelAreaSqM;
  const optimalPanelCount = Math.floor(assumedUsableAreaSqM * panelsPerSqM);

  // Calculate yearly solar potential for a reference area
  // Formula: Area (m²) × Annual Irradiance (kWh/m²) × System Efficiency
  const yearlySolarPotentialKWh = Math.round(
    assumedUsableAreaSqM * averageIrradiance * PEI_COMBINED_EFFICIENCY
  );

  return {
    yearlySolarPotentialKWh,
    averageIrradianceKWhPerSqM: averageIrradiance,
    optimalPanelCount,
    peakSunHoursPerDay: peakSunHours,
  };
}

/**
 * Calculate expected annual production for a given system size
 * Uses PEI-specific climate factors
 *
 * @param systemSizeKW - System size in kilowatts
 * @returns Expected annual production in kWh
 */
export function calculateAnnualProduction(systemSizeKW: number): number {
  // Base calculation: System Size (kW) × Peak Sun Hours × 365 days
  const baseProduction = systemSizeKW * PEI_SOLAR_DATA.averagePeakSunHours * 365;

  // Apply PEI climate efficiency factors
  const effectiveProduction = baseProduction * PEI_COMBINED_EFFICIENCY;

  return Math.round(effectiveProduction);
}

/**
 * Get production estimate with detailed breakdown
 *
 * @param systemSizeKW - System size in kilowatts
 * @returns Production estimate with breakdown factors
 */
export function getDetailedProductionEstimate(systemSizeKW: number): {
  grossProduction: number;
  snowLoss: number;
  temperatureBonus: number;
  soilingLoss: number;
  inverterLoss: number;
  systemLoss: number;
  netProduction: number;
} {
  const grossProduction = systemSizeKW * PEI_SOLAR_DATA.averagePeakSunHours * 365;

  const snowLoss = grossProduction * PEI_CLIMATE_FACTORS.snowLossFactor;
  const temperatureBonus = grossProduction * (PEI_CLIMATE_FACTORS.temperatureCoefficient - 1);
  const soilingLoss = grossProduction * PEI_CLIMATE_FACTORS.soilingFactor;
  const inverterLoss = grossProduction * (1 - PEI_CLIMATE_FACTORS.inverterEfficiency);
  const systemLoss = grossProduction * PEI_CLIMATE_FACTORS.systemLosses;

  const netProduction = grossProduction
    - snowLoss
    + temperatureBonus
    - soilingLoss
    - inverterLoss
    - systemLoss;

  return {
    grossProduction: Math.round(grossProduction),
    snowLoss: Math.round(snowLoss),
    temperatureBonus: Math.round(temperatureBonus),
    soilingLoss: Math.round(soilingLoss),
    inverterLoss: Math.round(inverterLoss),
    systemLoss: Math.round(systemLoss),
    netProduction: Math.round(netProduction),
  };
}
