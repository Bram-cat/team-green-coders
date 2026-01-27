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

/**
 * Analyze multiple roof images and combine results for improved accuracy
 *
 * Processes 1-3 images and intelligently combines the results:
 * - Uses weighted averaging based on confidence scores
 * - Prioritizes higher confidence results
 * - Combines insights from multiple angles
 *
 * @param images - Array of { buffer: Buffer, mimeType: string }
 * @returns Promise<RoofAnalysisResult & metadata>
 */
export async function analyzeMultipleRoofImages(
  images: Array<{ buffer: Buffer; mimeType: string }>
): Promise<RoofAnalysisResult & { aiConfidence?: number; usedAI: boolean; aiAnalysis?: AIRoofAnalysis; imageCount: number }> {
  if (images.length === 0) {
    throw new Error('At least one image is required for analysis');
  }

  // Single image - use standard analysis
  if (images.length === 1) {
    const result = await analyzeRoofImageFromBuffer(images[0].buffer, images[0].mimeType);
    return { ...result, imageCount: 1 };
  }

  console.log(`Analyzing ${images.length} images for improved accuracy...`);

  // Process all images in parallel
  const analysisPromises = images.map((img, index) =>
    analyzeRoofImageFromBuffer(img.buffer, img.mimeType)
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

  // Calculate weighted averages based on confidence scores
  const totalConfidence = results.reduce((sum, r) => sum + (r.aiConfidence || 50), 0);

  const weightedAverage = (getValue: (r: typeof results[0]) => number): number => {
    const weighted = results.reduce((sum, r) => {
      const confidence = r.aiConfidence || 50;
      const weight = confidence / totalConfidence;
      return sum + getValue(r) * weight;
    }, 0);
    return Math.round(weighted * 100) / 100; // Round to 2 decimals
  };

  // Combine results with weighted averaging
  const combinedRoofArea = weightedAverage(r => r.roofAreaSqMeters);
  const combinedPitch = weightedAverage(r => r.roofPitchDegrees);
  const combinedUsableArea = weightedAverage(r => r.usableAreaPercentage);
  const combinedConfidence = Math.round(totalConfidence / results.length);

  // For shading level, take the most conservative (worst case)
  const shadingLevels: ShadingLevel[] = ['low', 'medium', 'high'];
  const maxShadingIndex = Math.max(...results.map(r => shadingLevels.indexOf(r.shadingLevel)));
  const combinedShading = shadingLevels[maxShadingIndex];

  // For complexity, take the average and round
  const complexityLevels: ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];
  const avgComplexityIndex = Math.round(
    results.reduce((sum, r) => sum + complexityLevels.indexOf(r.complexity), 0) / results.length
  );
  const combinedComplexity = complexityLevels[avgComplexityIndex];

  // Use the highest confidence analysis as the primary source for AI analysis data
  const primaryResult = results.reduce((max, r) =>
    (r.aiConfidence || 0) > (max.aiConfidence || 0) ? r : max
  , results[0]);

  console.log(`✓ Combined analysis complete. Roof area: ${combinedRoofArea}m², Confidence: ${combinedConfidence}%`);

  return {
    roofAreaSqMeters: combinedRoofArea,
    shadingLevel: combinedShading,
    roofPitchDegrees: combinedPitch,
    complexity: combinedComplexity,
    usableAreaPercentage: combinedUsableArea,
    aiConfidence: combinedConfidence,
    usedAI: true,
    aiAnalysis: primaryResult.aiAnalysis, // Contains orientation and all accuracy data
    imageCount: results.length,
  };
}
