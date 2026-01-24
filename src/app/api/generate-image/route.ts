import { NextRequest, NextResponse } from 'next/server';

// Use GOOGLE_AI_API_KEY_2 for image generation
const apiKey = process.env.GOOGLE_AI_API_KEY_2 || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, uploadedImage } = body;

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'Image generation API key not configured (GOOGLE_AI_API_KEY_2)' },
                { status: 500 }
            );
        }

        console.log('[Image Generation] Generating image with prompt:', prompt.substring(0, 100) + '...');

        // Use Google's Vertex AI Imagen API via REST
        // Endpoint: https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict';

        const requestBody = {
            instances: [{
                prompt: prompt,
            }],
            parameters: {
                sampleCount: 1, // Generate 1 image
                aspectRatio: '16:9', // Good for house visualizations
                safetyFilterLevel: 'block_some',
                personGeneration: 'allow_adult',
            }
        };

        try {
            console.log('[Image Generation] Calling Imagen API...');
            const response = await fetch(`${endpoint}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Image Generation] Imagen API error:', response.status, errorText);

                // If Imagen doesn't work, try alternative approaches
                return NextResponse.json({
                    success: false,
                    error: `Image generation failed: ${response.statusText}. Please ensure GOOGLE_AI_API_KEY_2 is configured for Imagen access.`
                }, { status: 500 });
            }

            const data = await response.json();
            console.log('[Image Generation] Success!');

            // Extract the generated image
            if (data.predictions && data.predictions.length > 0) {
                const imageData = data.predictions[0].bytesBase64Encoded;
                const imageUrl = `data:image/png;base64,${imageData}`;

                return NextResponse.json({
                    success: true,
                    imageUrl: imageUrl,
                });
            } else {
                throw new Error('No image data in response');
            }

        } catch (imagenError: any) {
            console.error('[Image Generation] Imagen failed:', imagenError.message);

            // Fallback: Return a message that image generation is not available
            return NextResponse.json({
                success: false,
                error: 'Image generation is not currently available. This feature requires Google Cloud Vertex AI access. Please contact support to enable Imagen API.',
                fallbackMessage: 'Use the schematic visualization below to see your solar panel layout.'
            }, { status: 503 });
        }

    } catch (error: any) {
        console.error('[Image Generation] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal server error',
                fallbackMessage: 'Use the schematic visualization to see your panel layout.'
            },
            { status: 500 }
        );
    }
}
