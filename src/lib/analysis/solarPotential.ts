import { Address, GeocodedLocation } from '@/types/address';
import { SolarPotentialResult } from '@/types/analysis';
import {
  PEI_COORDINATES,
  PEI_CLIMATE_FACTORS,
  PEI_COMBINED_EFFICIENCY,
  PEI_INSTALLATION_COSTS,
  PEI_SOLAR_DATA,
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
 * NOTE: This function returns location-specific solar irradiance data.
 * The actual panel count and system size calculations are done in
 * calculateRecommendation() using the actual roof area from image analysis.
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

  // Return just the solar irradiance data and peak sun hours
  // The actual panel count and production will be calculated in
  // calculateRecommendation() using the real roof area from image analysis
  return {
    yearlySolarPotentialKWh: 0, // Will be calculated using actual roof area
    averageIrradianceKWhPerSqM: averageIrradiance,
    optimalPanelCount: 0, // Will be calculated using actual roof area
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
 * Uses accurate Charlottetown PEI photovoltaic potential data
 *
 * METHOD: System Size (kW) × Photovoltaic Potential (kWh/kWp)
 * This is the industry-standard calculation that already accounts for:
 * - Optimal tilt angle (36° for Charlottetown)
 * - All system losses (10% technological + 2.9% angle of incidence + 2.79% temp/irradiance)
 * - Monthly irradiance patterns
 * - Climate-specific factors
 *
 * Source: calculation_improvements.md - Professional Solar Report
 * Based on 100 kWp system producing 117,490 kWh/year = 1174.9 kWh/kWp
 *
 * @param systemSizeKW - System size in kilowatts
 * @param pvPotential - Photovoltaic potential (kWh/kWp), defaults to Charlottetown value
 * @returns Expected annual production in kWh
 */
export function calculateAnnualProduction(
  systemSizeKW: number,
  pvPotential: number = PEI_SOLAR_DATA.photovoltaicPotential
): number {
  // ACCURATE CALCULATION: System Size (kW) × PV Potential (kWh/kWp)
  // This replaces the old method: systemSizeKW × peakSunHours × 365 × efficiency
  const annualProduction = systemSizeKW * pvPotential;

  return Math.round(annualProduction);
}

/**
 * Get production estimate with detailed breakdown
 * NOTE: This uses the accurate PV potential method
 *
 * @param systemSizeKW - System size in kilowatts
 * @param pvPotential - Photovoltaic potential (kWh/kWp)
 * @returns Production estimate with breakdown factors
 */
export function getDetailedProductionEstimate(
  systemSizeKW: number,
  pvPotential: number = PEI_SOLAR_DATA.photovoltaicPotential
): {
  grossProduction: number;
  snowLoss: number;
  temperatureBonus: number;
  soilingLoss: number;
  inverterLoss: number;
  systemLoss: number;
  netProduction: number;
} {
  // Accurate net production using PV potential
  const netProduction = calculateAnnualProduction(systemSizeKW, pvPotential);

  // For detailed breakdown, we reverse-calculate gross production
  // PV potential already includes ~15% total losses, so gross is net / 0.85
  const TOTAL_LOSS_FACTOR = 0.8495; // From calculation_improvements.md: 85.05% efficiency
  const grossProduction = netProduction / TOTAL_LOSS_FACTOR;

  const snowLoss = grossProduction * PEI_CLIMATE_FACTORS.snowLossFactor;
  const temperatureBonus = grossProduction * (PEI_CLIMATE_FACTORS.temperatureCoefficient - 1);
  const soilingLoss = grossProduction * PEI_CLIMATE_FACTORS.soilingFactor;
  const inverterLoss = grossProduction * (1 - PEI_CLIMATE_FACTORS.inverterEfficiency);
  const systemLoss = grossProduction * PEI_CLIMATE_FACTORS.systemLosses;

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
