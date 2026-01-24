/**
 * Gemini AI Service for PEI Solar Panel Advisor
 *
 * Uses Google's Gemini AI for:
 * - Roof image analysis (vision)
 * - Financial summary generation (text)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { RoofAnalysisResult, ShadingLevel } from '@/types/analysis';
import { FinancialAnalysis } from '@/lib/calculations/financialCalculations';

// Initialize Gemini clients
const genAI1 = process.env.GOOGLE_AI_API_KEY_1
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY_1)
  : null;

const genAI2 = process.env.GOOGLE_AI_API_KEY_2
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY_2)
  : null;

// Model names to try in order (newest to older)
const VISION_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
const TEXT_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds

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
// PEI SOLAR DATA CONTEXT (from information.json & calculation.json)
// ============================================

const PEI_SOLAR_CONTEXT = `
IMPORTANT PEI SOLAR CONTEXT:
- Location: Prince Edward Island, Canada (latitude ~46°N)
- Net Zero Target: 2040
- Current solar capacity: 31 MW across PEI
- Utility: Maritime Electric (regulated by IRAC)
- Electricity rate: 17.4 cents/kWh (CAD)
- Per capita consumption: 14.2 MWh/year
- Net metering capacity limit: 100 kW
- Optimal panel orientation: SOUTH-facing at ~44° tilt
- Typical residential system size: 7.2 kW median
- Module efficiency standard: 21%
- Panel orientation statistics: 54% south, 23% west, remainder east
- PEI weather considerations:
  * Cold winter temperatures improve panel efficiency by 2-3%
  * Snow accumulation may temporarily reduce production
  * Peak demand occurs on cold winter evenings
- Photovoltaic potential reference: Halifax, NS = 1459 kWh/kWp (PEI similar)
`;

// ============================================
// ROOF IMAGE ANALYSIS (Gemini Vision)
// ============================================

const ROOF_ANALYSIS_PROMPT = `You are an expert solar installation analyst. Analyze this roof image for solar panel installation potential in Prince Edward Island, Canada.

${PEI_SOLAR_CONTEXT}

Based on the image, extract the following information and return it as valid JSON only (no markdown, no code blocks, just pure JSON):

{
  "roofAreaSqMeters": <estimated total roof area in square meters, typical residential 70-150 m²>,
  "usableAreaPercentage": <percentage of roof suitable for panels 0-100, considering obstacles, edges, setbacks>,
  "shadingLevel": "<one of: low, medium, high - based on visible trees, buildings, or shadows>",
  "roofPitchDegrees": <estimated roof angle in degrees, PEI typical 25-45 degrees>,
  "complexity": "<one of: simple, moderate, complex - based on roof shape, dormers, multiple levels>",
  "orientation": "<one of: north, south, east, west, flat - primary roof direction facing sun>",
  "obstacles": [<array of strings: "chimney", "vent", "skylight", "dormer", "antenna", etc.>],
  "confidence": <your confidence in this analysis 0-100, higher if clear aerial/satellite view>
}

ANALYSIS GUIDELINES:
1. For roof area: Estimate based on typical PEI homes (1200-2500 sq ft houses = ~110-230 m² roof)
2. For usable area: Deduct for setbacks (fire code requires 3ft edges), obstacles, shading
3. For shading: Look for tree shadows, neighboring buildings, chimney shadows
4. For pitch: Most PEI roofs are 25-45 degrees for snow shedding
5. South-facing sections are most valuable (optimal for 46°N latitude)

Return ONLY the JSON object, no explanation or markdown formatting.`;

/**
 * Create a promise that rejects after a timeout
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
}

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Try to analyze roof with a specific model
 */
async function tryAnalyzeWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  base64Image: string,
  mimeType: string
): Promise<AIAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: modelName });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  // Race between the API call and timeout
  const result = await Promise.race([
    model.generateContent([ROOF_ANALYSIS_PROMPT, imagePart]),
    createTimeoutPromise(REQUEST_TIMEOUT_MS),
  ]);

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
}

