import { RoofAnalysisResult, ShadingLevel } from '@/types/analysis';
import {
  analyzeRoofWithAI,
  convertToRoofAnalysisResult,
  isOpenAIAvailable,
  AIRoofAnalysis,
} from '@/lib/ai/openaiService';

/**
 * Analyze roof image from a buffer (for API routes)
 *
 * Uses OpenAI Vision API for analysis - NO FALLBACK TO MOCK DATA
 * All errors are surfaced to the user
 *
 * @param imageBuffer - Image as a Buffer
 * @param mimeType - MIME type of the image
 * @returns Promise<RoofAnalysisResult & { aiConfidence?: number; usedAI: boolean; aiAnalysis?: AIRoofAnalysis }>
 */
export async function analyzeRoofImageFromBuffer(
  imageBuffer: Buffer,
  mimeType: string
): Promise<RoofAnalysisResult & { aiConfidence?: number; usedAI: boolean; aiAnalysis?: AIRoofAnalysis }> {
  const { vision: aiAvailable } = isOpenAIAvailable();

  // Check if OpenAI is configured
  if (!aiAvailable) {
    throw new Error('OpenAI API is not configured. Please add OPENAI_IMAGE_API_KEY_1 to your environment variables.');
  }

  console.log('Starting OpenAI roof analysis...');

  // Call OpenAI API - no fallback
  const aiResult = await analyzeRoofWithAI(imageBuffer, mimeType);

  if (aiResult.success) {
    console.log('✓ OpenAI analysis successful, confidence:', aiResult.data.confidence);
    const roofResult = convertToRoofAnalysisResult(aiResult.data);
    return {
      ...roofResult,
      aiConfidence: aiResult.data.confidence,
      usedAI: true,
      aiAnalysis: aiResult.data, // Include full AI analysis with accuracy enhancements
    };
  } else {
    // Surface the error to the user - no fallback
    console.error('✗ OpenAI analysis failed:', aiResult.error);
    throw new Error(aiResult.error);
  }
}
