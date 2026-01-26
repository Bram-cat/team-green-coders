/**
 * Solar Calculation Engine - PEI Methodology
 *
 * Based on calculation.json and information.json:
 * - Uses PEI Photovoltaic Potential: 1459 kWh/kWp (similar to Halifax, NS)
 * - Residential system median: 7.2 kW (18 panels × 400W)
 * - Electricity rate: $0.174/kWh (17.4 cents CAD)
 * - Installation cost: $3.00-$3.50/W for cash purchases
 * - Panel specifications: 400W, 1.7 m², 21% efficiency
 */

import {
  PEI_ELECTRICITY_RATES,
  PEI_INSTALLATION_COSTS,
  PANEL_WATTAGE_BY_TYPE,
  PANEL_EFFICIENCY_BY_TYPE,
  ROOF_MATERIAL_COST_MULTIPLIER,
  PEI_MONTHLY_AVG_TEMP,
  calculateSnowLossFactor,
  calculateCombinedEfficiency,
  calculateTemperatureAdjustment
} from '@/lib/data/peiSolarData';

// ============================================
// TYPES
// ============================================

export interface SolarSystemSpecs {
    panelCount: number;
    systemSizeKW: number;
    roofAreaUsedSqM: number;
    annualProductionKWh: number;
}

export interface FinancialResults {
    systemCost: number;
    annualSavings: number;
    monthlySavings: number;
    paybackYears: number;
    twentyFiveYearSavings: number;
    roi: number;
}

export interface CalculationInputs {
    roofAreaSqM: number;
    usablePercentage: number;
    peakSunHoursPerDay: number;
    monthlyElectricityBill?: number;
    annualConsumptionKWh?: number;
    // Accuracy enhancement parameters
    roofPitchDegrees?: number;
    orientation?: 'north' | 'south' | 'east' | 'west' | 'flat';
    panelType?: 'standard' | 'premium' | 'high-efficiency';
    roofMaterial?: 'asphalt' | 'metal' | 'tile' | 'other';
    shadingLevel?: 'low' | 'medium' | 'high';
    shadePatterns?: {
        shadeMorning: boolean;
        shadeAfternoon: boolean;
        shadeSeasonal: boolean;
    };
}

// ============================================
// CONSTANTS - Based on PEI Data
// ============================================

const PANEL_WATTAGE = 400; // Watts per panel (standard 2024 - can be overridden)
const PANEL_AREA = 1.7; // m² per panel (standard size)
const PEI_PV_POTENTIAL = 1459; // kWh/kWp annual (Halifax/Maritime climate)
const ELECTRICITY_RATE = 0.174; // $/kWh for PEI (Maritime Electric)
const INSTALLATION_COST_PER_WATT = 3.00; // $/W (cash purchase median - varies by panel type)
const FIRE_CODE_SETBACK = 0.9; // meters (3 ft from edges)

// ============================================
// ACCURACY ENHANCEMENT FUNCTIONS
// ============================================

/**
 * Calculate dynamic tilt factor based on roof pitch and orientation
 * PEI optimal tilt: 44° for maximum annual production
 *
 * @param roofPitchDegrees - Actual roof pitch (0-60)
 * @param orientation - Roof orientation
 * @returns Tilt factor (0.85-1.05)
 */
