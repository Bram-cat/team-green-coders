'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

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
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expansion

        if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('analysis_history')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Delete error:', error);
                alert('Failed to delete analysis. Please try again.');
                return;
            }

            // Remove from local state
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting:', err);
            alert('An unexpected error occurred.');
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="container py-24 flex justify-center min-h-[50vh] items-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground animate-pulse font-medium">Retrieving your solar journey...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container py-24 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Secure Access</h1>
                    <p className="text-muted-foreground">Please sign in to view your personalized solar analysis history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-24 max-w-5xl mx-auto px-4 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        Insights Vault
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
                        Analysis <span className="text-primary italic">History</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-lg">Revisit your journey to local energy independence on the Island.</p>
                </div>
                <div className="bg-muted/30 px-6 py-3 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <span className="text-sm font-black text-primary">{history.length} Reports Generated</span>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-4 animate-in">
                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-tight">Access Issue</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-8">
                {history.length === 0 ? (
                    <Card className="border-dashed border-2 border-border/50 bg-muted/5 rounded-[2rem]">
                        <CardContent className="p-20 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/50 rounded-[2rem] mb-8 rotate-3">
                                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black mb-3">The Vault is Ready</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mb-10 text-lg leading-relaxed">Your future solar reports will be meticulously archived here for your review.</p>
                            <Button asChild className="rounded-2xl px-10 h-14 text-base font-bold shadow-xl shadow-primary/20" rounded-full>
                                <Link href="/features/plan">Start First Analysis</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    history.map((item, index) => {
                        const isExpanded = expandedId === item.id;
                        return (
                            <Card
                                key={item.id}
                                className={cn(
                                    "relative group transition-all duration-700 overflow-hidden cursor-pointer border border-border/40 shadow-xl hover:shadow-2xl animate-fade-in-up rounded-[2rem]",
                                    isExpanded ? "ring-2 ring-primary ring-offset-4 bg-muted/5" : "hover:-translate-y-2"
                                )}
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className="flex flex-col md:flex-row min-h-[220px]">
                                    {/* Image Container */}
                                    {item.image_data && (
                                        <div className={cn(
                                            "w-full md:w-72 lg:w-96 relative flex-shrink-0 bg-muted overflow-hidden transition-all duration-700",
                                            isExpanded ? "md:w-96 h-80 md:h-auto" : "h-56 md:h-auto"
                                        )}>
                                            <Image
                                                src={item.image_data.startsWith('data:') ? item.image_data : `data:image/png;base64,${item.image_data}`}
                                                alt="Roof detail"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform ease-out shadow-inner"
                                                style={{ transitionDuration: '2000ms' }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                                <div className="text-[10px] text-white/90 font-black tracking-[0.3em] uppercase drop-shadow-md">Capture #{item.id.slice(-6)}</div>
                                            </div>
                                            {isExpanded && (
                                                <div className="absolute inset-0 bg-primary/10 transition-opacity duration-700" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                                        <div className="w-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-white/20 transition-all ${item.analysis_type === 'plan'
                                                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                                                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                        }`}>
                                                        {item.analysis_type === 'plan' ? 'Strategic Plan' : 'Optimization'}
                                                    </span>
                                                    <span className="text-xs font-black text-muted-foreground border-l border-border/50 pl-4 uppercase tracking-widest">
                                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className={cn("w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center transition-all duration-500", isExpanded ? "rotate-180 bg-primary/20 text-primary" : "group-hover:bg-primary/10")}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-black text-foreground mb-8 leading-tight tracking-tighter group-hover:text-primary transition-colors pr-8">{item.address}</h3>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                                {item.analysis_type === 'plan' ? (
                                                    <>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Architecture</div>
                                                            <div className="text-xl font-black tracking-tighter">{item.system_size_kw?.toFixed(1)} <span className="text-[10px] opacity-70">kW</span></div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Vitality</div>
                                                            <div className="text-xl font-black text-primary tracking-tighter">{item.suitability_score}%</div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Modules</div>
                                                            <div className="text-xl font-black tracking-tighter">{item.panel_count}</div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Output</div>
                                                            <div className="text-xl font-black tracking-tighter">{item.estimated_production?.toLocaleString()} <span className="text-[10px] opacity-70">kWh</span></div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Current</div>
                                                            <div className="text-xl font-black tracking-tighter">{item.current_efficiency_percentage}%</div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Maximum</div>
                                                            <div className="text-xl font-black text-primary tracking-tighter">{item.potential_efficiency_percentage}%</div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Delta</div>
                                                            <div className="text-xl font-black text-accent tracking-tighter">
                                                                +{((item.potential_efficiency_percentage || 0) - (item.current_efficiency_percentage || 0)).toFixed(1)}%
                                                            </div>
                                                        </div>
                                                        <div className="bg-background/50 p-4 rounded-3xl border border-border/50 text-center shadow-sm hover:border-primary/30 transition-colors">
                                                            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Active</div>
                                                            <div className="text-xl font-black tracking-tighter">{item.panel_count}</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {item.ai_summary && (
                                                <div className={cn(
                                                    "transition-all duration-700 ease-in-out overflow-hidden relative",
                                                    isExpanded ? "opacity-100 max-h-[800px] mb-8" : "opacity-90 max-h-[3rem] text-ellipsis"
                                                )}>
                                                    <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-l-[6px] border-primary rounded-r-[1.5rem] shadow-sm">
                                                        <p className="text-sm font-bold leading-relaxed italic text-foreground/90 tracking-tight">
                                                            &ldquo;{item.ai_summary}&rdquo;
                                                        </p>
                                                    </div>
                                                    {!isExpanded && (
                                                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent h-full w-full" />
                                                    )}
                                                </div>
                                            )}

                                            {isExpanded && (
                                                <div className="mt-10 pt-10 border-t-2 border-dashed border-border/50 grid md:grid-cols-2 gap-10 animate-fade-in">
                                                    <div className="space-y-6">
                                                        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">Technical Analysis Depth</h4>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between group/line">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover/line:text-foreground transition-colors">Property Integrity</span>
                                                                <span className="h-[2px] flex-1 mx-4 bg-muted/30 invisible md:visible"></span>
                                                                <span className="text-sm font-black text-primary">Validated by AI</span>
                                                            </div>
                                                            <div className="flex items-center justify-between group/line">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover/line:text-foreground transition-colors">Region Context</span>
                                                                <span className="h-[2px] flex-1 mx-4 bg-muted/30 invisible md:visible"></span>
                                                                <span className="text-sm font-black">Prince Edward Island</span>
                                                            </div>
                                                            <div className="flex items-center justify-between group/line">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover/line:text-foreground transition-colors">Data Freshness</span>
                                                                <span className="h-[2px] flex-1 mx-4 bg-muted/30 invisible md:visible"></span>
                                                                <span className="text-sm font-black italic">Nov 2025 Standard</span>
                                                            </div>
                                                            {item.analysis_type === 'plan' && (
                                                                <div className="flex items-center justify-between group/line">
                                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover/line:text-foreground transition-colors">Projected ROI</span>
                                                                    <span className="h-[2px] flex-1 mx-4 bg-muted/30 invisible md:visible"></span>
                                                                    <span className="text-sm font-black text-accent tracking-tighter">7.2 - 8.9 Years</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col justify-end gap-4 p-8 bg-muted/20 rounded-[2rem] border border-border/30">
                                                        <div className="text-center mb-2">
                                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Actions</div>
                                                            <div className="h-0.5 w-8 bg-primary/30 mx-auto rounded-full"></div>
                                                        </div>
                                                        <Button className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95" variant="default" asChild onClick={(e) => e.stopPropagation()}>
                                                            <Link href={`/features/${item.analysis_type}`}>Re-evaluate Property</Link>
                                                        </Button>
                                                        <Button
                                                            className="w-full rounded-2xl h-14 font-black shadow-lg hover:shadow-destructive/20 transition-all active:scale-95"
                                                            variant="destructive"
                                                            onClick={(e) => handleDelete(item.id, e)}
                                                        >
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete Analysis
                                                        </Button>
                                                        <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60 italic">Securely stored in Green Coders Cloud</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
