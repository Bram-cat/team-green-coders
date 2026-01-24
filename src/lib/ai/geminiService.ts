/**
 * Gemini AI Service for PEI Solar Panel Advisor
 *
 * Uses Google's Gemini AI for:
 * - Roof image analysis with deep JSON data understanding (AI Key #1)
 * - Panel placement image generation from multiple angles (AI Key #2)
 * - Financial summary generation
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

// Model names - using gemini-2.0-flash-exp as shown in the API dashboard
// Model names - prioritizing stable and requested models
const VISION_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
const TEXT_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash-exp'];
const IMAGE_GEN_MODELS = ['gemini-2.5-flash-preview-image', 'imagen-3.0-generate-001'];

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
  estimatedPanelCount: number;
  optimalTiltAngle: number;
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
CRITICAL PEI SOLAR DATA FOR ACCURATE CALCULATIONS:

LOCATION & CLIMATE:
- Prince Edward Island, Canada (latitude 46.25°N, longitude -63.13°W)
- Net Zero Target: 2040
- Photovoltaic Potential: ~1459 kWh/kWp (similar to Halifax, NS)
- Peak sun hours per day: 4.0 hours average
- Optimal panel tilt: 44° (= latitude for maximum annual production)
- Panel orientation statistics: 54% south-facing, 23% west, remainder east

ELECTRICITY & RATES:
- Utility: Maritime Electric (regulated by IRAC)
- Residential electricity rate: $0.174/kWh CAD (17.4 cents)
- Per capita consumption: 14.2 MWh/year
- Net metering limit: 100 kW capacity

SYSTEM SPECIFICATIONS:
- Typical residential system: 7.2 kW median (range 4-11 kW)
- Module efficiency: 21% standard
- Typical panel: 400W nameplate, ~1.7 m² area (~17.55 sq ft)
- Inverter loading ratio: 1.25
- Performance degradation: 0.5-1% per year

FINANCIAL DATA:
- Installation cost: $3.50/W cash, $4.70/W financed
- Canada Greener Homes: Up to $5,000 grant + $40,000 interest-free loan
- Payback period typical: 10-15 years
- 25-year ROI: Significant positive returns

CLIMATE FACTORS:
- Cold winter temperatures IMPROVE efficiency by 2-3%
- Snow accumulation reduces production temporarily
- Peak demand: Cold winter evenings
- Fire code setback: 3 ft (0.9 m) from roof edges required

CALCULATION FORMULAS:
- Annual Production (kWh) = System Size (kW) × PV Potential (1459 kWh/kWp) × Shading Factor × Tilt Factor
- Panel Count = System Size (kW) × 1000 / Panel Wattage (400W)
- Required Roof Area = Panel Count × 1.7 m² × 1.2 (spacing factor)
- Annual Savings = Production (kWh) × $0.174/kWh
- Payback = Net Cost / Annual Savings
`;

// ============================================
// ROOF IMAGE ANALYSIS (Gemini Vision)
// ============================================

const ROOF_ANALYSIS_PROMPT = `You are an expert solar installation analyst with deep knowledge of PEI solar data and calculations.

${PEI_SOLAR_CONTEXT}

TASK: Analyze this roof image and provide HIGHLY ACCURATE estimates based on the PEI solar data above.

ANALYSIS REQUIREMENTS:
1. Roof Area: Estimate based on typical PEI homes:
   - 1200-1500 sq ft house = ~110-140 m² roof
   - 1500-2000 sq ft house = ~140-190 m² roof
   - 2000-2500 sq ft house = ~190-230 m² roof

2. Usable Area: Calculate realistic usable percentage:
   - Deduct 3 ft (0.9m) setback from all edges (fire code)
   - Deduct area for obstacles (chimneys, vents, skylights)
   - Deduct heavily shaded areas
   - Typical result: 60-85% usable

3. Shading Analysis:
   - LOW: Minimal trees, south exposure, <10% shading
   - MEDIUM: Some trees/buildings, 10-30% shading
   - HIGH: Significant obstructions, >30% shading

4. Optimal Tilt Calculation:
   - For PEI (46°N): Optimal is 44°
   - If roof pitch < 25° or > 50°, note suboptimal production
   - Flat roofs: Recommend tilt-up racking at 44°

5. Panel Count Estimation:
   - Calculate: (Usable Area m² / 1.7 m²) / 1.2 (spacing)
   - Or: (System Size kW × 1000 / 400W)
   - Cross-check both methods

Return ONLY valid JSON (no markdown, no code blocks):
{
  "roofAreaSqMeters": <total roof area 70-230>,
  "usableAreaPercentage": <realistic % after setbacks 60-90>,
  "shadingLevel": "<low|medium|high>",
  "roofPitchDegrees": <angle 15-50>,
  "complexity": "<simple|moderate|complex>",
  "orientation": "<north|south|east|west|flat>",
  "obstacles": [<"chimney"|"vent"|"skylight"|"dormer"|"tree shadow"|"antenna">],
  "confidence": <0-100, higher for clear aerial views>,
  "estimatedPanelCount": <calculated panel count>,
  "optimalTiltAngle": <44 for PEI, or adjusted if roof pitch dictates>
}`;

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

  const response = result.response;
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
    estimatedPanelCount: Math.max(5, Math.min(50, parsed.estimatedPanelCount || 18)),
    optimalTiltAngle: Math.max(20, Math.min(60, parsed.optimalTiltAngle || 44)),
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
        console.log(`[AI #1] Attempting roof analysis with ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);

        const result = await tryAnalyzeWithModel(genAI1, modelName, base64Image, mimeType);

        if (result.success) {
          console.log(`[AI #1] Success with model ${modelName}, confidence: ${result.data.confidence}%`);
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[AI #1] ${modelName} attempt ${attempt} failed:`, lastError);

        // If it's a 404, try next model immediately
        if (lastError.includes('404') || lastError.includes('not found') || lastError.includes('NotFound')) {
          console.log(`[AI #1] Model ${modelName} not found, trying next model...`);
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
  systemSizeKW: number,
  coordinates: { lat: number; lon: number }
) => `You are a friendly, knowledgeable solar energy advisor specializing in Prince Edward Island, Canada.

${PEI_SOLAR_CONTEXT}

PROPERTY LOCATION:
- Coordinates: ${coordinates.lat.toFixed(4)}°N, ${Math.abs(coordinates.lon).toFixed(4)}°W
- Solar irradiance zone: Maritime Canada (similar to Halifax)

ROOF ANALYSIS RESULTS:
- Total roof area: ${roofData.roofAreaSqMeters} m²
- Usable area: ${roofData.usableAreaPercentage}% (${Math.round(roofData.roofAreaSqMeters * roofData.usableAreaPercentage / 100)} m²)
- Shading level: ${roofData.shadingLevel}
- Roof pitch: ${roofData.roofPitchDegrees}° ${roofData.roofPitchDegrees >= 40 && roofData.roofPitchDegrees <= 48 ? '(excellent for PEI!)' : ''}
- Complexity: ${roofData.complexity}

RECOMMENDED SOLAR SYSTEM:
- System size: ${systemSizeKW} kW (${Math.round(systemSizeKW / 0.4)} × 400W panels)
- Estimated annual production: ${financials.firstYearProduction.toLocaleString()} kWh/year
- Installation cost: $${financials.estimatedSystemCost.toLocaleString()} CAD
- Annual electricity savings: $${financials.annualElectricitySavings.toLocaleString()} CAD
- Simple payback period: ${financials.simplePaybackYears} years
- 25-year net savings: $${financials.twentyFiveYearSavings.toLocaleString()} CAD
- Annual CO₂ offset: ${financials.annualCO2OffsetKg.toLocaleString()} kg

PEI-SPECIFIC BENEFITS:
- Maritime Electric rate: $0.174/kWh (middle of pack in Atlantic Canada)
- Canada Greener Homes: Up to $5,000 grant + $40,000 interest-free loan available
- Net metering: Full retail credit for excess generation (up to 100kW)
- Cold climate advantage: Winter temperatures boost panel efficiency 2-3%
- System cost: $${(financials.estimatedSystemCost / (systemSizeKW * 1000)).toFixed(2)}/W

Write a persuasive, investment-focused summary for this homeowner. Treat this as a high-value financial opportunity.
Focus on:
1. **Wealth Creation**: Frame the $${financials.twentyFiveYearSavings.toLocaleString()} as "wealth generated" or "tax-free income".
2. **ROI**: Compare the ${financials.returnOnInvestment.toFixed(0)}% ROI favorably against traditional investments like GICs or mutual funds.
3. **Immediate Cash Flow**: If monthly savings cover the loan payments, highlight "day-one positive cash flow".
4. **Energy Independence**: Mention protection against rising Maritime Electric rates (inflation hedge).

Tone: Professional, enthusiastic, authoritative, financial advisor style. Avoid hesitation. Use strong verbs.
Keep it under 120 words.Structure it as a compelling argument for going solar now.`;

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

  const response = result.response;
  return response.text().trim();
}

/**
 * Generate a personalized AI summary of the financial analysis
 *
 * @param financials - The calculated financial data
 * @param roofData - The roof analysis results
 * @param systemSizeKW - The recommended system size
 * @param coordinates - The geocoded location coordinates
 * @returns Promise<string> - AI-generated summary
 */