/**
 * Analyze a roof image using Gemini Vision AI with retry logic
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

  const base64Image = imageBuffer.toString('base64');
  let lastError = '';

  // Try each model with retries
  for (const modelName of VISION_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempting roof analysis with ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);

        const result = await tryAnalyzeWithModel(genAI1, modelName, base64Image, mimeType);

        if (result.success) {
          console.log(`Success with model ${modelName}`);
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`${modelName} attempt ${attempt} failed:`, lastError);

        // If it's a 404, try next model immediately
        if (lastError.includes('404') || lastError.includes('not found')) {
          console.log(`Model ${modelName} not found, trying next model...`);
          break;
        }

        // For other errors, wait before retrying
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }
  }

  return {
    success: false,
    error: `All AI attempts failed. Last error: ${lastError}`,
  };
}

// ============================================
// FINANCIAL SUMMARY GENERATION
// ============================================

const FINANCIAL_SUMMARY_PROMPT_TEMPLATE = (
  roofData: RoofAnalysisResult,
  financials: FinancialAnalysis,
  systemSizeKW: number
) => `You are a friendly, knowledgeable solar energy advisor specializing in Prince Edward Island, Canada.

${PEI_SOLAR_CONTEXT}

PROPERTY ANALYSIS RESULTS:
- Roof area: ${roofData.roofAreaSqMeters} m²
- Usable area: ${roofData.usableAreaPercentage}%
- Shading level: ${roofData.shadingLevel}
- Roof pitch: ${roofData.roofPitchDegrees}°
- Complexity: ${roofData.complexity}

RECOMMENDED SOLAR SYSTEM:
- System size: ${systemSizeKW} kW (${Math.round(systemSizeKW / 0.4)} panels at 400W each)
- Estimated installation cost: $${financials.estimatedSystemCost.toLocaleString()} CAD
- Annual electricity savings: $${financials.annualElectricitySavings.toLocaleString()} CAD
- Simple payback period: ${financials.simplePaybackYears} years
- 25-year net savings: $${financials.twentyFiveYearSavings.toLocaleString()} CAD
- Annual CO₂ offset: ${financials.annualCO2OffsetKg} kg

FINANCIAL CONTEXT:
- Maritime Electric rate: $0.174/kWh
- Canada Greener Homes: Up to $5,000 grant + $40,000 interest-free loan available
- Net metering: Full retail credit for excess generation up to 100kW
- System cost range: $3.00-$4.70/W depending on financing

Write a personalized 2-3 sentence summary for this homeowner. Be encouraging but realistic. Mention:
1. The property's solar potential quality
2. Key financial benefit (annual savings or payback period)
3. One PEI-specific advantage (cold weather efficiency, Maritime Electric rates, or incentives)

Keep it under 80 words, conversational, and actionable.`;

/**
 * Try to generate summary with a specific model
 */
async function tryGenerateSummaryWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string
): Promise<string | null> {
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await Promise.race([
    model.generateContent(prompt),
    createTimeoutPromise(REQUEST_TIMEOUT_MS),
  ]);

  const response = await result.response;
  return response.text().trim();
}

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
    return generateTemplateSummary(financials, roofData, systemSizeKW);
  }

  const prompt = FINANCIAL_SUMMARY_PROMPT_TEMPLATE(roofData, financials, systemSizeKW);
  let lastError = '';

  // Try each model with retries
  for (const modelName of TEXT_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempting summary generation with ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);

        const summary = await tryGenerateSummaryWithModel(genAI2, modelName, prompt);

        if (summary) {
          console.log(`Summary generated successfully with ${modelName}`);
          return summary;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`${modelName} summary attempt ${attempt} failed:`, lastError);

        // If it's a 404, try next model immediately
        if (lastError.includes('404') || lastError.includes('not found')) {
          console.log(`Model ${modelName} not found, trying next model...`);
          break;
        }

        // For other errors, wait before retrying
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }
  }

  console.log('All AI summary attempts failed, using template');
  return generateTemplateSummary(financials, roofData, systemSizeKW);
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

  const panelCount = Math.round(systemSizeKW / 0.4);

  return `Your PEI property shows ${quality} solar potential with ${roofData.usableAreaPercentage}% usable roof area. A ${systemSizeKW} kW system (${panelCount} panels) could save you approximately $${financials.annualElectricitySavings.toLocaleString()} annually at current Maritime Electric rates, paying for itself in about ${financials.simplePaybackYears} years. Over 25 years, you could save up to $${financials.twentyFiveYearSavings.toLocaleString()}, plus PEI's cold winters actually boost panel efficiency by 2-3%.`;
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
