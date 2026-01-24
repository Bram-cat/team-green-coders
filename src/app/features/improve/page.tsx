'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ImproveAnalysisForm } from '@/components/forms/ImproveAnalysisForm';
import { ImprovementResultsDisplay } from '@/components/results/ImprovementResultsDisplay';
import { ImproveResponse } from '@/types/api';

type AppState = 'form' | 'loading' | 'results' | 'error';

export default function ImprovePage() {
    const [state, setState] = useState<AppState>('form');
    const [results, setResults] = useState<ImproveResponse['data'] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = (response: ImproveResponse) => {
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl mb-4 shadow-lg animate-fade-in-up">
                        <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Improve Your Solar Setup
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Already have solar panels? Get expert recommendations to maximize your system's efficiency and energy production.
                    </p>
                </div>

                {/* Main Content */}
                {state === 'form' && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card>
                            <CardContent className="pt-6">
                                <ImproveAnalysisForm
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
                            <p className="mt-6 text-lg font-medium text-foreground">Analyzing your solar installation...</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Evaluating panel placement, efficiency, and identifying improvement opportunities
                            </p>
                        </CardContent>
                    </Card>
                )}

                {state === 'results' && results && (
                    <div className="animate-fade-in">
                        <ImprovementResultsDisplay
                            currentInstallation={results.currentInstallation}
                            improvements={results.improvements}
                            roofAnalysis={results.roofAnalysis}
                            solarPotential={results.solarPotential}
                            onReset={handleReset}
                            uploadedImageBase64={results.uploadedImageBase64}
                            aiConfidence={results.aiConfidence}
                        />
                    </div>
                )}

                {state === 'error' && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
                                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">Analysis Failed</h2>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{error}</p>
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