export async function generateFinancialSummary(
  financials: FinancialAnalysis,
  roofData: RoofAnalysisResult,
  systemSizeKW: number,
  coordinates: { lat: number; lon: number } = { lat: 46.25, lon: -63.13 }
): Promise<string> {
  if (!genAI2) {
    return generateTemplateSummary(financials, roofData, systemSizeKW);
  }

  const prompt = FINANCIAL_SUMMARY_PROMPT_TEMPLATE(roofData, financials, systemSizeKW, coordinates);
  let lastError = '';

  // Try each model with retries
  for (const modelName of TEXT_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI #2] Attempting summary with ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);

        const summary = await tryGenerateSummaryWithModel(genAI2, modelName, prompt);

        if (summary) {
          console.log(`[AI #2] Summary generated with ${modelName}`);
          return summary;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[AI #2] ${modelName} summary attempt ${attempt} failed:`, lastError);

        // If it's a 404, try next model immediately
        if (lastError.includes('404') || lastError.includes('not found')) {
          console.log(`[AI #2] Model ${modelName} not found, trying next model...`);
          break;
        }

        // For other errors, wait before retrying
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }
  }

  console.log('[AI #2] All summary attempts failed, using template');
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
    roofData.shadingLevel === 'medium' ? 'good' : 'fair';

  const panelCount = Math.round(systemSizeKW / 0.4);

  const paybackQuality = financials.simplePaybackYears <= 10 ? 'outstanding' :
    financials.simplePaybackYears <= 13 ? 'strong' : 'moderate';

  return `Your PEI property shows ${quality} solar potential with ${roofData.usableAreaPercentage}% usable roof area. A ${systemSizeKW} kW system (${panelCount} × 400W panels) could save you approximately $${financials.annualElectricitySavings.toLocaleString()} annually at Maritime Electric's current rates, with a ${paybackQuality} payback period of ${financials.simplePaybackYears} years. Over 25 years, you could save up to $${financials.twentyFiveYearSavings.toLocaleString()}, and PEI's cold winters will actually boost your panel efficiency by 2-3%. Consider applying for the Canada Greener Homes grant (up to $5,000) to further reduce your upfront costs!`;
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
export function isGeminiAvailable(): { vision: boolean; text: boolean; imageGen: boolean } {
  return {
    vision: !!genAI1,
    text: !!genAI2,
    imageGen: !!genAI2,
  };
}
