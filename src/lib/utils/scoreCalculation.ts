import { RoofAnalysisResult, SolarPotentialResult, SolarRecommendation, Suggestion } from '@/types/analysis';
import { calculateFinancials, formatCurrency } from '@/lib/calculations/financialCalculations';
import {
  PEI_SOLAR_DATA,
  PEI_INSTALLATION_COSTS,
  PEI_ELECTRICITY_RATES,
  PEI_COMBINED_EFFICIENCY,
} from '@/lib/data/peiSolarData';

const PANEL_WATTAGE = PEI_INSTALLATION_COSTS.panelWattage; // 400W per panel
const PANEL_AREA_SQM = PEI_INSTALLATION_COSTS.panelAreaSqM; // ~1.7 m² per panel

export function calculateRecommendation(
  roofAnalysis: RoofAnalysisResult,
  solarPotential: SolarPotentialResult
): SolarRecommendation {
  // Calculate suitability score (0-100)
  let score = 100;

  // Deduct for shading
  const shadingDeductions: Record<string, number> = { low: 0, medium: 15, high: 35 };
  score -= shadingDeductions[roofAnalysis.shadingLevel];

  // Deduct for complexity
  const complexityDeductions: Record<string, number> = { simple: 0, moderate: 10, complex: 20 };
  score -= complexityDeductions[roofAnalysis.complexity];

  // Deduct for steep or flat pitch (optimal is 30-45 degrees for PEI latitude)
  const optimalPitch = PEI_SOLAR_DATA.optimalTiltAngle; // 44 degrees for PEI
  const pitchDeviation = Math.abs(roofAnalysis.roofPitchDegrees - optimalPitch);
  score -= Math.min(pitchDeviation * 0.5, 15);

  // Bonus for high irradiance (PEI baseline is ~1150, so this may not apply often)
  if (solarPotential.averageIrradianceKWhPerSqM > 1200) {
    score += 3;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Calculate system size
  const usableArea = roofAnalysis.roofAreaSqMeters * (roofAnalysis.usableAreaPercentage / 100);
  const maxPanels = Math.floor(usableArea / PANEL_AREA_SQM);
  const recommendedPanels = Math.min(maxPanels, solarPotential.optimalPanelCount);
  const systemSizeKW = (recommendedPanels * PANEL_WATTAGE) / 1000;

  // Calculate annual production using PEI climate factors
  // Formula: System Size (kW) × Peak Sun Hours × 365 days × Combined Efficiency
  const estimatedAnnualProductionKWh = Math.round(
    systemSizeKW * solarPotential.peakSunHoursPerDay * 365 * PEI_COMBINED_EFFICIENCY
  );

  // Calculate financials
  const financials = calculateFinancials(systemSizeKW, estimatedAnnualProductionKWh);

  // Generate layout suggestion
  const layoutSuggestion = generateLayoutSuggestion(roofAnalysis, recommendedPanels);

  // Generate plain-language explanation with PEI context
  const explanation = generateExplanation(
    score,
    roofAnalysis,
    solarPotential,
    systemSizeKW,
    financials.annualElectricitySavings
  );

  // Generate suggestions including PEI-specific ones
  const suggestions = generateSuggestions(roofAnalysis);

  return {
    suitabilityScore: score,
    systemSizeKW: Math.round(systemSizeKW * 10) / 10,
    panelCount: recommendedPanels,
    estimatedAnnualProductionKWh,
    layoutSuggestion,
    explanation,
    suggestions,
    financials,
  };
}

function generateLayoutSuggestion(roof: RoofAnalysisResult, panels: number): string {
  const rows = Math.ceil(panels / 4);

  if (roof.complexity === 'simple') {
    return `A single array of ${panels} panels arranged in ${rows} row${rows > 1 ? 's' : ''} would maximize efficiency. For PEI's latitude (46°N), prioritize south-facing sections with a tilt angle close to 44° for optimal year-round production.`;
  } else if (roof.complexity === 'moderate') {
    const halfPanels = Math.ceil(panels / 2);
    return `Split installation recommended: Two arrays of approximately ${halfPanels} panels each to work around roof features. Consider microinverters for independent panel optimization, which is especially beneficial for PEI's variable weather conditions.`;
  }
  return `Complex roof structure requires a custom layout. A professional site assessment by a PEI-certified installer is recommended for optimal panel placement across multiple roof planes. Request quotes from Maritime Electric approved contractors.`;
}

function generateExplanation(
  score: number,
  roof: RoofAnalysisResult,
  solar: SolarPotentialResult,
  systemSize: number,
  annualSavings: number
): string {
  let quality: string;
  if (score >= 80) quality = 'excellent';
  else if (score >= 60) quality = 'good';
  else if (score >= 40) quality = 'moderate';
  else quality = 'challenging';

  const savingsText = formatCurrency(annualSavings);

  return `Your PEI property has ${quality} potential for solar installation. ` +
    `With approximately ${roof.roofAreaSqMeters} m² of roof area and ${roof.shadingLevel} shading levels, ` +
    `a ${systemSize.toFixed(1)} kW system could save you approximately ${savingsText} annually at current Maritime Electric rates. ` +
    `PEI receives an average of ${solar.peakSunHoursPerDay.toFixed(1)} peak sun hours daily. ` +
    `While winters are shorter on sunlight, PEI's cold temperatures can boost panel efficiency by 2-3%.`;
}

function generateSuggestions(roof: RoofAnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Shading suggestions
  if (roof.shadingLevel !== 'low') {
    suggestions.push({
      category: 'shading',
      title: 'Consider tree trimming',
      description: 'Reducing nearby tree coverage could increase your solar production by 15-25%. Focus on trees blocking the south-facing roof sections.',
      priority: roof.shadingLevel === 'high' ? 'high' : 'medium',
    });
  }

  // Equipment suggestions based on complexity
  if (roof.complexity === 'complex') {
    suggestions.push({
      category: 'equipment',
      title: 'Use microinverters',
      description: 'Microinverters optimize each panel individually, making them ideal for complex roof layouts with multiple orientations or partial shading. This is especially beneficial for PEI\'s variable cloud conditions.',
      priority: 'high',
    });
  } else {
    suggestions.push({
      category: 'equipment',
      title: 'String inverter recommended',
      description: 'A string inverter offers cost-effective performance for your straightforward roof layout. Consider adding power optimizers for any partially shaded panels.',
      priority: 'low',
    });
  }

  // Pitch/orientation suggestions
  if (Math.abs(roof.roofPitchDegrees - PEI_SOLAR_DATA.optimalTiltAngle) > 15) {
    suggestions.push({
      category: 'orientation',
      title: 'Consider tilt brackets',
      description: `Your roof pitch of ${roof.roofPitchDegrees}° differs from PEI's optimal 44°. Adjustable tilt brackets could improve energy capture by 5-10%, especially during winter months.`,
      priority: 'medium',
    });
  }

  // South-facing suggestion
  suggestions.push({
    category: 'orientation',
    title: 'Maximize south-facing exposure',
    description: 'Prioritize panel placement on south-facing roof sections for maximum annual energy production in PEI. East or west-facing panels produce about 15-20% less energy.',
    priority: 'medium',
  });

  // PEI-specific: Net metering setup
  suggestions.push({
    category: 'equipment',
    title: 'Set up net metering with Maritime Electric',
    description: `Maritime Electric offers net metering at the retail rate (${formatCurrency(PEI_ELECTRICITY_RATES.residentialRate)}/kWh). Ensure your installer configures a bi-directional meter to earn credits for excess energy.`,
    priority: 'high',
  });

  // PEI-specific: Winter considerations
  suggestions.push({
    category: 'maintenance',
    title: 'Winter snow management',
    description: 'PEI winters may require occasional snow clearing from panels. Consider installing at a steeper angle (40-45°) to help snow slide off naturally, or plan for 2-3 manual clearings per winter.',
    priority: 'medium',
  });

  // General maintenance
  suggestions.push({
    category: 'maintenance',
    title: 'Annual cleaning recommended',
    description: 'Regular panel cleaning every 6-12 months maintains optimal efficiency. Consider a monitoring system to track performance and detect any issues early.',
    priority: 'low',
  });

  return suggestions;
}
