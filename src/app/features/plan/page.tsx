'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { AnalysisForm } from '@/components/forms/AnalysisForm';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';
import { AnalyzeResponse } from '@/types/api';

type AppState = 'form' | 'loading' | 'results' | 'error';

export default function PlanPage() {
    const [state, setState] = useState<AppState>('form');
    const [results, setResults] = useState<AnalyzeResponse['data'] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = (response: AnalyzeResponse) => {
        setResults(response.data);
        setState('results');
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setState('error');
    };

    const handleLoadingChange = (loading: boolean) => {
        if (loading) {
            setState('loading');
        }
    };

    const handleReset = () => {
        setResults(null);
        setError(null);
        setState('form');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg animate-fade-in-up">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Plan Your Solar Future
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Get personalized solar panel recommendations for your Prince Edward Island property.
                    </p>
                </div>

                {/* Main Content */}
                {state === 'form' && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card>
                            <CardContent className="pt-6">
                                <AnalysisForm
                                    onSuccess={handleSuccess}
                                    onError={handleError}
                                    onLoadingChange={handleLoadingChange}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {state === 'loading' && (
                    <Card className="text-center py-16">
                        <CardContent>
                            <LoadingSpinner size="lg" />
                            <p className="mt-6 text-lg font-medium text-gray-900">Analyzing your roof...</p>
                            <p className="mt-2 text-sm text-gray-500">
                                This may take a few moments while we process your image and location data
                            </p>
                        </CardContent>
                    </Card>
                )}

                {state === 'results' && results && (
                    <div className="animate-fade-in">
                        <ResultsDisplay
                            recommendation={results.recommendation}
                            roofAnalysis={results.roofAnalysis}
                            solarPotential={results.solarPotential}
                            onReset={handleReset}
                            aiConfidence={results.aiConfidence}
                            usedAI={results.usedAI}
                            usedRealGeocoding={results.usedRealGeocoding}
                            geocodedLocation={results.geocodedLocation}
                            uploadedImageBase64={results.uploadedImageBase64}
                            aiSummary={results.aiSummary}
                        />
                    </div>
                )}

                {state === 'error' && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
                            <p className="text-gray-600 mb-6 max-w-sm mx-auto">{error}</p>
                            <Button onClick={handleReset}>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
