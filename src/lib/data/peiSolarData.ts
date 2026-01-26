/**
 * PEI Solar Data Constants
 *
 * Hardcoded values for Prince Edward Island solar calculations.
 * Data sources:
 * - Natural Resources Canada (solar irradiance)
 * - Maritime Electric (electricity rates)
 * - Industry averages (installation costs)
 */

// ============================================
// LOCATION DATA
// ============================================

export const PEI_COORDINATES = {
  latitude: 46.2382,
  longitude: -63.1311,
  timezone: 'America/Halifax',
  city: 'Charlottetown',
  province: 'PE',
  country: 'Canada',
};

// ============================================
// SOLAR IRRADIANCE DATA (ACCURATE CHARLOTTETOWN DATA)
// ============================================

// Source: calculation_improvements.md - Professional Solar Report for Charlottetown PEI
// Based on 100 kWp system analysis at optimal 36° tilt angle

// Monthly Solar Irradiance at Optimal Angle (36°) - kWh/m²/month
export const PEI_MONTHLY_IRRADIANCE_OPTIMAL = {
  january: 56.88,
  february: 71.79,
  march: 115.99,
  april: 144.17,
  may: 162.63,
  june: 155.57,
  july: 171.59,
  august: 167.23,
  september: 138.8,
  october: 99.88,
  november: 60.62,
  december: 37.95,
} as const;

// Monthly Solar Irradiance (Daily Average) - kWh/m²/day
export const PEI_MONTHLY_IRRADIANCE = {
  january: 1.83,
  february: 2.56,
  march: 3.74,
  april: 4.81,
  may: 5.25,
  june: 5.19,
  july: 5.54,
  august: 5.39,
  september: 4.63,
  october: 3.22,
  november: 2.02,
  december: 1.22,
} as const;

// Monthly Power Output for 100 kWp System - kWh/month (at optimal 36° tilt)
export const PEI_MONTHLY_POWER_OUTPUT_100KWP = {
  january: 5250.07,
  february: 6614.10,
  march: 10472.50,
  april: 12560.70,
  may: 13723.70,
  june: 12782.90,
  july: 13841.10,
  august: 13544.80,
  september: 11532.40,
  october: 8542.71,
  november: 5288.42,
  december: 3336.52,
} as const;

// Annual solar averages for Charlottetown PEI
export const PEI_SOLAR_DATA = {
  // Average yearly irradiance at optimal angle (kWh/m²/year)
  annualIrradianceOptimal: 1383.09,

  // Photovoltaic Potential (kWh per kWp installed) - CRITICAL FOR ACCURATE CALCULATIONS
  // This is the actual measured production for Charlottetown at optimal 36° tilt
  // Calculated as: 117,490 kWh / 100 kWp = 1174.9 kWh/kWp
  photovoltaicPotential: 1174.9,

  // Average peak sun hours per day (derived from annual production)
  // 117,490 kWh / (100 kW × 365 days × 0.85 system efficiency) ≈ 3.78 hours
  averagePeakSunHours: 3.78,

  // CRITICAL: Optimal tilt angle for Charlottetown PEI
  // Professional solar report shows 36° (NOT 44°)
  optimalTiltAngle: 36,

  // Best orientation for Northern Hemisphere
  bestOrientation: 'south' as const,

  // Seasonal variation factor
  winterToSummerRatio: 0.38, // Jan/July ratio: 5250/13841 ≈ 0.38
};

// Monthly peak sun hours (derived from daily irradiance)
export const PEI_MONTHLY_PEAK_SUN_HOURS = {
  january: 1.83,
  february: 2.56,
  march: 3.74,
  april: 4.81,
  may: 5.25,
  june: 5.19,
  july: 5.54,
  august: 5.39,
  september: 4.63,
  october: 3.22,
  november: 2.02,
  december: 1.22,
} as const;

// ============================================
// ELECTRICITY RATES (Maritime Electric)
// ============================================

export const PEI_ELECTRICITY_RATES = {
  // Residential rate per kWh (as of 2024)
  residentialRate: 0.1712,

  // Net metering credit rate (same as retail in PEI)
  netMeteringCreditRate: 0.1712,

  // Monthly basic service charge
  monthlyBasicCharge: 28.14,

  // Estimated annual rate increase (conservative estimate)
  annualRateIncreaseEstimate: 0.03,

  // Rate schedule name
  rateScheduleName: 'Residential Service',

  // Utility name
  utilityName: 'Maritime Electric',
};

// ============================================
// INSTALLATION COSTS (CAD)
// ============================================

export const PEI_INSTALLATION_COSTS = {
  // Cost per watt ranges (installed)
  costPerWattLow: 2.50,
  costPerWattMid: 3.00,
  costPerWattHigh: 3.50,

  // Additional costs
  inverterReplacementCost: 1500, // Typically needed after 12-15 years
  annualMaintenanceCost: 150,

  // Permit and inspection fees (approximate)
  permitFees: 200,

  // Panel specifications (modern standard)
  panelWattage: 400, // Watts per panel
  panelAreaSqM: 1.7, // Square meters per panel
};

