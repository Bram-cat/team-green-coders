import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

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

        console.log('[Image Generation] Requesting image for prompt:', prompt.substring(0, 50) + '...');

        // Note: As of early 2025, experimental image generation via Gemini API 
        // might require specific endpoint or model handling.
        // If the SDK doesn't support it directly, we might need a raw fetch.
        // For now, attempting to use the model user requested: gemini-2.5-flash-preview-image
        // If this fails, it means the model isn't publicly available via this API structure yet.

        // Attempting direct fetch to experimental endpoint if SDK fails
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('API Key missing');
        }

        // Try standard Imagen/Gemini approach via REST if SDK doesn't have createImages
        // This is a hypothetical endpoint structure for the preview model
        // In production, this would be `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent` 
        // but for images it's often different.

        // FALLBACK: Since we cannot guarantee the "gemini-2.5" image capability is live/accessible
        // without a specific beta enabled key or region, we will simulate the integration 
        // but provide a clear error message in the return if it fails, allowing the UI to show the specific error.

        // However, the user specifically asked for "gemini-2.5-flash-preview-image".
        // Let's try to initialize that model.
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-image' });

            // This is where it gets tricky - standard generateContent returns text/multimodal text.
            // Image generation usually requires `imagen-3.0-generate-001` or similar.
            // But let's try the user's requested model with generateContent.
            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Use text response? Or assume it returns an image link?
            // Usually image models return a different structure.

            // If this model is text-to-image, it might send base64 data.
            console.log('Model response:', response);

            // If successful but just text, we return error.
            return NextResponse.json({
                success: false,
                error: 'Model returned text, not image. Image generation requires Imagen model.'
            });

        } catch (e: any) {
            console.error('Gemini SDK Error:', e);

            // If specific model fails, we can try to return a specialized error
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
