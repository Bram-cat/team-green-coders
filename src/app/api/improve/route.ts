import { NextRequest, NextResponse } from 'next/server';
import { analyzeExistingInstallation } from '@/lib/analysis/improvementAnalysis';
import { getLocationSolarPotential } from '@/lib/analysis/solarPotential';
import { Address } from '@/types/address';
import { ImproveAPIResponse } from '@/types/api';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest): Promise<NextResponse<ImproveAPIResponse>> {
  try {
    const formData = await request.formData();

    // Extract and validate image
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IMAGE', message: 'Please upload an image of your solar installation.' } },
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

    // Extract and validate address
    const address: Address = {
      street: formData.get('street') as string || '',
      city: formData.get('city') as string || '',
      postalCode: formData.get('postalCode') as string || '',
      country: formData.get('country') as string || '',
    };

    if (!address.street || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json(
        { success: false, error: { code: 'INCOMPLETE_ADDRESS', message: 'Please fill in all address fields.' } },
        { status: 400 }
      );
    }

    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Run analysis
    const [improvementAnalysis, solarPotentialResult] = await Promise.all([
      analyzeExistingInstallation(buffer, image.type),
      getLocationSolarPotential(address),
    ]);

    // Get user ID from Clerk
    const { userId } = await auth();

    // Save to database if user is authenticated
    if (userId) {
      try {
        const { data: analysisData, error: dbError } = await supabase
          .from('analysis_history')
          .insert({
            user_id: userId,
            analysis_type: 'improve',
            address: `${address.street}, ${address.city}, ${address.postalCode}`,
            city: address.city,
            postal_code: address.postalCode,
            country: address.country,
            image_data: imageBase64,

            // Roof data
            roof_area_sq_meters: improvementAnalysis.roofAreaSqMeters,
            shading_level: improvementAnalysis.shadingLevel,
            roof_pitch_degrees: improvementAnalysis.roofPitchDegrees,
            complexity: improvementAnalysis.complexity,
            usable_area_percentage: improvementAnalysis.usableAreaPercentage,

            // Solar potential
            yearly_solar_potential_kwh: solarPotentialResult.yearlySolarPotentialKWh,
            average_irradiance_kwh_per_sqm: solarPotentialResult.averageIrradianceKWhPerSqM,
            optimal_panel_count: solarPotentialResult.optimalPanelCount,
            peak_sun_hours_per_day: solarPotentialResult.peakSunHoursPerDay,

            // Improvement specific data
            current_efficiency_percentage: improvementAnalysis.currentEfficiency,
            potential_efficiency_percentage: improvementAnalysis.potentialEfficiency,
            improvement_suggestions: improvementAnalysis.suggestions,
            panel_count: improvementAnalysis.currentPanelCount,

            // Store full analysis
            raw_analysis_data: improvementAnalysis,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving to database:', dbError);
        }
      } catch (saveError) {
        console.error('Failed to save analysis:', saveError);
        // Continue even if save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentInstallation: {
          panelCount: improvementAnalysis.currentPanelCount,
          estimatedSystemSizeKW: improvementAnalysis.estimatedSystemSizeKW,
          currentEfficiency: improvementAnalysis.currentEfficiency,
          orientation: improvementAnalysis.orientation,
          panelCondition: improvementAnalysis.panelCondition,
        },
        improvements: {
          potentialEfficiency: improvementAnalysis.potentialEfficiency,
          efficiencyGain: improvementAnalysis.potentialEfficiency - improvementAnalysis.currentEfficiency,
          suggestions: improvementAnalysis.suggestions,
          estimatedAdditionalProductionKWh: improvementAnalysis.estimatedAdditionalProduction,
        },
        roofAnalysis: {
          roofAreaSqMeters: improvementAnalysis.roofAreaSqMeters,
          shadingLevel: improvementAnalysis.shadingLevel,
          roofPitchDegrees: improvementAnalysis.roofPitchDegrees,
          complexity: improvementAnalysis.complexity,
          usableAreaPercentage: improvementAnalysis.usableAreaPercentage,
        },
        solarPotential: {
          yearlySolarPotentialKWh: solarPotentialResult.yearlySolarPotentialKWh,
          averageIrradianceKWhPerSqM: solarPotentialResult.averageIrradianceKWhPerSqM,
          optimalPanelCount: solarPotentialResult.optimalPanelCount,
          peakSunHoursPerDay: solarPotentialResult.peakSunHoursPerDay,
        },
        uploadedImageBase64: imageDataUrl,
        aiConfidence: improvementAnalysis.aiConfidence,
      },
    });

  } catch (error) {
    console.error('Improvement analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'An error occurred during improvement analysis. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
