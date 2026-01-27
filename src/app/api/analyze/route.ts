import { NextRequest, NextResponse } from 'next/server';
import { analyzeMultipleRoofImages } from '@/lib/analysis/roofAnalysis';
import { getLocationSolarPotential } from '@/lib/analysis/solarPotential';
import { calculateRecommendation } from '@/lib/utils/scoreCalculation';
import { generateFinancialSummary } from '@/lib/ai/openaiService';
import { Address } from '@/types/address';
import { AnalyzeAPIResponse } from '@/types/api';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeAPIResponse>> {
  try {
    const formData = await request.formData();

    // Extract and validate images (support 1-3 images)
    const images: Array<{ file: File; buffer: Buffer; mimeType: string }> = [];

    for (let i = 1; i <= 3; i++) {
      const image = formData.get(`image${i}`) as File | null;
      if (image) {
        // Validate image type
        if (!ALLOWED_TYPES.includes(image.type)) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_TYPE', message: `Image ${i} must be a JPEG or PNG file.` } },
            { status: 400 }
          );
        }

        // Validate image size
        if (image.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: { code: 'FILE_TOO_LARGE', message: `Image ${i} must be under 10MB.` } },
            { status: 400 }
          );
        }

        // Convert to buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        images.push({
          file: image,
          buffer,
          mimeType: image.type
        });
      }
    }

    // Require at least one image
    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IMAGE', message: 'Please upload at least one roof image.' } },
        { status: 400 }
      );
    }

    console.log(`Processing ${images.length} image(s) for analysis...`);

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

    // Convert primary image to base64 for client-side visualization
    const primaryImage = images[0];
    const imageBase64 = primaryImage.buffer.toString('base64');
    const imageDataUrl = `data:${primaryImage.mimeType};base64,${imageBase64}`;

    // Prepare images for multi-image analysis
    const imageBuffers = images.map(img => ({
      buffer: img.buffer,
      mimeType: img.mimeType
    }));

    // Run analysis (parallel execution for performance)
    const [roofAnalysisResult, solarPotentialResult] = await Promise.all([
      analyzeMultipleRoofImages(imageBuffers),
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

    // Get user ID from Clerk and save to database
    const { userId } = await auth();

    if (userId) {
      try {
        const { error: dbError } = await supabase
          .from('analysis_history')
          .insert({
            user_id: userId,
            analysis_type: 'plan',
            address: `${address.street}, ${address.city}, ${address.postalCode}`,
            city: address.city,
            postal_code: address.postalCode,
            country: address.country,
            image_data: imageBase64,

            // Roof analysis
            roof_area_sq_meters: roofAnalysis.roofAreaSqMeters,
            shading_level: roofAnalysis.shadingLevel,
            roof_pitch_degrees: roofAnalysis.roofPitchDegrees,
            complexity: roofAnalysis.complexity,
            usable_area_percentage: roofAnalysis.usableAreaPercentage,

            // Solar potential
            yearly_solar_potential_kwh: solarPotential.yearlySolarPotentialKWh,
            average_irradiance_kwh_per_sqm: solarPotential.averageIrradianceKWhPerSqM,
            optimal_panel_count: solarPotential.optimalPanelCount,
            peak_sun_hours_per_day: solarPotential.peakSunHoursPerDay,

            // Recommendations
            suitability_score: recommendation.suitabilityScore,
            system_size_kw: recommendation.systemSizeKW,
            panel_count: recommendation.panelCount,
            estimated_annual_production_kwh: recommendation.estimatedAnnualProductionKWh,
            estimated_production: recommendation.estimatedAnnualProductionKWh,
            layout_suggestion: recommendation.layoutSuggestion,
            explanation: recommendation.explanation,

            // Financial data
            estimated_cost_cad: recommendation.financials?.estimatedSystemCost,
            annual_savings_cad: recommendation.financials?.annualElectricitySavings,
            payback_period_years: recommendation.financials?.simplePaybackYears,
            roi_25_years_cad: recommendation.financials?.twentyFiveYearSavings,

            // Additional data
            monthly_bill: monthlyBill,
            ai_summary: aiSummary,
            raw_analysis_data: {
              roofAnalysisResult,
              solarPotentialResult,
              recommendation,
            },
          });

        if (dbError) {
          console.error('Supabase insert error (Plan):', dbError);
        }
      } catch (dbError) {
        console.error('Failed to save to database (Plan):', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        roofAnalysis,
        solarPotential,
        // AI metadata
        aiConfidence: roofAnalysisResult.aiConfidence,
        usedAI: roofAnalysisResult.usedAI,
        imageCount: roofAnalysisResult.imageCount || images.length,
        usedRealGeocoding: solarPotentialResult.usedRealGeocoding,
        geocodedLocation: solarPotentialResult.geocodedLocation,
        // Image for visualization (primary image)
        uploadedImageBase64: imageDataUrl,
        aiSummary,
      },
    });

  } catch (error: any) {
    console.error('Analysis error:', error);

    const errorMessage = error.message || 'An error occurred during analysis. Please try again.';

    // Check for specific error types
    // If error message indicates no API key, return 500
    if (errorMessage.includes('OpenAI API is not configured')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'API_NOT_CONFIGURED',
            message: 'Solar analysis service is temporarily unavailable. Please try again later.',
          },
        },
        { status: 500 }
      );
    }

    // If error indicates existing solar panels, redirect to Improve feature (user error - 400)
    if (errorMessage.includes('already has') && errorMessage.includes('solar panels installed')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_EXISTING_PANELS',
            message: errorMessage,
          },
        },
        { status: 400 }
      );
    }

    // If error indicates not a house or invalid image, return 400 (user error)
    if (errorMessage.includes('not a house') || errorMessage.includes('does not appear to be') || errorMessage.includes('Please upload a clear photo')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: errorMessage,
          },
        },
        { status: 400 }
      );
    }

    // Generic error for everything else
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
