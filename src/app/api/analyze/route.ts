import { NextRequest, NextResponse } from 'next/server';
import { analyzeRoofImageFromBuffer } from '@/lib/analysis/roofAnalysis';
import { getLocationSolarPotential } from '@/lib/analysis/solarPotential';
import { calculateRecommendation } from '@/lib/utils/scoreCalculation';
import { generateFinancialSummary, convertToRoofAnalysisResult } from '@/lib/ai/geminiService';
import { generateSolarPanelImagePrompts } from '@/lib/services/imageGenerationService';
import { Address } from '@/types/address';
import { AnalyzeAPIResponse } from '@/types/api';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeAPIResponse>> {
  try {
    const formData = await request.formData();

    // Extract and validate image
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IMAGE', message: 'Please upload a roof image.' } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Please upload a JPEG or PNG image.' } },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: 'Image must be under 10MB.' } },
        { status: 400 }
      );
    }

    // Extract and validate address and monthly bill
    const address: Address = {
      street: formData.get('street') as string || '',
      city: formData.get('city') as string || '',
      postalCode: formData.get('postalCode') as string || '',
      country: formData.get('country') as string || '',
    };

    // Extract monthly bill
    const monthlyBillStr = formData.get('monthlyBill') as string | null;
    const monthlyBill = monthlyBillStr ? parseFloat(monthlyBillStr) : undefined;

    if (!address.street || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json(
        { success: false, error: { code: 'INCOMPLETE_ADDRESS', message: 'Please fill in all address fields.' } },
        { status: 400 }
      );
    }

    // Convert image to buffer (no file system needed - works on serverless)
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert image to base64 for client-side visualization
    const imageBase64 = buffer.toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Run analysis (parallel execution for performance)
    const [roofAnalysisResult, solarPotentialResult] = await Promise.all([
      analyzeRoofImageFromBuffer(buffer, image.type),
      getLocationSolarPotential(address),
    ]);

    // Extract base roof analysis (without extra metadata)
    const roofAnalysis = {
      roofAreaSqMeters: roofAnalysisResult.roofAreaSqMeters,
      shadingLevel: roofAnalysisResult.shadingLevel,
      roofPitchDegrees: roofAnalysisResult.roofPitchDegrees,
      complexity: roofAnalysisResult.complexity,
      usableAreaPercentage: roofAnalysisResult.usableAreaPercentage,
    };

    // Extract base solar potential (without extra metadata)
    const solarPotential = {
      yearlySolarPotentialKWh: solarPotentialResult.yearlySolarPotentialKWh,
      averageIrradianceKWhPerSqM: solarPotentialResult.averageIrradianceKWhPerSqM,
      optimalPanelCount: solarPotentialResult.optimalPanelCount,
      peakSunHoursPerDay: solarPotentialResult.peakSunHoursPerDay,
    };

    // Calculate recommendation using the new engine via calculateRecommendation
    const recommendation = calculateRecommendation(
      roofAnalysis,
      solarPotential,
      monthlyBill
    );

    // Generate AI summary if financials are available
    let aiSummary: string | undefined;
    if (recommendation.financials) {
      try {
        aiSummary = await generateFinancialSummary(
          recommendation.financials,
          roofAnalysis,
          recommendation.systemSizeKW,
          {
            lat: solarPotentialResult.geocodedLocation.latitude,
            lon: solarPotentialResult.geocodedLocation.longitude,
          }
        );
      } catch (summaryError) {
        console.error('Failed to generate AI summary:', summaryError);
        // Continue without AI summary
      }
    }

    // Generate image prompts for frontend to use
    const addressString = `${address.street}, ${address.city}, ${address.postalCode}`;

    // Create AIRoofAnalysis for image generation
    // Use the actual calculated panel count from the recommendation
    const aiRoofData = roofAnalysisResult.aiAnalysis || {
      roofAreaSqMeters: roofAnalysis.roofAreaSqMeters,
      usableAreaPercentage: roofAnalysis.usableAreaPercentage,
      shadingLevel: roofAnalysis.shadingLevel,
      roofPitchDegrees: roofAnalysis.roofPitchDegrees,
      complexity: roofAnalysis.complexity,
      orientation: 'south' as const, // Default orientation
      obstacles: [],
      confidence: roofAnalysisResult.aiConfidence || 50,
      estimatedPanelCount: recommendation.panelCount, // Use actual calculated panel count
      optimalTiltAngle: 44, // PEI optimal angle
    };

    const imagePrompts = generateSolarPanelImagePrompts(aiRoofData, addressString);

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        roofAnalysis,
        solarPotential,
        // AI metadata
        aiConfidence: roofAnalysisResult.aiConfidence,
        usedAI: roofAnalysisResult.usedAI,
        usedRealGeocoding: solarPotentialResult.usedRealGeocoding,
        geocodedLocation: solarPotentialResult.geocodedLocation,
        // Image for visualization
        uploadedImageBase64: imageDataUrl,
        aiSummary,
        // Image generation prompts
        imagePrompts,
      },
    });

  } catch (error) {
    console.error('Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'An error occurred during analysis. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
