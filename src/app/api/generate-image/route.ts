import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with fallback keys
const apiKey = process.env.GOOGLE_AI_API_KEY_1 || process.env.GOOGLE_AI_API_KEY_2 || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API Key missing. Server configuration error.' },
                { status: 500 }
            );
        }

        console.log('[Image Generation] Requesting image for prompt:', prompt.substring(0, 50) + '...');

        // Try to use the user-requested model "gemini-2.5-flash-preview-image"
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-image' });

            // Note: Standard generateContent returns text. If this model supports image output,
            // it might be via a different method or return base64 in the text.
            // If the SDK doesn't support direct image result type yet, we check the response.
            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Check if response contains image data
            // This logic assumes the model returns a standard structure or we can extract it.
            // If "gemini-2.5-flash-preview-image" is text-to-image, it might work differently.
            console.log('Model response candidates:', response.candidates);

            // If we get here, the model exists and responded.
            // If it's just text saying "I can't", we should catch that.
            const text = response.text();

            // Mocking the success if we can't parse real image data yet without the specific new SDK types
            // Ideally, we would return `data.images[0]` if using Imagen API directly.

            return NextResponse.json({
                success: false,
                error: 'Model accessed but returned text. Currently using text-generation endpoint. Integration requires specific Imagen endpoint.'
            });

        } catch (e: any) {
            console.error('Gemini SDK Error:', e);
            return NextResponse.json({
                success: false,
                error: `Failed to generate image with model gemini-2.5-flash-preview-image: ${e.message}`
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
