'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { AnalysisForm } from '@/components/forms/AnalysisForm';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';
import { AnalyzeResponse } from '@/types/api';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-4">
            <div className={cn(
                "mx-auto transition-all duration-700",
                state === 'results' ? "max-w-7xl" : "max-w-2xl"
            )}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl mb-6 shadow-2xl shadow-primary/20 animate-fade-in-up">
                        <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Plan Your <span className="text-primary italic">Solar Future</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-lg mx-auto font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Get personalized solar panel recommendations for your Prince Edward Island property.
                    </p>
                </div>

                {/* Main Content */}
                {state === 'form' && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 md:p-12">
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
                    <Card className="text-center py-20 border-none shadow-2xl rounded-[2rem]">
                        <CardContent>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <LoadingSpinner size="lg" className="relative z-10" />
                            </div>
                            <p className="mt-10 text-2xl font-black text-foreground tracking-tight">Analyzing your roof...</p>
                            <p className="mt-4 text-muted-foreground font-medium max-w-sm mx-auto">
                                Our AI is processing your architecture and calculating Prince Edward Island&apos;s irradiance data.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {state === 'results' && results && (
                    <div className="animate-fade-in space-y-12">
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
                    <Card className="text-center py-16 border-none shadow-2xl rounded-[2rem]">
                        <CardContent>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6 text-destructive">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">Analysis Failed</h2>
                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium leading-relaxed">{error}</p>
                            <Button onClick={handleReset} className="rounded-xl h-12 px-8 font-bold">
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
