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
  isHouse: boolean;
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

CRITICAL: Your first task is to determine if this image actually contains a residential or commercial building with a visible roof suitable for solar panels.

ANALYSIS REQUIREMENTS:
0. VALIDATION:
   - "isHouse": Set to true ONLY if the image clearly shows a building with a roof. If it's a random object, scenery without buildings, a person, or just a placeholder, set to false.

1. ROOF AREA CALCULATION - MOST IMPORTANT:
   - LOOK for reference objects: doors (2m height), windows (1-1.5m width), vehicles (4-5m length)
   - Count visible features and estimate roof dimensions in meters
   - Measure the roof length and width visually using these references
   - Calculate: Length (m) × Width (m) = Total Roof Area
   - Small bungalow roof: 60-90 m², Average home: 90-140 m², Large home: 140-200 m²
   - BE PRECISE: If the roof looks small, give a small number. If large, give a large number.

2. OBSTACLES & USABLE AREA:
   - **DETECT WINDOWS**: Count all roof windows/skylights and deduct their area (typical: 1-2 m² each)
   - **DETECT DOORS**: Roof access doors, hatches (deduct 2-4 m² each)
   - **DETECT CHIMNEYS**: Brick/metal chimneys (deduct 1-3 m² each + 1m clearance around)
   - **DETECT VENTS**: Roof vents, exhaust pipes (deduct 0.5-1 m² each)
   - **DETECT DORMERS**: Dormer windows (reduce usable area significantly)
   - Fire code setback: Deduct 0.9m (3 ft) from all roof edges
   - Calculate usable % = (Roof Area - All Obstacles - Setbacks) / Roof Area × 100

3. SHADING ANALYSIS:
   - **VISUALLY DETECT** tree shadows, neighboring building shadows on the roof
   - Count the percentage of roof covered by shadows
   - LOW: <10% shadowed, MEDIUM: 10-30%, HIGH: >30%

4. ROOF PITCH & ORIENTATION:
   - Estimate roof angle from edge profile (flat=0-10°, low=10-25°, typical=25-40°, steep=40-60°)
   - Determine which direction the roof faces (north/south/east/west)
   - PEI optimal tilt: 44° for south-facing

5. PANEL COUNT:
   - Calculate: (Usable Area ÷ 1.7m²) ÷ 1.2 = Panel Count
   - Each panel = 400W, 1.7m² with 20% spacing
   - Typical PEI residential: 12-20 panels

