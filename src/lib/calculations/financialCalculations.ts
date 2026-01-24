/**
 * Financial Calculations for PEI Solar Panel Advisor
 *
 * Calculates system costs, savings, payback periods, and ROI
 * based on PEI-specific electricity rates and installation costs.
 */

import {
  PEI_ELECTRICITY_RATES,
  PEI_INSTALLATION_COSTS,
  PEI_CLIMATE_FACTORS,
  PEI_INCENTIVES,
  PEI_ENVIRONMENTAL_DATA,
} from '@/lib/data/peiSolarData';

// ============================================
// TYPES
// ============================================

export interface FinancialAnalysis {
  // System Cost Breakdown
  estimatedSystemCost: number;
  costPerWatt: number;

  // Annual Savings
  annualElectricitySavings: number;
  monthlyAverageSavings: number;

  // Payback & ROI
  simplePaybackYears: number;
  twentyFiveYearSavings: number;
  returnOnInvestment: number; // percentage

  // Production Value
  firstYearProduction: number;
  lifetimeProductionKWh: number;

  // Incentives
  availableIncentives: IncentiveInfo[];

  // Environmental Impact
  annualCO2OffsetKg: number;
  lifetimeCO2OffsetKg: number;
  equivalentTreesPlanted: number;

  // Additional Info
  electricityRate: number;
  utilityName: string;
}