function calculateTiltFactor(roofPitchDegrees: number, orientation: string): number {
  const OPTIMAL_TILT = 44; // PEI optimal tilt angle
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

/**
 * Adjust AI-detected shading level based on user-reported shade patterns
 *
 * @param aiShadingLevel - Shading level from AI analysis
 * @param shadePatterns - User-reported shade patterns
 * @returns Adjusted shading level
 */
function adjustShadingLevel(
  aiShadingLevel: string,
  shadePatterns?: {
    shadeMorning: boolean;
    shadeAfternoon: boolean;
    shadeSeasonal: boolean;
  }
): 'low' | 'medium' | 'high' {
  if (!shadePatterns) return aiShadingLevel as 'low' | 'medium' | 'high';

  let shadingScore = 0;

  // Convert AI level to numeric score
  if (aiShadingLevel === 'low') shadingScore = 1;
  else if (aiShadingLevel === 'medium') shadingScore = 2;
  else if (aiShadingLevel === 'high') shadingScore = 3;

  // User-reported shading increases score
  if (shadePatterns.shadeMorning) shadingScore += 0.5;
  if (shadePatterns.shadeAfternoon) shadingScore += 0.5;
  // Seasonal shading is less impactful (deciduous trees)
  if (shadePatterns.shadeSeasonal) shadingScore -= 0.3;

  // Convert back to categorical level
  if (shadingScore <= 1.2) return 'low';
  if (shadingScore <= 2.5) return 'medium';
  return 'high';
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate complete solar system specifications and financials
 * All calculations are validated to produce realistic, positive values
 */
export function calculateSolarSystem(inputs: CalculationInputs): {
    specs: SolarSystemSpecs;
    financials: FinancialResults;
} {
    // Validate inputs
    const validated = validateInputs(inputs);

    // Calculate system specifications
    const specs = calculateSystemSpecs(validated);

    // Calculate financials with realistic caps
    const financials = calculateFinancials(specs, validated);

    // Final validation
    validateOutputs(specs, financials);

    return { specs, financials };
}

// ============================================
// SYSTEM SPECIFICATIONS
// ============================================

function calculateSystemSpecs(inputs: CalculationInputs): SolarSystemSpecs {
    // Step 1: Calculate usable roof area (after fire code setbacks and obstacles)
    const usableAreaSqM = inputs.roofAreaSqM * (inputs.usablePercentage / 100);

    // Step 2: Get panel specifications based on type (accuracy enhancement)
    const panelType = inputs.panelType || 'premium';
    const panelWattage = PANEL_WATTAGE_BY_TYPE[panelType] || 400;

    // Step 2: Calculate panel count using REALISTIC area requirements
    // Reality: Each panel needs ~5.5 m² of usable roof (not 2 m²!)
    // This accounts for:
    // - Panel physical size: 1.7 m²
    // - Fire code setbacks: 0.9m from all roof edges
    // - Maintenance walkways: 0.6-0.9m between rows
    // - Row spacing for shading prevention
    // - Irregular roof shapes and obstacles
    const EFFECTIVE_AREA_PER_PANEL = 5.5; // m² of usable roof per panel

    // Calculate realistic panel count based on usable area tiers
    // Source: Real-world residential solar installations
    let panelCount: number;

    if (usableAreaSqM < 50) {
        // Very small roof: 30-49 m² → 5-8 panels
        panelCount = Math.max(5, Math.min(8, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 60) {
        // Small roof: 50-59 m² → 8-10 panels
        panelCount = Math.max(8, Math.min(10, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 70) {
        // Medium-small roof: 60-69 m² → 11-13 panels
        panelCount = Math.max(11, Math.min(13, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 80) {
        // Medium roof: 70-79 m² → 13-15 panels
        panelCount = Math.max(13, Math.min(15, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 90) {
        // Medium-large roof: 80-89 m² → 15-17 panels
        panelCount = Math.max(15, Math.min(17, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 100) {
        // Large roof: 90-99 m² → 17-19 panels (PEI median: 18 panels)
        panelCount = Math.max(17, Math.min(19, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else if (usableAreaSqM < 120) {
        // Very large roof: 100-119 m² → 19-22 panels
        panelCount = Math.max(19, Math.min(22, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    } else {
        // Extra large roof: 120+ m² → 22-27 panels (PEI 80th percentile: 27 panels)
        panelCount = Math.max(22, Math.min(27, Math.floor(usableAreaSqM / EFFECTIVE_AREA_PER_PANEL)));
    }

    // Step 3: Calculate system size in kW (using dynamic panel wattage)
    const systemSizeKW = (panelCount * panelWattage) / 1000;

    // Step 4: Calculate annual production with accuracy enhancements
    // Base production: System Size (kW) × PV Potential (kWh/kWp)
    let annualProductionKWh = systemSizeKW * PEI_PV_POTENTIAL;

    // Apply tilt factor adjustment (accuracy enhancement #1)
    if (inputs.roofPitchDegrees !== undefined && inputs.orientation) {
        const tiltFactor = calculateTiltFactor(inputs.roofPitchDegrees, inputs.orientation);
        annualProductionKWh *= tiltFactor;
    }

    // Apply temperature adjustment (accuracy enhancement #4)
    const tempAdjustment = calculateTemperatureAdjustment(PEI_MONTHLY_AVG_TEMP);
    annualProductionKWh *= tempAdjustment;

    return {
        panelCount,
        systemSizeKW: Math.round(systemSizeKW * 10) / 10,
        roofAreaUsedSqM: Math.round(panelCount * PANEL_AREA),
        annualProductionKWh: Math.round(annualProductionKWh),
    };
}

// ============================================
// FINANCIAL CALCULATIONS
// ============================================

function calculateFinancials(
    specs: SolarSystemSpecs,
    inputs: CalculationInputs
): FinancialResults {
    // System cost: varies by panel type and roof material (accuracy enhancements)
    const panelType = inputs.panelType || 'premium';
    let costPerWatt = INSTALLATION_COST_PER_WATT;

    // Adjust cost based on panel type
    if (panelType === 'standard') {
        costPerWatt = 2.75; // Standard panels are cheaper
    } else if (panelType === 'high-efficiency') {
        costPerWatt = 3.50; // High-efficiency panels are more expensive
    }

    // Apply roof material cost multiplier (accuracy enhancement)
    const roofMaterial = inputs.roofMaterial || 'asphalt';
    const materialMultiplier = ROOF_MATERIAL_COST_MULTIPLIER[roofMaterial] || 1.0;

    const systemCost = Math.round(specs.systemSizeKW * 1000 * costPerWatt * materialMultiplier);

    // Annual savings: Production × Maritime Electric rate
    // Formula from calculation.json: Annual Savings = Production (kWh) × Rate ($/kWh)
    let annualSavings = Math.round(specs.annualProductionKWh * ELECTRICITY_RATE);

    // If user provided monthly bill, cap at realistic consumption offset
    if (inputs.monthlyElectricityBill) {
        const annualBill = inputs.monthlyElectricityBill * 12;
        // Most PEI homes won't save more than their annual bill
        // Cap at 100% of annual bill (net metering allows this)
        annualSavings = Math.min(annualSavings, annualBill);
    }

    const monthlySavings = Math.round(annualSavings / 12);

    // Payback period: Net Cost ÷ Annual Savings
    const paybackYears = systemCost / annualSavings;

    // 25-year savings (with 3% electricity rate increase, 0.5% panel degradation)
    const twentyFiveYearSavings = calculate25YearSavings(annualSavings, systemCost);

    // ROI: (Total Savings - Initial Cost) ÷ Initial Cost × 100
    const roi = ((twentyFiveYearSavings - systemCost) / systemCost) * 100;

    return {
        systemCost,
        annualSavings,
        monthlySavings,
        paybackYears: Math.round(paybackYears * 10) / 10,
        twentyFiveYearSavings: Math.round(twentyFiveYearSavings),
        roi: Math.round(roi),
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function validateInputs(inputs: CalculationInputs): CalculationInputs {
    return {
        // PEI homes: typical 50-200 m² roof area
        roofAreaSqM: Math.max(30, Math.min(inputs.roofAreaSqM, 250)),
        // Usable percentage: 40-95% depending on obstacles, setbacks
        usablePercentage: Math.max(40, Math.min(inputs.usablePercentage, 95)),
        // PEI peak sun hours: 3.5-4.5 hours typical
        peakSunHoursPerDay: Math.max(3.0, Math.min(inputs.peakSunHoursPerDay, 5.0)),
        // Monthly bills: $80-$400 typical for PEI residential
        monthlyElectricityBill: inputs.monthlyElectricityBill
            ? Math.max(50, Math.min(inputs.monthlyElectricityBill, 600))
            : undefined,
        // Annual consumption: 5,000-20,000 kWh typical
        annualConsumptionKWh: inputs.annualConsumptionKWh
            ? Math.max(3000, Math.min(inputs.annualConsumptionKWh, 25000))
            : undefined,
    };
}

function validateOutputs(specs: SolarSystemSpecs, financials: FinancialResults): void {
    // Ensure all values are positive and realistic
    // Residential range: 5-27 panels (2.0-10.8 kW)
    // PEI median: 18 panels (7.2 kW), 80th percentile: 27 panels (11 kW)
    if (specs.panelCount < 5 || specs.panelCount > 27) {
        throw new Error(`Invalid panel count: ${specs.panelCount}. Expected 5-27 panels for residential.`);
    }
    if (specs.systemSizeKW <= 0 || specs.systemSizeKW > 10.8) {
        throw new Error(`Invalid system size: ${specs.systemSizeKW} kW. Expected 2.0-10.8 kW for residential.`);
    }
    if (specs.annualProductionKWh <= 0 || specs.annualProductionKWh > 16000) {
        throw new Error(`Invalid production: ${specs.annualProductionKWh} kWh. Expected 2,900-16,000 kWh.`);
    }
    if (financials.systemCost <= 0) throw new Error('Invalid system cost');
    if (financials.annualSavings <= 0) throw new Error('Invalid savings');
}

function calculate25YearSavings(annualSavings: number, systemCost: number): number {
    let totalSavings = 0;
    let currentSavings = annualSavings;
    const rateIncrease = 0.03; // 3% annual increase
    const degradation = 0.005; // 0.5% annual degradation

    for (let year = 1; year <= 25; year++) {
        totalSavings += currentSavings;
        currentSavings *= (1 + rateIncrease - degradation);
    }

    return totalSavings;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function estimateAnnualConsumptionFromBill(monthlyBill: number): number {
    // Subtract basic charge, divide by rate
    const monthlyKWh = (monthlyBill - 28.14) / ELECTRICITY_RATE;
    return Math.round(monthlyKWh * 12);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount)); // Ensure positive display
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-CA').format(Math.abs(Math.round(num)));
}
