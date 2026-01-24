'use client';

import { useState } from 'react';
import { GeneratedPanelImage } from '@/lib/services/imageGenerationService';

interface ImageGenerationPanelProps {
    imagePrompts: GeneratedPanelImage[];
    address: string;
}

export function ImageGenerationPanel({ imagePrompts, address }: ImageGenerationPanelProps) {
    const [selectedAngle, setSelectedAngle] = useState<'aerial' | 'south' | 'west'>('aerial');
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
    const [generating, setGenerating] = useState<Record<string, boolean>>({});

    const currentPrompt = imagePrompts.find(p => p.angle === selectedAngle);

    const handleGenerateImage = async (angle: 'aerial' | 'south' | 'west') => {
        const prompt = imagePrompts.find(p => p.angle === angle);
        if (!prompt || generatedImages[angle]) return;

        setGenerating(prev => ({ ...prev, [angle]: true }));

        try {
            console.log(`[Image Generation] Generating ${angle} view...`);
            console.log('Prompt:', prompt.prompt);

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create robust SVG placeholder
            const colors = {
                aerial: { bg: '#3b82f6', accent: '#60a5fa', text: 'Aerial View' },
                south: { bg: '#10b981', accent: '#34d399', text: 'South View' },
                west: { bg: '#f59e0b', accent: '#fbbf24', text: 'West View' }
            };
            const theme = colors[angle];

            const svgContent = `
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-${angle}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:${theme.bg};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="800" height="600" fill="url(#grad-${angle})"/>
                    <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))">
                        ${theme.text.toUpperCase()}
                    </text>
                    <text x="400" y="340" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.9">
                        Visualization Placeholder
                    </text>
                    <text x="400" y="380" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">
                        To enable AI imagery, integrate Google Imagen API
                    </text>
                </svg>
            `;

            // Use encodeURIComponent for reliable data URI
            const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent.trim())}`;

            setGeneratedImages(prev => ({
                ...prev,
                [angle]: dataUrl
            }));
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setGenerating(prev => ({ ...prev, [angle]: false }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    AI-Generated Visualizations
                </h3>
                <span className="text-sm text-gray-500">
                    {address}
                </span>
            </div>

            {/* Angle selector tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {imagePrompts.map((prompt) => (
                    <button
                        key={prompt.angle}
                        onClick={() => setSelectedAngle(prompt.angle)}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${selectedAngle === prompt.angle
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        {prompt.angle.charAt(0).toUpperCase() + prompt.angle.slice(1)} View
                    </button>
                ))}
            </div>

            {/* Image display area */}
            <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
                {generatedImages[selectedAngle] ? (
                    <div className="w-full space-y-4">
                        <img
                            src={generatedImages[selectedAngle]}
                            alt={`${selectedAngle} view of solar panel installation`}
                            className="w-full rounded-lg shadow-lg"
                        />
                        <p className="text-sm text-gray-600 text-center">
                            {currentPrompt?.description}
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-700 font-medium mb-2">
                                {currentPrompt?.description}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Click the button below to generate a photorealistic visualization
                            </p>
                        </div>
                        <button
                            onClick={() => handleGenerateImage(selectedAngle)}
                            disabled={generating[selectedAngle]}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                        >
                            {generating[selectedAngle] ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate {selectedAngle.charAt(0).toUpperCase() + selectedAngle.slice(1)} View
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Generate all button */}
            <div className="flex justify-center pt-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        imagePrompts.forEach(prompt => {
                            if (!generatedImages[prompt.angle]) {
                                handleGenerateImage(prompt.angle);
                            }
                        });
                    }}
                    disabled={Object.keys(generating).some(k => generating[k])}
                    className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Generate All Views
                </button>
            </div>

            {/* Prompt details (collapsible) */}
            {currentPrompt && (
                <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        View Generation Prompt
                    </summary>
                    <pre className="mt-3 text-xs text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto">
                        {currentPrompt.prompt}
                    </pre>
                </details>
            )}
        </div>
    );
}
