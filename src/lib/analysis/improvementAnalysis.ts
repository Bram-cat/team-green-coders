import { ShadingLevel } from '@/types/analysis';
import { analyzeExistingPanelsWithAI, isOpenAIAvailable } from '@/lib/ai/openaiService';

export interface ImprovementSuggestion {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedEfficiencyGain: number;
  estimatedCost?: number;
}

export interface ExistingInstallationAnalysis {
  // Current installation details
  currentPanelCount: number; // AI detected count (minimum of range)
  currentPanelCountMax: number; // AI count + 7 (maximum of range)
  estimatedSystemSizeKW: number;
  estimatedSystemSizeKWMax: number; // System size using max panel count
  currentEfficiency: number;
  orientation: string;
  panelCondition: string;

  // Roof analysis
  roofAreaSqMeters: number;
  shadingLevel: ShadingLevel;
  roofPitchDegrees: number;
  complexity: 'simple' | 'moderate' | 'complex';
  usableAreaPercentage: number;

  // Improvement potential
  potentialEfficiency: number;
  estimatedAdditionalProduction: number;
  suggestions: ImprovementSuggestion[];

  // AI metadata
  aiConfidence?: number;
  usedAI: boolean;
}

/**
 * Analyze existing solar installation and provide improvement suggestions
 */
export async function analyzeExistingInstallation(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ExistingInstallationAnalysis> {
  const { vision: aiAvailable } = isOpenAIAvailable();

  // Try AI analysis if available
  if (aiAvailable) {
    console.log('Starting AI improvement analysis...');

    try {
      const aiResult = await analyzeExistingPanelsWithAI(imageBuffer, mimeType);

      if (aiResult.success) {
        console.log('AI improvement analysis successful, confidence:', aiResult.data.confidence);

        // Calculate range: AI count to AI count + 7
        const aiPanelCount = aiResult.data.currentPanelCount;
        const maxPanelCount = aiPanelCount + 7;
        const panelWattage = 0.4; // 400W per panel = 0.4kW

        return {
          ...aiResult.data,
          currentPanelCountMax: maxPanelCount,
          estimatedSystemSizeKWMax: parseFloat((maxPanelCount * panelWattage).toFixed(2)),
          usedAI: true,
          aiConfidence: aiResult.data.confidence,
        };
      } else {
        console.warn('AI improvement analysis failed:', aiResult.error);
        console.log('Falling back to mock data...');
      }
    } catch (error) {
      console.error('Error in AI improvement analysis:', error);
      console.log('Falling back to mock data...');
    }
  } else {
    console.log('AI not available (no API key configured)');
  }

  // Fallback to mock data
  console.log('Using mock improvement analysis data');
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    ...generateMockImprovementAnalysis(),
    usedAI: false,
  };
}

/**
 * Generate mock improvement analysis data
 */
function generateMockImprovementAnalysis(): Omit<ExistingInstallationAnalysis, 'usedAI' | 'aiConfidence'> {
  const currentPanelCount = Math.floor(Math.random() * 12) + 12; // 12-24 panels
  const currentPanelCountMax = currentPanelCount + 7; // Add 7 for range
  const panelWattage = 350; // Typical 350W panel
  const estimatedSystemSizeKW = (currentPanelCount * panelWattage) / 1000;
  const estimatedSystemSizeKWMax = (currentPanelCountMax * panelWattage) / 1000;
  const currentEfficiency = Math.floor(Math.random() * 20) + 65; // 65-85% efficiency

  const shadingLevels: ShadingLevel[] = ['low', 'medium', 'high'];
  const complexities: ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];
  const orientations = ['South', 'South-West', 'South-East', 'West', 'East'];
  const conditions = ['Good', 'Fair', 'Needs Cleaning', 'Minor Damage'];

  const shadingLevel = shadingLevels[Math.floor(Math.random() * shadingLevels.length)];
  const complexity = complexities[Math.floor(Math.random() * complexities.length)];

  // Generate suggestions based on conditions
  const suggestions: ImprovementSuggestion[] = [];

  // Cleaning suggestion (high priority if efficiency is low)
  if (currentEfficiency < 75) {
    suggestions.push({
      type: 'cleaning',
      title: 'Panel Cleaning',
      description: 'Regular cleaning of solar panels can restore 5-15% efficiency. Dust, bird droppings, and debris reduce light absorption.',
      priority: 'high',
      estimatedEfficiencyGain: Math.floor(Math.random() * 10) + 5,
      estimatedCost: 200,
    });
  }

  // Shading/tree trimming suggestion
  if (shadingLevel === 'high' || shadingLevel === 'medium') {
    suggestions.push({
      type: 'tree_trimming',
      title: 'Reduce Shading',
      description: 'Trees or structures are causing significant shading. Trimming nearby vegetation could increase energy production by 10-20%.',
      priority: shadingLevel === 'high' ? 'high' : 'medium',
      estimatedEfficiencyGain: shadingLevel === 'high' ? 18 : 12,
      estimatedCost: 500,
    });
  }

  // Angle adjustment suggestion
  if (Math.random() > 0.5) {
    suggestions.push({
      type: 'angle_adjustment',
      title: 'Optimize Panel Angle',
      description: 'Adjusting panel tilt angle to match optimal seasonal angles could improve year-round production by 8-12%.',
      priority: 'medium',
      estimatedEfficiencyGain: Math.floor(Math.random() * 5) + 8,
      estimatedCost: 800,
    });
  }

  // Additional panels suggestion
  if (Math.random() > 0.6) {
    suggestions.push({
      type: 'additional_panels',
      title: 'Add More Panels',
      description: 'Your roof has space for 4-6 additional panels, which could increase total energy production by 20-30%.',
      priority: 'low',
      estimatedEfficiencyGain: 25,
      estimatedCost: 3500,
    });
  }

  // Maintenance suggestion
  if (Math.random() > 0.7) {
    suggestions.push({
      type: 'maintenance',
      title: 'System Maintenance',
      description: 'Professional inspection and maintenance can identify micro-inverter issues, wiring problems, and optimize overall system performance.',
      priority: 'medium',
      estimatedEfficiencyGain: 5,
      estimatedCost: 400,
    });
  }

  // Calculate potential efficiency
  const totalPossibleGain = suggestions.reduce((sum, s) => sum + s.estimatedEfficiencyGain, 0);
  const potentialEfficiency = Math.min(98, currentEfficiency + totalPossibleGain);

  // Sort suggestions by priority
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    currentPanelCount,
    currentPanelCountMax,
    estimatedSystemSizeKW: parseFloat(estimatedSystemSizeKW.toFixed(2)),
    estimatedSystemSizeKWMax: parseFloat(estimatedSystemSizeKWMax.toFixed(2)),
    currentEfficiency,
    orientation: orientations[Math.floor(Math.random() * orientations.length)],
    panelCondition: conditions[Math.floor(Math.random() * conditions.length)],
    roofAreaSqMeters: Math.floor(Math.random() * 80) + 70,
    shadingLevel,
    roofPitchDegrees: Math.floor(Math.random() * 20) + 25,
    complexity,
    usableAreaPercentage: Math.floor(Math.random() * 25) + 65,
    potentialEfficiency,
    estimatedAdditionalProduction: Math.floor((potentialEfficiency - currentEfficiency) * estimatedSystemSizeKW * 1200),
    suggestions,
  };
}
