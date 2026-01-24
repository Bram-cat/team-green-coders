import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        try {
            // Use Google Generative AI SDK for image generation
            const genAI = new GoogleGenerativeAI(apiKey);

            // Try using imagen-3.0-generate-001 model
            const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

            console.log('[Image Generation] Calling Imagen API via SDK...');

            // Generate image using the SDK
            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: prompt
                    }]
                }]
            });

            const response = await result.response;
            console.log('[Image Generation] Success!');

            // The response should contain the generated image
            if (response && response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];

                // Extract image data from the response
                // Note: The exact format may vary, adjust based on actual response
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                            return NextResponse.json({
                                success: true,
                                imageUrl: imageUrl,
                            });
                        }
                    }
                }
            }

            // If we reach here, the response format was unexpected
            console.warn('[Image Generation] Unexpected response format:', JSON.stringify(response));
            throw new Error('Unexpected response format from Imagen API');

        } catch (imagenError: any) {
            console.error('[Image Generation] Imagen failed:', imagenError.message);
            console.error('[Image Generation] Full error:', imagenError);

            // Try fallback with Gemini for image editing if we have an uploaded image
            if (uploadedImage) {
                try {
                    console.log('[Image Generation] Trying fallback with Gemini image editing...');
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

                    // Create a prompt that asks Gemini to describe how to edit the image
                    const editPrompt = `Based on this roof image, describe in detail where solar panels should be placed: ${prompt}`;

                    const result = await model.generateContent({
                        contents: [{
                            role: 'user',
                            parts: [
                                { text: editPrompt },
                                {
                                    inlineData: {
                                        mimeType: uploadedImage.mimeType || 'image/jpeg',
                                        data: uploadedImage.data
                                    }
                                }
                            ]
                        }]
                    });

                    const response = await result.response;
                    const description = response.text();

                    console.log('[Image Generation] Gemini fallback generated description');

                    // Return the description instead of an image
                    return NextResponse.json({
                        success: true,
                        imageUrl: null,
                        description: description,
                        fallbackUsed: true
                    });

                } catch (fallbackError: any) {
                    console.error('[Image Generation] Gemini fallback failed:', fallbackError.message);
                }
            }

            // If all attempts fail, return error
            return NextResponse.json({
                success: false,
                error: `Image generation failed: ${imagenError.message}. The Imagen API may not be available with your current API key.`,
                fallbackMessage: 'Use the schematic visualization below to see your solar panel layout.',
                details: imagenError.message
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
