import { RoofAnalysisResult, SolarPotentialResult, SolarRecommendation, Suggestion } from '@/types/analysis';

const PANEL_WATTAGE = 400; // 400W per panel (modern standard)
const PANEL_AREA_SQM = 1.7; // ~1.7 m² per panel

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

  // Deduct for steep or flat pitch (optimal is 30-35 degrees)
  const pitchDeviation = Math.abs(roofAnalysis.roofPitchDegrees - 32);
  score -= Math.min(pitchDeviation, 15);

  // Bonus for high irradiance
  if (solarPotential.averageIrradianceKWhPerSqM > 1500) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Calculate system size
  const usableArea = roofAnalysis.roofAreaSqMeters * (roofAnalysis.usableAreaPercentage / 100);
  const maxPanels = Math.floor(usableArea / PANEL_AREA_SQM);
  const recommendedPanels = Math.min(maxPanels, solarPotential.optimalPanelCount);
  const systemSizeKW = (recommendedPanels * PANEL_WATTAGE) / 1000;

  // Calculate annual production
  const estimatedAnnualProductionKWh = Math.round(
    systemSizeKW * solarPotential.peakSunHoursPerDay * 365 * 0.8 // 80% efficiency factor
  );

  // Generate layout suggestion
  const layoutSuggestion = generateLayoutSuggestion(roofAnalysis, recommendedPanels);

  // Generate plain-language explanation
  const explanation = generateExplanation(score, roofAnalysis, solarPotential, systemSizeKW);

  // Generate suggestions
  const suggestions = generateSuggestions(roofAnalysis);

  return {
    suitabilityScore: score,
    systemSizeKW: Math.round(systemSizeKW * 10) / 10,
    panelCount: recommendedPanels,
    estimatedAnnualProductionKWh,
    layoutSuggestion,
    explanation,
    suggestions,
  };
}

function generateLayoutSuggestion(roof: RoofAnalysisResult, panels: number): string {
  if (roof.complexity === 'simple') {
    return `A single array of ${panels} panels arranged in ${Math.ceil(panels / 4)} rows would maximize efficiency. Focus on the south-facing section for optimal sun exposure.`;
  } else if (roof.complexity === 'moderate') {
    return `Split installation recommended: Two arrays of ${Math.ceil(panels / 2)} panels each to work around roof features. Consider microinverters for independent panel optimization.`;
  }
  return `Complex roof structure requires a custom layout. A professional site assessment is recommended for optimal panel placement across multiple roof planes.`;
}

function generateExplanation(
  score: number,
  roof: RoofAnalysisResult,
  solar: SolarPotentialResult,
  systemSize: number
): string {
  let quality: string;
  if (score >= 80) quality = 'excellent';
  else if (score >= 60) quality = 'good';
  else if (score >= 40) quality = 'moderate';
  else quality = 'challenging';

  return `Your roof has ${quality} potential for solar installation. ` +
    `With approximately ${roof.roofAreaSqMeters} m² of roof area and ${roof.shadingLevel} shading levels, ` +
    `a ${systemSize} kW system could generate substantial energy savings. ` +
    `Your location receives approximately ${solar.peakSunHoursPerDay.toFixed(1)} peak sun hours daily, ` +
    `which is ${solar.peakSunHoursPerDay >= 5 ? 'above' : 'around'} the average for residential solar installations.`;
}

function generateSuggestions(roof: RoofAnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (roof.shadingLevel !== 'low') {
    suggestions.push({
      category: 'shading',
      title: 'Consider tree trimming',
      description: 'Reducing nearby tree coverage could increase your solar production by 15-25%. Focus on trees blocking the south-facing roof sections.',
      priority: roof.shadingLevel === 'high' ? 'high' : 'medium',
    });
  }

  if (roof.complexity === 'complex') {
    suggestions.push({
      category: 'equipment',
      title: 'Use microinverters',
      description: 'Microinverters optimize each panel individually, making them ideal for complex roof layouts with multiple orientations or partial shading.',
      priority: 'high',
    });
  } else {
    suggestions.push({
      category: 'equipment',
      title: 'String inverter recommended',
      description: 'A string inverter offers cost-effective performance for your straightforward roof layout. Consider adding optimizers for any shaded panels.',
      priority: 'low',
    });
  }

  if (Math.abs(roof.roofPitchDegrees - 32) > 15) {
    suggestions.push({
      category: 'orientation',
      title: 'Consider tilt brackets',
      description: `Your roof pitch of ${roof.roofPitchDegrees}° differs from the optimal 30-35°. Adjustable tilt brackets could improve energy capture by 5-10%.`,
      priority: 'medium',
    });
  }

  suggestions.push({
    category: 'orientation',
    title: 'Maximize south-facing exposure',
    description: 'Prioritize panel placement on south-facing roof sections for maximum annual energy production in the Northern Hemisphere.',
    priority: 'medium',
  });

  suggestions.push({
    category: 'maintenance',
    title: 'Annual cleaning recommended',
    description: 'Regular panel cleaning every 6-12 months maintains optimal efficiency. Consider a monitoring system to track performance.',
    priority: 'low',
  });

  return suggestions;
}