// Panel type specifications for accuracy enhancements
export const PANEL_WATTAGE_BY_TYPE = {
  'standard': 350,        // 18% efficiency - Budget option
  'premium': 400,         // 21% efficiency - Most common
  'high-efficiency': 450  // 23% efficiency - Limited space roofs
} as const;

export const PANEL_EFFICIENCY_BY_TYPE = {
  'standard': 0.18,
  'premium': 0.21,
  'high-efficiency': 0.23
} as const;

// Roof material cost adjustments
export const ROOF_MATERIAL_COST_MULTIPLIER = {
  'asphalt': 1.0,      // Baseline (asphalt shingles)
  'metal': 0.95,       // Easier installation (5% discount)
  'tile': 1.15,        // Harder installation (15% premium)
  'other': 1.05
} as const;

// ============================================
// CLIMATE ADJUSTMENT FACTORS
// ============================================

// Monthly average temperatures for PEI (°C)
export const PEI_MONTHLY_AVG_TEMP = {
  january: -8,
  february: -7,
  march: -2,
  april: 4,
  may: 11,
  june: 16,
  july: 19,
  august: 19,
  september: 14,
  october: 8,
  november: 3,
  december: -4
} as const;

// Panel temperature coefficient (% efficiency loss per °C above 25°C)
export const PANEL_TEMPERATURE_COEFFICIENT = -0.004; // -0.4% per °C

export const PEI_CLIMATE_FACTORS = {
  // Snow coverage loss (annual average - now dynamic based on roof pitch)
  snowLossFactor: 0.04, // 4% production loss (baseline for 25-35° pitch)

  // Cold weather efficiency bonus (panels work better in cold)
  temperatureCoefficient: 1.02, // 2% efficiency gain

  // Dust/dirt/debris loss
  soilingFactor: 0.02, // 2% loss

  // Annual panel degradation rate
  systemDegradation: 0.005, // 0.5% per year

  // Inverter efficiency
  inverterEfficiency: 0.96, // 96%

  // Wiring and other system losses
  systemLosses: 0.02, // 2%
};

// Combined efficiency factor for quick calculations (baseline)
export const PEI_COMBINED_EFFICIENCY =
  (1 - PEI_CLIMATE_FACTORS.snowLossFactor) *
  PEI_CLIMATE_FACTORS.temperatureCoefficient *
  (1 - PEI_CLIMATE_FACTORS.soilingFactor) *
  PEI_CLIMATE_FACTORS.inverterEfficiency *
  (1 - PEI_CLIMATE_FACTORS.systemLosses);
// Result: ~0.90 or 90% effective production

// ============================================
// ACCURACY ENHANCEMENT FUNCTIONS
// ============================================

/**
 * Calculate dynamic snow loss factor based on roof pitch
 * Steeper roofs shed snow faster, reducing production losses
 *
 * @param roofPitchDegrees - Roof pitch in degrees (0-60)
 * @returns Snow loss factor (0.01-0.08)
 */
export function calculateSnowLossFactor(roofPitchDegrees: number): number {
  if (roofPitchDegrees >= 45) {
    return 0.01; // Very steep: 1% loss (snow slides off quickly)
  } else if (roofPitchDegrees >= 35) {
    return 0.02; // Steep: 2% loss
  } else if (roofPitchDegrees >= 25) {
    return 0.04; // Moderate: 4% loss (baseline)
  } else if (roofPitchDegrees >= 15) {
    return 0.06; // Shallow: 6% loss
  } else {
    return 0.08; // Flat: 8% loss (snow accumulates)
  }
}

/**
 * Calculate combined efficiency with dynamic snow loss based on roof pitch
 *
 * @param roofPitchDegrees - Roof pitch in degrees (0-60)
 * @returns Combined efficiency factor (0-1)
 */
export function calculateCombinedEfficiency(roofPitchDegrees: number): number {
  const snowLoss = calculateSnowLossFactor(roofPitchDegrees);

  return (
    (1 - snowLoss) *
    PEI_CLIMATE_FACTORS.temperatureCoefficient *
    (1 - PEI_CLIMATE_FACTORS.soilingFactor) *
    PEI_CLIMATE_FACTORS.inverterEfficiency *
    (1 - PEI_CLIMATE_FACTORS.systemLosses)
  );
}

/**
 * Calculate temperature adjustment factor for panel efficiency
 * Accounts for PEI's cold climate which improves panel performance
 *
 * @param monthlyTemps - Record of monthly average temperatures
 * @returns Temperature adjustment factor (0-1.2)
 */
