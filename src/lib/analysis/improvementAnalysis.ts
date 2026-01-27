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

/**
 * Analyze multiple images of existing installation for improved accuracy
 *
 * Processes 1-3 images and combines results similar to roof analysis
 */
export async function analyzeMultipleExistingInstallations(
  images: Array<{ buffer: Buffer; mimeType: string }>
): Promise<ExistingInstallationAnalysis & { imageCount: number }> {
  if (images.length === 0) {
    throw new Error('At least one image is required for analysis');
  }

  // Single image - use standard analysis
  if (images.length === 1) {
    const result = await analyzeExistingInstallation(images[0].buffer, images[0].mimeType);
    return { ...result, imageCount: 1 };
  }

  console.log(`Analyzing ${images.length} images of existing installation...`);

  // Process all images in parallel
  const analysisPromises = images.map((img, index) =>
    analyzeExistingInstallation(img.buffer, img.mimeType)
      .then(result => ({ ...result, index }))
      .catch(error => {
        console.warn(`Warning: Image ${index + 1} analysis failed:`, error.message);
        return null;
      })
  );

  const results = (await Promise.all(analysisPromises)).filter((r): r is NonNullable<typeof r> => r !== null);

  if (results.length === 0) {
    throw new Error('All image analyses failed. Please try different images.');
  }

  console.log(`✓ Successfully analyzed ${results.length}/${images.length} images`);

  // Use weighted averaging based on confidence
  const totalConfidence = results.reduce((sum, r) => sum + (r.aiConfidence || 50), 0);

  const weightedAverage = (getValue: (r: typeof results[0]) => number): number => {
    const weighted = results.reduce((sum, r) => {
      const confidence = r.aiConfidence || 50;
      const weight = confidence / totalConfidence;
      return sum + getValue(r) * weight;
    }, 0);
    return Math.round(weighted * 100) / 100;
  };

  // Combine panel counts - use maximum from all analyses for safety
  const maxPanelCount = Math.max(...results.map(r => r.currentPanelCount));
  const maxPanelCountMax = Math.max(...results.map(r => r.currentPanelCountMax));

  // Combine other metrics with weighted averaging
  const combinedRoofArea = weightedAverage(r => r.roofAreaSqMeters);
  const combinedPitch = weightedAverage(r => r.roofPitchDegrees);
  const combinedUsableArea = weightedAverage(r => r.usableAreaPercentage);
  const combinedCurrentEfficiency = weightedAverage(r => r.currentEfficiency);
  const combinedPotentialEfficiency = weightedAverage(r => r.potentialEfficiency);
  const combinedConfidence = Math.round(totalConfidence / results.length);

  // Use highest confidence result as primary
  const primaryResult = results.reduce((max, r) =>
    (r.aiConfidence || 0) > (max.aiConfidence || 0) ? r : max
  , results[0]);

  // Combine suggestions - merge unique suggestions from all analyses
  const allSuggestions = results.flatMap(r => r.suggestions);
  const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.title === suggestion.title)
  );

  console.log(`✓ Combined improvement analysis complete. Panel count: ${maxPanelCount}-${maxPanelCountMax}, Confidence: ${combinedConfidence}%`);

  return {
    currentPanelCount: maxPanelCount,
    currentPanelCountMax: maxPanelCountMax,
    estimatedSystemSizeKW: primaryResult.estimatedSystemSizeKW,
    estimatedSystemSizeKWMax: primaryResult.estimatedSystemSizeKWMax,
    currentEfficiency: combinedCurrentEfficiency,
    orientation: primaryResult.orientation,
    panelCondition: primaryResult.panelCondition,
    roofAreaSqMeters: combinedRoofArea,
    shadingLevel: primaryResult.shadingLevel,
    roofPitchDegrees: combinedPitch,
    complexity: primaryResult.complexity,
    usableAreaPercentage: combinedUsableArea,
    potentialEfficiency: combinedPotentialEfficiency,
    estimatedAdditionalProduction: primaryResult.estimatedAdditionalProduction,
    suggestions: uniqueSuggestions,
    aiConfidence: combinedConfidence,
    usedAI: true,
    imageCount: results.length,
  };
}