export interface IncentiveInfo {
  name: string;
  available: boolean;
  description: string;
  potentialValue?: number;
  url?: string;
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate complete financial analysis for a solar system
 *
 * @param systemSizeKW - System size in kilowatts
 * @param estimatedAnnualProductionKWh - Estimated first year production
 * @returns Complete financial analysis
 */
export function calculateFinancials(
  systemSizeKW: number,
  estimatedAnnualProductionKWh: number
): FinancialAnalysis {
  // System Cost Calculation
  const costPerWatt = PEI_INSTALLATION_COSTS.costPerWattMid;
  const estimatedSystemCost = systemSizeKW * 1000 * costPerWatt;

  // Annual Savings Calculation
  const electricityRate = PEI_ELECTRICITY_RATES.residentialRate;
  const annualElectricitySavings = estimatedAnnualProductionKWh * electricityRate;
  const monthlyAverageSavings = annualElectricitySavings / 12;

  // Simple Payback Period
  const simplePaybackYears = annualElectricitySavings > 0
    ? estimatedSystemCost / annualElectricitySavings
    : 0;

  // 25-Year Lifetime Savings (accounting for degradation and rate increases)
  const twentyFiveYearSavings = calculate25YearSavings(
    estimatedAnnualProductionKWh,
    electricityRate,
    PEI_CLIMATE_FACTORS.systemDegradation,
    PEI_ELECTRICITY_RATES.annualRateIncreaseEstimate
  );

  // ROI Calculation
  const returnOnInvestment = estimatedSystemCost > 0
    ? ((twentyFiveYearSavings - estimatedSystemCost) / estimatedSystemCost) * 100
    : 0;

  // Lifetime Production (25 years with degradation)
  const lifetimeProductionKWh = calculateLifetimeProduction(
    estimatedAnnualProductionKWh,
    25,
    PEI_CLIMATE_FACTORS.systemDegradation
  );

  // Environmental Impact
  const annualCO2OffsetKg = estimatedAnnualProductionKWh * PEI_ENVIRONMENTAL_DATA.gridEmissionFactor;
  const lifetimeCO2OffsetKg = lifetimeProductionKWh * PEI_ENVIRONMENTAL_DATA.gridEmissionFactor;
  const equivalentTreesPlanted = Math.round(
    annualCO2OffsetKg / PEI_ENVIRONMENTAL_DATA.treeCO2AbsorptionPerYear
  );

  // Available Incentives
  const availableIncentives = getAvailableIncentives(estimatedSystemCost);

  return {
    estimatedSystemCost: Math.round(estimatedSystemCost),
    costPerWatt,
    annualElectricitySavings: Math.round(annualElectricitySavings),
    monthlyAverageSavings: Math.round(monthlyAverageSavings),
    simplePaybackYears: Math.round(simplePaybackYears * 10) / 10,
    twentyFiveYearSavings: Math.round(twentyFiveYearSavings),
    returnOnInvestment: Math.round(returnOnInvestment),
    firstYearProduction: estimatedAnnualProductionKWh,
    lifetimeProductionKWh: Math.round(lifetimeProductionKWh),
    availableIncentives,
    annualCO2OffsetKg: Math.round(annualCO2OffsetKg),
    lifetimeCO2OffsetKg: Math.round(lifetimeCO2OffsetKg),
    equivalentTreesPlanted,
    electricityRate,
    utilityName: PEI_ELECTRICITY_RATES.utilityName,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate cumulative savings over 25 years
 * Accounts for:
 * - Annual panel degradation (0.5% per year)
 * - Annual electricity rate increases (3% estimated)
 */
function calculate25YearSavings(
  baseAnnualProduction: number,
  baseRate: number,
  annualDegradation: number,
  annualRateIncrease: number
): number {
  let totalSavings = 0;
  let currentProduction = baseAnnualProduction;
  let currentRate = baseRate;

  for (let year = 1; year <= 25; year++) {
    totalSavings += currentProduction * currentRate;
    currentProduction *= (1 - annualDegradation);
    currentRate *= (1 + annualRateIncrease);
  }

  return totalSavings;
}

/**
 * Calculate total lifetime production with degradation
 */
function calculateLifetimeProduction(
  baseAnnualProduction: number,
  years: number,
  annualDegradation: number
): number {
  let total = 0;
  let currentProduction = baseAnnualProduction;

  for (let i = 0; i < years; i++) {
    total += currentProduction;
    currentProduction *= (1 - annualDegradation);
  }

  return total;
}

/**
 * Get list of available incentives with potential values
 */
function getAvailableIncentives(systemCost: number): IncentiveInfo[] {
  return [
    {
      name: PEI_INCENTIVES.canadaGreenerHomesLoan.name,
      available: PEI_INCENTIVES.canadaGreenerHomesLoan.available,
      description: PEI_INCENTIVES.canadaGreenerHomesLoan.description,
      potentialValue: Math.min(systemCost, PEI_INCENTIVES.canadaGreenerHomesLoan.maxAmount),
      url: PEI_INCENTIVES.canadaGreenerHomesLoan.url,
    },
    {
      name: PEI_INCENTIVES.netMetering.name,
      available: PEI_INCENTIVES.netMetering.available,
      description: PEI_INCENTIVES.netMetering.description,
      url: PEI_INCENTIVES.netMetering.url,
    },
  ];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format a number as Canadian currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-CA').format(Math.round(num));
}

/**
 * Calculate monthly breakdown of production
 * Uses PEI monthly peak sun hours for seasonal variation
 */
export function calculateMonthlyProduction(
  annualProductionKWh: number,
  monthlyPeakSunHours: Record<string, number>
): Record<string, number> {
  const totalPeakHours = Object.values(monthlyPeakSunHours).reduce((a, b) => a + b, 0);

  const monthlyProduction: Record<string, number> = {};

  for (const [month, hours] of Object.entries(monthlyPeakSunHours)) {
    const fraction = hours / totalPeakHours;
    monthlyProduction[month] = Math.round(annualProductionKWh * fraction);
  }

  return monthlyProduction;
}

/**
 * Estimate system cost range (low to high)
 */
export function getSystemCostRange(systemSizeKW: number): {
  low: number;
  mid: number;
  high: number;
} {
  const watts = systemSizeKW * 1000;
  return {
    low: Math.round(watts * PEI_INSTALLATION_COSTS.costPerWattLow),
    mid: Math.round(watts * PEI_INSTALLATION_COSTS.costPerWattMid),
    high: Math.round(watts * PEI_INSTALLATION_COSTS.costPerWattHigh),
  };
}

/**
 * Calculate what percentage of home electricity usage the system covers
 */
export function calculateCoveragePercentage(
  annualProductionKWh: number,
  annualConsumptionKWh: number
): number {
  if (annualConsumptionKWh <= 0) return 0;
  return Math.min(100, Math.round((annualProductionKWh / annualConsumptionKWh) * 100));
}
