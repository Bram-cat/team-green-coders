/**
 * Gemini AI Service for PEI Solar Panel Advisor
 *
 * Uses Google's Gemini AI for:
 * - Roof image analysis (vision)
 * - Financial summary generation (text)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { RoofAnalysisResult, ShadingLevel } from '@/types/analysis';
import { FinancialAnalysis } from '@/lib/calculations/financialCalculations';

// Initialize Gemini clients
const genAI1 = process.env.GOOGLE_AI_API_KEY_1
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY_1)
  : null;

const genAI2 = process.env.GOOGLE_AI_API_KEY_2
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY_2)
  : null;

// ============================================
// TYPES
// ============================================

export interface AIRoofAnalysis {
  roofAreaSqMeters: number;
  usableAreaPercentage: number;
  shadingLevel: 'low' | 'medium' | 'high';
  roofPitchDegrees: number;
  complexity: 'simple' | 'moderate' | 'complex';
  orientation: 'north' | 'south' | 'east' | 'west' | 'flat';
  obstacles: string[];
  confidence: number;
}

export interface AIAnalysisError {
  success: false;
  error: string;
}

export interface AIAnalysisSuccess {
  success: true;
  data: AIRoofAnalysis;
}

export type AIAnalysisResult = AIAnalysisSuccess | AIAnalysisError;

// ============================================
// ROOF IMAGE ANALYSIS (Gemini Vision)
// ============================================

const ROOF_ANALYSIS_PROMPT = `Analyze this roof image for solar panel installation potential. Extract the following information and return it as valid JSON only (no markdown, no code blocks, just pure JSON):

{
  "roofAreaSqMeters": <estimated total roof area in square meters, number between 50-300>,
  "usableAreaPercentage": <percentage of roof suitable for panels 0-100, considering obstacles and edges>,
  "shadingLevel": "<one of: low, medium, high - based on visible trees, buildings, or shadows>",
  "roofPitchDegrees": <estimated roof angle in degrees, typically 15-45>,
  "complexity": "<one of: simple, moderate, complex - based on roof shape and obstacles>",
  "orientation": "<one of: north, south, east, west, flat - primary roof direction>",
  "obstacles": [<array of strings listing visible obstacles like "chimney", "vent", "skylight", "dormer">],
  "confidence": <your confidence in this analysis 0-100>
}

Important context:
- This property is in Prince Edward Island, Canada (latitude 46°N)
- Optimal orientation for solar is SOUTH-facing
- Optimal tilt angle is approximately 44 degrees
- If you cannot clearly see the roof, make reasonable estimates based on typical residential homes

Return ONLY the JSON object, no explanation or markdown formatting.`;

/**
 * Analyze a roof image using Gemini Vision AI
 *
 * @param imageBuffer - The image file as a Buffer
 * @param mimeType - The MIME type of the image (image/jpeg or image/png)
 * @returns Promise<AIAnalysisResult>
 */
