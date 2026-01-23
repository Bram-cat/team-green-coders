import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { analyzeRoofImage } from '@/lib/analysis/roofAnalysis';
import { getLocationSolarPotential } from '@/lib/analysis/solarPotential';
import { calculateRecommendation } from '@/lib/utils/scoreCalculation';
import { Address } from '@/types/address';
import { AnalyzeAPIResponse } from '@/types/api';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeAPIResponse>> {
  let tempFilePath: string | null = null;

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

    // Save image temporarily for analysis
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const extension = image.type === 'image/png' ? 'png' : 'jpg';
    tempFilePath = join(uploadDir, `${uniqueName}.${extension}`);

    await writeFile(tempFilePath, buffer);

    // Run analysis (parallel execution for performance)
    const [roofAnalysis, solarPotential] = await Promise.all([
      analyzeRoofImage(tempFilePath),
      getLocationSolarPotential(address),
    ]);

    // Calculate recommendation
    const recommendation = calculateRecommendation(roofAnalysis, solarPotential);

    // Clean up temp file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {}); // Ignore cleanup errors
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        roofAnalysis,
        solarPotential,
      },
    });

  } catch (error) {
    console.error('Analysis error:', error);

    // Attempt cleanup on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }

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
