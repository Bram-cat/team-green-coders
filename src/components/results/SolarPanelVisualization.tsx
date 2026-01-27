'use client';

import { useMemo } from 'react';
import Image from 'next/image';

interface SolarPanelVisualizationProps {
  uploadedImageUrl?: string;
  panelCount: number;
  roofAreaSqM: number;
  usableAreaPercentage: number;
  orientation?: string;
  systemSizeKW: number;
  aiConfidence?: number;
  usedAI: boolean;
}

export function SolarPanelVisualization({
  uploadedImageUrl,
  panelCount,
  roofAreaSqM,
  usableAreaPercentage,
  orientation = 'south',
  systemSizeKW,
  aiConfidence,
  usedAI,
}: SolarPanelVisualizationProps) {
  // Calculate panel layout
  const layout = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(panelCount * 1.5)); // Slightly wider than tall
    const rows = Math.ceil(panelCount / cols);
    return { cols, rows, total: panelCount };
  }, [panelCount]);

  // Generate panel grid
  const panelGrid = useMemo(() => {
    const panels: { row: number; col: number; index: number }[] = [];
    let index = 0;
    for (let row = 0; row < layout.rows && index < panelCount; row++) {
      for (let col = 0; col < layout.cols && index < panelCount; col++) {
        panels.push({ row, col, index });
        index++;
      }
    }
    return panels;
  }, [layout, panelCount]);

  // Calculate orientation angle for compass
  const orientationAngle = {
    north: 0,
    east: 90,
    south: 180,
    west: 270,
    flat: 0,
  }[orientation] || 180;

  return (
    <div className="space-y-12">
      {/* 1. Technical Layout Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Original Image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
              Active Site Photo
            </h4>
            <div className="h-1 w-1 bg-primary rounded-full animate-pulse" />
          </div>
          <div className="relative bg-muted/30 rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-inner border border-border/50">
            {uploadedImageUrl ? (
              <Image
                src={uploadedImageUrl}
                alt="Uploaded roof"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/40 font-black uppercase tracking-widest text-xs">
                Missing Asset
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent h-24" />
          </div>
        </div>

        {/* Panel Layout Schematic */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
              Neural Reconstruction
            </h4>
            <div className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">v2.5</div>
          </div>
          <div className="relative bg-white rounded-[2.5rem] aspect-[4/3] p-8 border-2 border-primary/5 shadow-2xl flex flex-col items-center justify-center">
            {/* Compass rose - Absolute Top Right */}
            <div className="absolute top-6 right-6 w-14 h-14 bg-white rounded-full shadow-lg border border-border/40 p-2 group-hover:rotate-45 transition-transform duration-1000">
              <div className="relative w-full h-full border border-dashed border-border rounded-full flex items-center justify-center">
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                  style={{ transform: `rotate(${orientationAngle}deg)` }}
                >
                  <div className="w-1 h-6 bg-primary rounded-full" />
                </div>
                <span className="text-[8px] font-black text-primary mt-1">N</span>
              </div>
            </div>

            <svg
              viewBox="0 0 200 120"
              className="w-full h-full drop-shadow-2xl"
            >
              <polygon
                points="100,10 190,50 190,110 10,110 10,50"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />

              <rect
                x="25"
                y="55"
                width="150"
                height="50"
                fill="#ecfdf5"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 2"
                rx="4"
              />

              {panelGrid.map((panel) => {
                const panelWidth = 140 / layout.cols;
                const panelHeight = 40 / layout.rows;
                const x = 30 + panel.col * panelWidth;
                const y = 60 + panel.row * panelHeight;

                return (
                  <rect
                    key={panel.index}
                    x={x}
                    y={y}
                    width={panelWidth - 2}
                    height={panelHeight - 2}
                    fill="#1e40af"
                    stroke="#1e3a8a"
                    strokeWidth="0.5"
                    rx="1.5"
                  />
                );
              })}
            </svg>
            <div className="mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{layout.cols} &times; {layout.rows} Optimal Array</div>
          </div>
        </div>
      </div>

      {/* 2. AI Authenticity Badge */}
      {usedAI && (
        <div className="pt-6 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-5 bg-white rounded-[2rem] border border-border/50 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-2xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <h5 className="text-base font-black text-foreground tracking-tight leading-none mb-1">Architectural Integrity Analysis</h5>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Core Processor: OpenAI Vision (GPT-4o)</p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-1 max-w-sm">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${aiConfidence || 95}%`, transitionDuration: '2000ms' }}
                />
              </div>
              <div className="text-xl font-black text-primary tracking-tighter leading-none">{(aiConfidence || 95)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