export async function analyzeRoofWithAI(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<AIAnalysisResult> {
  if (!genAI1) {
    return {
      success: false,
      error: 'Gemini API key not configured (GOOGLE_AI_API_KEY_1)',
    };
  }

  try {
    const model = genAI1.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Create the image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    // Generate content with image
    const result = await model.generateContent([ROOF_ANALYSIS_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI response not valid JSON:', text);
      return {
        success: false,
        error: 'AI response was not valid JSON',
      };
    }

    const parsed: AIRoofAnalysis = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the response
    const sanitized: AIRoofAnalysis = {
      roofAreaSqMeters: Math.max(50, Math.min(300, parsed.roofAreaSqMeters || 100)),
      usableAreaPercentage: Math.max(30, Math.min(95, parsed.usableAreaPercentage || 70)),
      shadingLevel: validateShadingLevel(parsed.shadingLevel),
      roofPitchDegrees: Math.max(5, Math.min(60, parsed.roofPitchDegrees || 30)),
      complexity: validateComplexity(parsed.complexity),
      orientation: validateOrientation(parsed.orientation),
      obstacles: Array.isArray(parsed.obstacles) ? parsed.obstacles : [],
      confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
    };

    return {
      success: true,
      data: sanitized,
    };
  } catch (error) {
    console.error('Gemini AI analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI error',
    };
  }
}

// ============================================
// FINANCIAL SUMMARY GENERATION
// ============================================

/**
 * Generate a personalized AI summary of the financial analysis
 *
 * @param financials - The calculated financial data
 * @param roofData - The roof analysis results
 * @param systemSizeKW - The recommended system size
 * @returns Promise<string> - AI-generated summary
 */
export async function generateFinancialSummary(
  financials: FinancialAnalysis,
  roofData: RoofAnalysisResult,
  systemSizeKW: number
): Promise<string> {
  if (!genAI2) {
    // Return a template-based summary if API not available
    return generateTemplateSummary(financials, roofData, systemSizeKW);
  }

  try {
    const model = genAI2.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a friendly solar energy advisor for Prince Edward Island, Canada. Based on the following analysis, write a 2-3 sentence personalized summary for the homeowner. Be encouraging but realistic.

Property Analysis:
- Roof area: ${roofData.roofAreaSqMeters} m²
- Usable area: ${roofData.usableAreaPercentage}%
- Shading: ${roofData.shadingLevel}
- Roof pitch: ${roofData.roofPitchDegrees}°
- Complexity: ${roofData.complexity}

Recommended System:
- Size: ${systemSizeKW} kW
- Estimated cost: $${financials.estimatedSystemCost.toLocaleString()}
- Annual savings: $${financials.annualElectricitySavings.toLocaleString()}
- Payback period: ${financials.simplePaybackYears} years
- 25-year savings: $${financials.twentyFiveYearSavings.toLocaleString()}

Write a brief, personalized summary. Focus on the positive aspects while being honest about any limitations. Mention Maritime Electric rates and PEI-specific benefits like cold weather efficiency. Keep it under 100 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini summary generation error:', error);
    return generateTemplateSummary(financials, roofData, systemSizeKW);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function validateShadingLevel(level: string): ShadingLevel {
  const valid: ShadingLevel[] = ['low', 'medium', 'high'];
  return valid.includes(level as ShadingLevel) ? (level as ShadingLevel) : 'medium';
}

function validateComplexity(complexity: string): 'simple' | 'moderate' | 'complex' {
  const valid = ['simple', 'moderate', 'complex'];
  return valid.includes(complexity) ? (complexity as 'simple' | 'moderate' | 'complex') : 'moderate';
}

function validateOrientation(orientation: string): 'north' | 'south' | 'east' | 'west' | 'flat' {
  const valid = ['north', 'south', 'east', 'west', 'flat'];
  return valid.includes(orientation) ? (orientation as 'north' | 'south' | 'east' | 'west' | 'flat') : 'south';
}

function generateTemplateSummary(
  financials: FinancialAnalysis,
  roofData: RoofAnalysisResult,
  systemSizeKW: number
): string {
  const quality = roofData.shadingLevel === 'low' ? 'excellent' :
                  roofData.shadingLevel === 'medium' ? 'good' : 'moderate';

  return `Your PEI property shows ${quality} solar potential. A ${systemSizeKW} kW system could save you approximately $${financials.annualElectricitySavings.toLocaleString()} annually at current Maritime Electric rates, with a payback period of about ${financials.simplePaybackYears} years. Over 25 years, you could save up to $${financials.twentyFiveYearSavings.toLocaleString()}, and PEI's cold winters actually boost panel efficiency by 2-3%.`;
}

/**
 * Convert AI analysis result to RoofAnalysisResult type
 */
export function convertToRoofAnalysisResult(aiData: AIRoofAnalysis): RoofAnalysisResult {
  return {
    roofAreaSqMeters: Math.round(aiData.roofAreaSqMeters),
    shadingLevel: aiData.shadingLevel,
    roofPitchDegrees: Math.round(aiData.roofPitchDegrees),
    complexity: aiData.complexity,
    usableAreaPercentage: Math.round(aiData.usableAreaPercentage),
  };
}

/**
 * Check if Gemini AI is available
 */
export function isGeminiAvailable(): { vision: boolean; text: boolean } {
  return {
    vision: !!genAI1,
    text: !!genAI2,
  };
}