Return ONLY valid JSON (no markdown, no code blocks):
{
  "isHouse": <true|false>,
  "roofAreaSqMeters": <ACTUAL measured roof area 50-230>,
  "usableAreaPercentage": <ACTUAL % after deducting ALL obstacles, setbacks 40-90>,
  "shadingLevel": "<low|medium|high based on VISIBLE shadows>",
  "roofPitchDegrees": <ACTUAL estimated angle 5-60>,
  "complexity": "<simple|moderate|complex based on obstacles>",
  "orientation": "<ACTUAL roof direction: north|south|east|west|flat>",
  "obstacles": [<LIST ALL DETECTED: "chimney", "vent", "skylight", "window", "dormer", "tree shadow", "antenna">],
  "confidence": <0-100, higher for clear views with visible references>,
  "estimatedPanelCount": <CALCULATED from usable area 8-20>,
  "optimalTiltAngle": <44 for PEI south-facing, or adjusted>
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

  // If AI explicitly says it's not a house, stop here
  if (parsed.isHouse === false) {
    return {
      success: false,
      error: 'This image does not appear to be a residential or commercial building with a visible roof. Professional solar analysis requires a clear view of the architectural structure.',
    };
  }

  // Validate and sanitize the response
  const sanitized: AIRoofAnalysis = {
    isHouse: true, // We check for false above, so if we reach here it's highly likely true or it's a house
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
// EXISTING INSTALLATION ANALYSIS
// ============================================

const EXISTING_PANELS_ANALYSIS_PROMPT = `You are an expert solar installation analyst specializing in evaluating existing solar panel installations.

${PEI_SOLAR_CONTEXT}

TASK: Analyze this image of an EXISTING solar panel installation and provide detailed improvement recommendations.

CRITICAL: You must CAREFULLY COUNT EVERY SINGLE solar panel visible in this image. Count slowly and methodically.

ANALYSIS REQUIREMENTS:

1. PANEL COUNT & SYSTEM SIZE - MOST CRITICAL:
   - **CAREFULLY count EACH individual solar panel visible in the image**
   - Count panels on ALL roof sections and orientations
   - Look for panels that may be partially hidden or at different angles
   - DO NOT estimate - count each blue/black rectangular panel individually
   - DOUBLE CHECK your count before finalizing
   - Typical residential panels are blue or black rectangles in a grid pattern
   - Each panel is approximately 1.7m × 1m in size
   - Calculate system size: (Exact Panel Count × 400W) ÷ 1000 = kW
   - Example: 33 panels × 400W ÷ 1000 = 13.2 kW

2. CURRENT PLACEMENT ASSESSMENT:
   - Orientation: Which direction do panels face?
   - Tilt angle: Are panels at optimal 44° for PEI?
   - Spacing: Are panels properly spaced?
   - Coverage: Is usable roof area being maximized?

3. EFFICIENCY ANALYSIS:
   - Panel condition: Clean, dirty, damaged?
   - Shading issues: Trees, structures causing shadows?
   - Current estimated efficiency: 0-100%

4. IMPROVEMENT OPPORTUNITIES - BE SPECIFIC:
   - **Repositioning**: Can panels be moved to better orientation?
   - **Angle Adjustment**: Is tilt angle optimal?
   - **Cleaning**: Do panels appear dirty/covered in debris?
   - **Additional Panels**: Is there unused roof space?
   - **Tree Trimming**: Are trees causing shading?
   - **Maintenance**: Visible wiring issues, panel damage?

5. ROOF ANALYSIS (same as plan feature):
   - Total roof area in square meters
   - Usable area percentage
   - Shading level, pitch, complexity

Return ONLY valid JSON (no markdown, no code blocks):
{
  "currentPanelCount": <EXACT count of visible panels - count carefully! Typical range: 12-40>,
  "estimatedSystemSizeKW": <currentPanelCount × 0.4>,
  "currentEfficiency": <0-100, current performance %>,
  "potentialEfficiency": <0-100, potential after improvements>,
  "orientation": "<direction panels face>",
  "panelCondition": "<Good|Fair|Needs Cleaning|Minor Damage|Major Issues>",
  "roofAreaSqMeters": <total roof area>,
  "usableAreaPercentage": <% usable>,
  "shadingLevel": "<low|medium|high>",
  "roofPitchDegrees": <angle>,
  "complexity": "<simple|moderate|complex>",
  "estimatedAdditionalProduction": <kWh per year from improvements>,
  "suggestions": [
    {
      "type": "<repositioning|cleaning|additional_panels|tree_trimming|angle_adjustment|maintenance>",
      "title": "<short title>",
      "description": "<detailed recommendation>",
      "priority": "<high|medium|low>",
      "estimatedEfficiencyGain": <percentage points>,
      "estimatedCost": <CAD>
    }
  ],
  "confidence": <0-100>
}`;

export interface AIExistingPanelsAnalysis {
  currentPanelCount: number;
  estimatedSystemSizeKW: number;
  currentEfficiency: number;
  potentialEfficiency: number;
  orientation: string;
  panelCondition: string;
  roofAreaSqMeters: number;
  usableAreaPercentage: number;
  shadingLevel: 'low' | 'medium' | 'high';
  roofPitchDegrees: number;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedAdditionalProduction: number;
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedEfficiencyGain: number;
    estimatedCost?: number;
  }>;
  confidence: number;
}

export type AIExistingPanelsResult =
  | { success: true; data: AIExistingPanelsAnalysis }
  | { success: false; error: string };

async function tryAnalyzeExistingPanelsWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  base64Image: string,
  mimeType: string
): Promise<AIExistingPanelsResult> {
  const model = genAI.getGenerativeModel({ model: modelName });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const result = await Promise.race([
    model.generateContent([EXISTING_PANELS_ANALYSIS_PROMPT, imagePart]),
    createTimeoutPromise(REQUEST_TIMEOUT_MS),
  ]);

  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('AI response not valid JSON:', text);
    return {
      success: false,
      error: 'AI response was not valid JSON',
    };
  }

  const parsed: AIExistingPanelsAnalysis = JSON.parse(jsonMatch[0]);

  // Validate and sanitize
  const sanitized: AIExistingPanelsAnalysis = {
    currentPanelCount: Math.max(0, Math.min(100, parsed.currentPanelCount || 12)),
    estimatedSystemSizeKW: Math.max(0, Math.min(50, parsed.estimatedSystemSizeKW || 4.8)),
    currentEfficiency: Math.max(0, Math.min(100, parsed.currentEfficiency || 70)),
    potentialEfficiency: Math.max(0, Math.min(100, parsed.potentialEfficiency || 85)),
    orientation: parsed.orientation || 'South',
    panelCondition: parsed.panelCondition || 'Fair',
    roofAreaSqMeters: Math.max(50, Math.min(300, parsed.roofAreaSqMeters || 100)),
    usableAreaPercentage: Math.max(30, Math.min(95, parsed.usableAreaPercentage || 70)),
    shadingLevel: validateShadingLevel(parsed.shadingLevel),
    roofPitchDegrees: Math.max(5, Math.min(60, parsed.roofPitchDegrees || 30)),
    complexity: validateComplexity(parsed.complexity),
    estimatedAdditionalProduction: Math.max(0, parsed.estimatedAdditionalProduction || 500),
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
  };

  return {
    success: true,
    data: sanitized,
  };
}

/**
 * Analyze existing solar panel installation with AI
 */
export async function analyzeExistingPanelsWithAI(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<AIExistingPanelsResult> {
  if (!genAI1) {
    return {
      success: false,
      error: 'Gemini API key not configured (GOOGLE_AI_API_KEY_1)',
    };
  }

  const base64Image = imageBuffer.toString('base64');
  let lastError = '';

  for (const modelName of VISION_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI #1] Attempting existing panels analysis with ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);

        const result = await tryAnalyzeExistingPanelsWithModel(genAI1, modelName, base64Image, mimeType);

        if (result.success) {
          console.log(`[AI #1] Existing panels analysis success with ${modelName}`);
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[AI #1] ${modelName} attempt ${attempt} failed:`, lastError);

        if (lastError.includes('404') || lastError.includes('not found')) {
          console.log(`[AI #1] Model ${modelName} not found, trying next model...`);
          break;
        }

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
