'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface HistoryItem {
    id: number;
    created_at: string;
    address: string;
    system_size_kw: number;
    suitability_score: number;
    estimated_production: number;
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
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-6">History</h1>
            <div className="space-y-4">
                {history.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">No history available yet. Start by planning your solar system!</p>
                        </CardContent>
                    </Card>
                ) : (
                    history.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.address}</CardTitle>
                                <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">System Size</p>
                                        <p className="font-semibold">{item.system_size_kw} kW</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Suitability</p>
                                        <p className="font-semibold">{item.suitability_score}/100</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Est. Production</p>
                                        <p className="font-semibold">{item.estimated_production} kWh/yr</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
