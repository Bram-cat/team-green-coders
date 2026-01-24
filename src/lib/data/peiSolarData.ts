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
// SOLAR IRRADIANCE DATA
// ============================================

// Monthly Global Horizontal Irradiance (kWh/m²/day)
// Based on Natural Resources Canada data for Charlottetown, PEI
export const PEI_MONTHLY_IRRADIANCE = {
  january: 1.8,
  february: 2.7,
  march: 3.6,
  april: 4.5,
  may: 5.3,
  june: 5.8,
  july: 5.7,
  august: 5.0,
  september: 3.9,
  october: 2.7,
  november: 1.7,
  december: 1.4,
};

// Annual solar averages
export const PEI_SOLAR_DATA = {
  // Global Horizontal Irradiance (kWh/m²/year)
  annualGHI: 1150,

  // Average peak sun hours per day (equivalent full sun hours)
  averagePeakSunHours: 3.7,

  // Optimal tilt angle for fixed panels (roughly equal to latitude)
  optimalTiltAngle: 44,

  // Best orientation for Northern Hemisphere
  bestOrientation: 'south' as const,

  // Seasonal variation factor
  winterToSummerRatio: 0.25, // Winter produces ~25% of summer output
};

// Monthly peak sun hours for more detailed calculations
export const PEI_MONTHLY_PEAK_SUN_HOURS = {
  january: 2.0,
  february: 2.8,
  march: 3.5,
  april: 4.2,
  may: 4.8,
  june: 5.2,
  july: 5.1,
  august: 4.6,
  september: 3.8,
  october: 2.9,
  november: 2.0,
  december: 1.7,
};

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

// ============================================
// CLIMATE ADJUSTMENT FACTORS
// ============================================

export const PEI_CLIMATE_FACTORS = {
  // Snow coverage loss (annual average)
  snowLossFactor: 0.04, // 4% production loss

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

// Combined efficiency factor for quick calculations
export const PEI_COMBINED_EFFICIENCY =
  (1 - PEI_CLIMATE_FACTORS.snowLossFactor) *
  PEI_CLIMATE_FACTORS.temperatureCoefficient *
  (1 - PEI_CLIMATE_FACTORS.soilingFactor) *
  PEI_CLIMATE_FACTORS.inverterEfficiency *
  (1 - PEI_CLIMATE_FACTORS.systemLosses);
// Result: ~0.90 or 90% effective production

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
