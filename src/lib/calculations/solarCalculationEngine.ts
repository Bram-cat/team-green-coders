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

import { PEI_ELECTRICITY_RATES, PEI_INSTALLATION_COSTS } from '@/lib/data/peiSolarData';

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
}

// ============================================
// CONSTANTS - Based on PEI Data
// ============================================

const PANEL_WATTAGE = 400; // Watts per panel (standard 2024)
const PANEL_AREA = 1.7; // m² per panel (standard size)
const PEI_PV_POTENTIAL = 1459; // kWh/kWp annual (Halifax/Maritime climate)
const ELECTRICITY_RATE = 0.174; // $/kWh for PEI (Maritime Electric)
const INSTALLATION_COST_PER_WATT = 3.00; // $/W (cash purchase median)
const FIRE_CODE_SETBACK = 0.9; // meters (3 ft from edges)

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

    // Step 2: Calculate maximum panels that physically fit
    // Based on industry research: Each panel = 1.7 m² + 20% spacing = 2.04 m² per panel
    // Source: https://shopsolarkits.com/blogs/learning-center/solar-panel-square-footage-calculator
    const areaPerPanelWithSpacing = PANEL_AREA * 1.2;
    const maxPanelsFit = Math.floor(usableAreaSqM / areaPerPanelWithSpacing);

    // Step 3: Apply realistic residential limits based on usable roof area
    // Based on web research and PEI residential data:
    // - Small homes (30-50 m² usable): 8-12 panels (3.2-4.8 kW)
    // - Medium homes (50-75 m² usable): 12-18 panels (4.8-7.2 kW)
    // - Large homes (75-100 m² usable): 18-25 panels (7.2-10 kW)
    // - Very large (100+ m² usable): up to 30 panels max (12 kW)
    // PEI median: 18 panels (7.2 kW), 80th percentile: 27 panels (11 kW)

    let recommendedPanelCount: number;

    if (usableAreaSqM < 50) {
        // Small roof: Cap at 12 panels (4.8 kW)
        recommendedPanelCount = Math.min(maxPanelsFit, 12);
    } else if (usableAreaSqM < 75) {
        // Medium roof: Cap at 18 panels (7.2 kW) - PEI median
        recommendedPanelCount = Math.min(maxPanelsFit, 18);
    } else if (usableAreaSqM < 100) {
        // Large roof: Cap at 25 panels (10 kW)
        recommendedPanelCount = Math.min(maxPanelsFit, 25);
    } else {
        // Very large roof: Cap at 30 panels (12 kW) - approaching commercial
        recommendedPanelCount = Math.min(maxPanelsFit, 30);
    }

    // Ensure minimum of 8 panels (3.2 kW) for viability
    const panelCount = Math.max(8, recommendedPanelCount);

    // Step 4: Calculate system size in kW
    const systemSizeKW = (panelCount * PANEL_WATTAGE) / 1000;

    // Step 5: Calculate annual production using PEI Photovoltaic Potential
    // Formula from calculation.json:
    // Annual Production (kWh) = System Size (kW) × PV Potential (kWh/kWp)
    // For PEI: 1459 kWh/kWp (similar to Halifax, NS)
    const annualProductionKWh = Math.round(systemSizeKW * PEI_PV_POTENTIAL);

    return {
        panelCount,
        systemSizeKW: Math.round(systemSizeKW * 10) / 10,
        roofAreaUsedSqM: Math.round(panelCount * PANEL_AREA),
        annualProductionKWh,
    };
}

// ============================================
// FINANCIAL CALCULATIONS
// ============================================

function calculateFinancials(
    specs: SolarSystemSpecs,
    inputs: CalculationInputs
): FinancialResults {
    // System cost: $3.00/W for cash purchase (PEI median)
    const systemCost = Math.round(specs.systemSizeKW * 1000 * INSTALLATION_COST_PER_WATT);

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
    // Residential range: 8-30 panels (3.2-12 kW)
    if (specs.panelCount < 8 || specs.panelCount > 30) {
        throw new Error(`Invalid panel count: ${specs.panelCount}. Expected 8-30 panels.`);
    }
    if (specs.systemSizeKW <= 0 || specs.systemSizeKW > 12) {
        throw new Error(`Invalid system size: ${specs.systemSizeKW} kW. Expected 3.2-12 kW.`);
    }
    if (specs.annualProductionKWh <= 0 || specs.annualProductionKWh > 18000) {
        throw new Error(`Invalid production: ${specs.annualProductionKWh} kWh. Expected 4,500-18,000 kWh.`);
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
