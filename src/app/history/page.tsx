'use client';

import { useEffect, useState } from 'react';
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
}

export default function HistoryPage() {
    const { user, isLoaded } = useUser();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) {
            if (isLoaded && !user) setLoading(false);
            return;
        }

        async function fetchHistory() {
            try {
                const { data, error } = await supabase
                    .from('analysis_history')
                    .select('*')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setHistory(data || []);
            } catch (err) {
                console.error('Error fetching history:', err);
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
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-xl">{item.address}</CardTitle>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                item.analysis_type === 'plan'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-accent/10 text-accent-foreground'
                                            }`}>
                                                {item.analysis_type === 'plan' ? '📋 Plan' : '⚡ Improve'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {item.analysis_type === 'plan' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">System Size</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.system_size_kw?.toFixed(1)} kW
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Suitability</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.suitability_score}/100
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Panels</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.panel_count || 0}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Est. Production</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.estimated_production?.toLocaleString() || 0} kWh/yr
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">System Size</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.system_size_kw?.toFixed(1)} kW
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Current Efficiency</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {item.current_efficiency_percentage}%
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Potential</p>
                                            <p className="text-lg font-semibold text-primary">
                                                {item.potential_efficiency_percentage}%
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Efficiency Gain</p>
                                            <p className="text-lg font-semibold text-accent">
                                                +{((item.potential_efficiency_percentage || 0) - (item.current_efficiency_percentage || 0)).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
