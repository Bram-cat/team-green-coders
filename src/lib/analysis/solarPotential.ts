import { Address, GeocodedLocation } from '@/types/address';
import { SolarPotentialResult } from '@/types/analysis';
import {
  PEI_COORDINATES,
  PEI_CLIMATE_FACTORS,
  PEI_COMBINED_EFFICIENCY,
  PEI_INSTALLATION_COSTS,
} from '@/lib/data/peiSolarData';
import { geocodeAddress as realGeocodeAddress, isGeocodingAvailable } from '@/lib/services/geocodingService';
import { fetchNASAPowerData, getDefaultPEISolarData } from '@/lib/services/nasaPowerService';

/**
 * Geocodes an address to get latitude/longitude.
 *
 * Uses Google Maps Geocoding API when available, falls back to PEI defaults.
 *
 * @param address - User-provided address
 * @returns Promise<GeocodedLocation & { usedRealGeocoding: boolean }>
 */
export async function geocodeAddressForSolar(
  address: Address
): Promise<GeocodedLocation & { usedRealGeocoding: boolean }> {
  if (isGeocodingAvailable()) {
    const result = await realGeocodeAddress(address);

    return {
      ...result.location,
      usedRealGeocoding: !result.isDefault,
    };
  }

  // Fallback to PEI defaults
  return {
    latitude: PEI_COORDINATES.latitude,
    longitude: PEI_COORDINATES.longitude,
    formattedAddress: `${address.street}, ${address.city}, PE ${address.postalCode}, Canada`,
    usedRealGeocoding: false,
  };
}

/**
 * Retrieves solar potential data for a location using NASA POWER API.
 *
 * Uses real solar irradiance data based on geocoded coordinates.
 *
 * @param address - User-provided address
 * @returns Promise<SolarPotentialResult & { geocodedLocation: GeocodedLocation; usedRealGeocoding: boolean }>
 */
export async function getLocationSolarPotential(
  address: Address
): Promise<SolarPotentialResult & { geocodedLocation: GeocodedLocation; usedRealGeocoding: boolean }> {
  // Geocode the address
  const locationResult = await geocodeAddressForSolar(address);

  // Fetch real solar data from NASA POWER API
  let solarData;
  let dataSource: 'nasa' | 'cached' | 'default' = 'default';

  try {
    solarData = await fetchNASAPowerData(
      locationResult.latitude,
      locationResult.longitude
    );
    dataSource = solarData.dataSource;
    console.log(`[Solar Potential] Using ${dataSource} data for location:`, {
      lat: locationResult.latitude,
      lon: locationResult.longitude,
      annualGHI: solarData.annualGHI,
      pvPotential: solarData.photovoltaicPotential,
    });
  } catch (error) {
    console.warn('[Solar Potential] Failed to fetch NASA data, using PEI defaults:', error);
    solarData = getDefaultPEISolarData(
      locationResult.latitude,
      locationResult.longitude
    );
  }

  // Use location-specific solar data
  const peakSunHours = solarData.averagePeakSunHours;
  const averageIrradiance = solarData.annualGHI;

  // Calculate optimal panel count based on a typical usable roof area
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
    geocodedLocation: {
      latitude: locationResult.latitude,
      longitude: locationResult.longitude,
      formattedAddress: locationResult.formattedAddress,
    },
    usedRealGeocoding: locationResult.usedRealGeocoding,
  };
}

/**
 * Calculate expected annual production for a given system size
 * Uses location-specific climate factors
 *
 * @param systemSizeKW - System size in kilowatts
 * @param peakSunHoursPerDay - Location-specific peak sun hours
 * @returns Expected annual production in kWh
 */
export function calculateAnnualProduction(
  systemSizeKW: number,
  peakSunHoursPerDay: number = 3.7
): number {
  // Base calculation: System Size (kW) × Peak Sun Hours × 365 days
  const baseProduction = systemSizeKW * peakSunHoursPerDay * 365;

  // Apply PEI climate efficiency factors
  const effectiveProduction = baseProduction * PEI_COMBINED_EFFICIENCY;

  return Math.round(effectiveProduction);
}

/**
 * Get production estimate with detailed breakdown
 *
 * @param systemSizeKW - System size in kilowatts
 * @param peakSunHoursPerDay - Location-specific peak sun hours
 * @returns Production estimate with breakdown factors
 */
export function getDetailedProductionEstimate(
  systemSizeKW: number,
  peakSunHoursPerDay: number = 3.7
): {
  grossProduction: number;
  snowLoss: number;
  temperatureBonus: number;
  soilingLoss: number;
  inverterLoss: number;
  systemLoss: number;
  netProduction: number;
} {
  const grossProduction = systemSizeKW * peakSunHoursPerDay * 365;

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

/**
 * Adjust solar potential based on roof orientation
 *
 * @param baseProduction - Base annual production in kWh
 * @param orientation - Roof orientation (north, south, east, west, flat)
 * @returns Adjusted production in kWh
 */
export function adjustForOrientation(
  baseProduction: number,
  orientation: 'north' | 'south' | 'east' | 'west' | 'flat'
): number {
  // Orientation factors for PEI latitude (46°N)
  const orientationFactors: Record<string, number> = {
    south: 1.0, // Optimal
    flat: 0.92, // Good but less efficient
    east: 0.85, // Morning sun
    west: 0.85, // Afternoon sun
    north: 0.55, // Significant loss
  };

  const factor = orientationFactors[orientation] || 1.0;
  return Math.round(baseProduction * factor);
}
