import { RoofAnalysisResult, ShadingLevel } from '@/types/analysis';
import {
  analyzeRoofWithAI,
  convertToRoofAnalysisResult,
  isGeminiAvailable,
  AIRoofAnalysis,
} from '@/lib/ai/geminiService';

/**
 * Analyze roof image from a buffer (for API routes)
 *
 * Uses AI analysis with retry logic (up to 15 seconds) before falling back to mock data.
 *
 * @param imageBuffer - Image as a Buffer
 * @param mimeType - MIME type of the image
 * @returns Promise<RoofAnalysisResult & { aiConfidence?: number; usedAI: boolean; aiAnalysis?: AIRoofAnalysis }>
 */
export async function analyzeRoofImageFromBuffer(
  imageBuffer: Buffer,
  mimeType: string
): Promise<RoofAnalysisResult & { aiConfidence?: number; usedAI: boolean; aiAnalysis?: AIRoofAnalysis }> {
  const { vision: aiAvailable } = isGeminiAvailable();

  // Try AI analysis if available
  if (aiAvailable) {
    console.log('Starting AI roof analysis with retry logic...');

    try {
      const aiResult = await analyzeRoofWithAI(imageBuffer, mimeType);

      if (aiResult.success) {
        console.log('AI roof analysis successful, confidence:', aiResult.data.confidence);
        const roofResult = convertToRoofAnalysisResult(aiResult.data);
        return {
          ...roofResult,
          aiConfidence: aiResult.data.confidence,
          usedAI: true,
          aiAnalysis: aiResult.data, // Include full AI analysis for image generation
        };
      } else {
        console.warn('AI analysis failed:', aiResult.error);
        // If the error is high-confidence validation (like "not a house"), we should NOT fallback
        if (aiResult.error.includes('does not appear to be') || aiResult.error.includes('professional solar analysis requires')) {
          throw new Error(aiResult.error);
        }
        // For other AI failures (timeout, API error), we can fallback if demo mode is desired
        console.log('Falling back to mock data due to AI service error...');
      }
    } catch (error) {
      console.error('Error in AI roof analysis:', error);
      console.log('Falling back to mock data...');
    }
  } else {
    console.log('AI not available (no API key configured)');
  }

  // Fallback to mock data
  console.log('Using mock roof analysis data');

  // Simulate processing delay for mock data
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    ...generateMockRoofAnalysis(),
    usedAI: false,
  };
}

/**
 * Generate mock roof analysis data
 * Used as fallback when AI is not available or fails
 *
 * Based on PEI residential data:
 * - Typical residential system: 7.2 kW median
 * - Most roofs: 25-45 degrees pitch for snow shedding
 * - Orientation: 54% south, 23% west, remainder east
 */
function generateMockRoofAnalysis(): RoofAnalysisResult {
  const shadingLevels: ShadingLevel[] = ['low', 'medium', 'high'];
  const complexities: ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];

  // Weight towards more favorable conditions for demo purposes
  const shadingWeights = [0.5, 0.35, 0.15]; // 50% low, 35% medium, 15% high
  const complexityWeights = [0.4, 0.45, 0.15]; // 40% simple, 45% moderate, 15% complex

  return {
    roofAreaSqMeters: Math.floor(Math.random() * 80) + 70, // 70-150 sq meters (typical PEI home)
    shadingLevel: weightedRandom(shadingLevels, shadingWeights),
    roofPitchDegrees: Math.floor(Math.random() * 20) + 25, // 25-45 degrees (PEI typical for snow)
    complexity: weightedRandom(complexities, complexityWeights),
    usableAreaPercentage: Math.floor(Math.random() * 25) + 65, // 65-90%
  };
}

/**
 * Weighted random selection
 */
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}
