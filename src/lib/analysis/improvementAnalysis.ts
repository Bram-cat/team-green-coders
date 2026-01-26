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
 *
 * Uses OpenAI Vision API for analysis - NO FALLBACK TO MOCK DATA
 * All errors are surfaced to the user
 */
export async function analyzeExistingInstallation(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ExistingInstallationAnalysis> {
  const { vision: aiAvailable } = isOpenAIAvailable();

  // Check if OpenAI is configured
  if (!aiAvailable) {
    throw new Error('OpenAI API is not configured. Please add OPENAI_IMAGE_API_KEY_1 to your environment variables.');
  }

  console.log('Starting OpenAI improvement analysis...');

  // Call OpenAI API - no fallback
  const aiResult = await analyzeExistingPanelsWithAI(imageBuffer, mimeType);

  if (aiResult.success) {
    console.log('✓ OpenAI improvement analysis successful, confidence:', aiResult.data.confidence);

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
    // Surface the error to the user - no fallback
    console.error('✗ OpenAI improvement analysis failed:', aiResult.error);
    throw new Error(aiResult.error);
  }
}
