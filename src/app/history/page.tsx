'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface HistoryItem {
    id: string;
    created_at: string;
    analysis_type: 'plan' | 'improve';
    address: string;
    system_size_kw: number | null;
    suitability_score: number | null;
    estimated_production: number | null;
    panel_count: number | null;
    current_efficiency_percentage: number | null;
    potential_efficiency_percentage: number | null;
    image_data: string | null;
    ai_summary: string | null;
}

export default function HistoryPage() {
    const { user, isLoaded } = useUser();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user) {
            if (isLoaded && !user) setLoading(false);
            return;
        }

        async function fetchHistory() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('analysis_history')
                    .select('*')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Supabase error:', error);
                    setError('Failed to load history: ' + error.message);
                    return;
                }
                setHistory(data || []);
            } catch (err) {
                console.error('Error fetching history:', err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [user, isLoaded]);

    if (!isLoaded || loading) {
        return (
            <div className="container py-12 flex justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-6">History</h1>
                <p>Please sign in to view your history.</p>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analysis History</h1>
                <p className="text-muted-foreground">View all your past solar analysis reports</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {history.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-muted-foreground">No analysis history yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">Start by planning your solar system or improving your existing installation!</p>
                        </CardContent>
                    </Card>
                ) : (
                    history.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden border border-border">
                            <div className="flex flex-col md:flex-row">
                                {/* Image Container */}
                                {item.image_data && (
                                    <div className="w-full md:w-48 lg:w-64 h-48 relative flex-shrink-0">
                                        <Image
                                            src={item.image_data.startsWith('data:') ? item.image_data : `data:image/png;base64,${item.image_data}`}
                                            alt="Analysis roof"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${item.analysis_type === 'plan'
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.analysis_type === 'plan' ? 'New Plan' : 'Improvement'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-1">{item.address}</h3>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        {item.analysis_type === 'plan' ? (
                                            <>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Size</div>
                                                    <div className="text-sm font-bold">{item.system_size_kw?.toFixed(1)} kW</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Score</div>
                                                    <div className="text-sm font-bold">{item.suitability_score}/100</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Panels</div>
                                                    <div className="text-sm font-bold">{item.panel_count}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Annual</div>
                                                    <div className="text-sm font-bold">{item.estimated_production?.toLocaleString()} kWh</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Current</div>
                                                    <div className="text-sm font-bold">{item.current_efficiency_percentage}%</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Potential</div>
                                                    <div className="text-sm font-bold text-primary">{item.potential_efficiency_percentage}%</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Gain</div>
                                                    <div className="text-sm font-bold text-accent">
                                                        +{((item.potential_efficiency_percentage || 0) - (item.current_efficiency_percentage || 0)).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded text-center">
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Panels</div>
                                                    <div className="text-sm font-bold">{item.panel_count}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {item.ai_summary && (
                                        <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 py-1 line-clamp-2">
                                            &ldquo;{item.ai_summary}&rdquo;
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