export function calculateTemperatureAdjustment(monthlyTemps: Record<string, number>): number {
  const PANEL_STC_TEMP = 25; // Standard Test Condition temperature (°C)

  let totalAdjustment = 0;
  const monthCount = Object.keys(monthlyTemps).length;

  for (const [month, ambientTemp] of Object.entries(monthlyTemps)) {
    // Panels typically run 20-30°C warmer than ambient (use 25°C average)
    const panelTemp = ambientTemp + 25;
    const tempDiff = panelTemp - PANEL_STC_TEMP;
    const monthlyFactor = 1 + (tempDiff * PANEL_TEMPERATURE_COEFFICIENT);
    totalAdjustment += monthlyFactor;
  }

  return totalAdjustment / monthCount; // Return average monthly factor
}

/**
 * Calculate dynamic tilt factor based on roof pitch and orientation
 * PEI optimal tilt: 36° for maximum annual production (based on professional solar report)
 *
 * @param roofPitchDegrees - Actual roof pitch (0-60)
 * @param orientation - Roof orientation
 * @returns Tilt factor (0.85-1.05)
 */
export function calculateTiltFactor(roofPitchDegrees: number, orientation: string): number {
  const OPTIMAL_TILT = 36; // Charlottetown PEI optimal tilt angle (from calculation_improvements.md)
  const deviation = Math.abs(roofPitchDegrees - OPTIMAL_TILT);

  let tiltFactor = 1.0;

  if (deviation <= 5) {
    tiltFactor = 1.0; // Within 5° of optimal = no penalty
  } else if (deviation <= 10) {
    tiltFactor = 0.98; // 2% reduction
  } else if (deviation <= 20) {
    tiltFactor = 0.95; // 5% reduction
  } else {
    tiltFactor = 0.90; // 10% reduction for very steep/flat roofs
  }

  // Bonus for perfect south-facing at optimal tilt
  if (orientation === 'south' && deviation <= 5) {
    tiltFactor = 1.05; // 5% bonus for perfect conditions
  }

  return tiltFactor;
}

// ============================================
// INCENTIVES & PROGRAMS
// ============================================

export const PEI_INCENTIVES = {
  canadaGreenerHomesLoan: {
    name: 'Canada Greener Homes Loan',
    available: true,
    maxAmount: 40000,
    interestFree: true,
    termYears: 10,
    description: 'Interest-free loan up to $40,000 for energy-efficient home retrofits including solar panels.',
    url: 'https://natural-resources.canada.ca/energy-efficiency/homes/canada-greener-homes-loan/24376',
  },

  netMetering: {
    name: 'Net Metering Program',
    available: true,
    creditRate: 0.1712, // Same as retail rate
    description: 'Maritime Electric offers net metering at the retail rate. Excess energy exported to the grid earns credits on your bill.',
    url: 'https://www.maritimeelectric.com/save-energy/net-metering',
  },

  federalTaxCredit: {
    name: 'Federal Tax Credit',
    available: false,
    description: 'Canada does not currently offer a federal solar tax credit (unlike the US ITC).',
  },

  provincialRebate: {
    name: 'PEI Provincial Rebate',
    available: false,
    description: 'PEI does not currently offer provincial rebates for residential solar installations.',
  },
};

// ============================================
// TYPICAL HOUSEHOLD DATA
// ============================================

export const PEI_HOUSEHOLD_DATA = {
  // Average PEI household electricity consumption
  averageMonthlyConsumptionKWh: 850,
  averageAnnualConsumptionKWh: 10200,

  // Average electricity bill
  averageMonthlyBill: 174, // $0.1712 * 850 + $28.14 basic charge

  // Typical home roof sizes
  smallRoofSqM: 80,
  mediumRoofSqM: 120,
  largeRoofSqM: 180,
};

// System size presets based on consumption
export const PEI_SYSTEM_PRESETS = {
  small: {
    sizeKW: 4,
    targetConsumptionKWh: 6000,
    description: 'Small home / Apartment',
    estimatedPanels: 10,
  },
  medium: {
    sizeKW: 6,
    targetConsumptionKWh: 9000,
    description: 'Average PEI home',
    estimatedPanels: 15,
  },
  large: {
    sizeKW: 10,
    targetConsumptionKWh: 15000,
    description: 'Large home / High consumption',
    estimatedPanels: 25,
  },
};

// ============================================
// ENVIRONMENTAL FACTORS
// ============================================

export const PEI_ENVIRONMENTAL_DATA = {
  // PEI grid emission factor (kg CO2 per kWh)
  // PEI has a relatively clean grid due to wind power
  gridEmissionFactor: 0.4,

  // Average CO2 absorbed by a tree per year (kg)
  treeCO2AbsorptionPerYear: 21,

  // Average Canadian household CO2 from electricity (kg/year)
  avgHouseholdElectricityCO2: 4080,
};
