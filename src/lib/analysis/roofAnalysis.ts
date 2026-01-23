import { RoofAnalysisResult, ShadingLevel } from '@/types/analysis';

/**
 * Analyzes a roof image to extract solar installation parameters.
 *
 * TODO: Replace this stub with actual ML model integration:
 * - Option 1: Call external ML API (e.g., Google Cloud Vision, custom model)
 * - Option 2: Use TensorFlow.js for client-side inference
 * - Option 3: Integrate with specialized roof analysis service
 *
 * @param imagePath - Path to the uploaded roof image
 * @returns Promise<RoofAnalysisResult> - Analysis results
 */
export async function analyzeRoofImage(imagePath: string): Promise<RoofAnalysisResult> {
  // TODO: Implement actual image analysis
  // const response = await fetch(process.env.ML_MODEL_ENDPOINT, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.ML_MODEL_API_KEY}` },
  //   body: imageData
  // });

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response based on randomized but realistic values
  const shadingLevels: ShadingLevel[] = ['low', 'medium', 'high'];
  const complexities: ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];

  const mockResults: RoofAnalysisResult = {
    roofAreaSqMeters: Math.floor(Math.random() * 100) + 50, // 50-150 sq meters
    shadingLevel: shadingLevels[Math.floor(Math.random() * 3)],
    roofPitchDegrees: Math.floor(Math.random() * 30) + 15, // 15-45 degrees
    complexity: complexities[Math.floor(Math.random() * 3)],
    usableAreaPercentage: Math.floor(Math.random() * 30) + 60, // 60-90%
  };

  return mockResults;
}
