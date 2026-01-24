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
    <div className="space-y-4">
      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Image */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Your Roof
          </h4>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
            {uploadedImageUrl ? (
              <Image
                src={uploadedImageUrl}
                alt="Uploaded roof"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>No image available</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel Layout Schematic */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Suggested Panel Layout
          </h4>
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg aspect-video p-4 border border-gray-200">
            {/* Roof outline */}
            <svg
              viewBox="0 0 200 120"
              className="w-full h-full"
              style={{ maxHeight: '180px' }}
            >
              {/* Roof shape */}
              <polygon
                points="100,10 190,50 190,110 10,110 10,50"
                fill="#e5e7eb"
                stroke="#9ca3af"
                strokeWidth="1"
              />

              {/* Usable area */}
              <rect
                x="25"
                y="55"
                width="150"
                height="50"
                fill="#d1fae5"
                stroke="#10b981"
                strokeWidth="1"
                rx="2"
              />

              {/* Panel grid */}
              {panelGrid.map((panel) => {
                const panelWidth = 140 / layout.cols;
                const panelHeight = 40 / layout.rows;
                const x = 30 + panel.col * panelWidth;
                const y = 60 + panel.row * panelHeight;

                return (
                  <g key={panel.index}>
                    <rect
                      x={x}
                      y={y}
                      width={panelWidth - 2}
                      height={panelHeight - 2}
                      fill="#1e40af"
                      stroke="#1e3a8a"
                      strokeWidth="0.5"
                      rx="1"
                    />
                    {/* Panel lines */}
                    <line
                      x1={x + (panelWidth - 2) / 2}
                      y1={y}
                      x2={x + (panelWidth - 2) / 2}
                      y2={y + panelHeight - 2}
                      stroke="#3b82f6"
                      strokeWidth="0.3"
                    />
                  </g>
                );
              })}

              {/* Compass rose */}
              <g transform="translate(175, 25)">
                <circle cx="0" cy="0" r="12" fill="white" stroke="#6b7280" strokeWidth="0.5" />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fontSize="6"
                  fill="#dc2626"
                  fontWeight="bold"
                >
                  N
                </text>
                <text x="0" y="9" textAnchor="middle" fontSize="5" fill="#6b7280">
                  S
                </text>
                <text x="-7" y="2" textAnchor="middle" fontSize="5" fill="#6b7280">
                  W
                </text>
                <text x="7" y="2" textAnchor="middle" fontSize="5" fill="#6b7280">
                  E
                </text>
                {/* Direction indicator */}
                <polygon
                  points="0,-8 2,-3 -2,-3"
                  fill="#dc2626"
                  transform={`rotate(${orientationAngle})`}
                />
              </g>

              {/* Labels */}
              <text x="100" y="115" textAnchor="middle" fontSize="6" fill="#374151">
                {layout.cols} × {layout.rows} arrangement
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 shadow-sm transition-all hover:bg-primary/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Modules</div>
          <div className="text-2xl font-black text-foreground tracking-tighter">{panelCount}</div>
        </div>
        <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/10 shadow-sm transition-all hover:bg-green-500/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Architecture</div>
          <div className="text-2xl font-black text-foreground tracking-tighter">{systemSizeKW} <span className="text-xs">kW</span></div>
        </div>
        <div className="bg-orange-500/5 rounded-2xl p-4 border border-orange-500/10 shadow-sm transition-all hover:bg-orange-500/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Usable</div>
          <div className="text-2xl font-black text-foreground tracking-tighter">{Math.round(roofAreaSqM * usableAreaPercentage / 100)} <span className="text-xs">m²</span></div>
        </div>
        <div className="bg-purple-500/5 rounded-2xl p-4 border border-purple-500/10 shadow-sm transition-all hover:bg-purple-500/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">Vector</div>
          <div className="text-2xl font-black text-foreground tracking-tighter capitalize">{orientation}</div>
        </div>
      </div>

      {/* AI confidence indicator */}
      {usedAI && aiConfidence !== undefined && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-muted/20 backdrop-blur-md rounded-[2rem] px-8 py-6 border border-border/50 gap-4 mt-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-foreground tracking-tight leading-tight">AI-Core Analysis</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Neural Vision Integrity</span>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white/50 px-6 py-3 rounded-2xl border border-border/40 shadow-sm w-full md:w-auto">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Confidence</span>
            <div className="flex-1 md:w-32 bg-muted/40 rounded-full h-3 overflow-hidden border border-border/30">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${aiConfidence >= 70 ? 'bg-gradient-to-r from-green-400 to-primary' :
                  aiConfidence >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-pink-400'
                  }`}
                style={{ width: `${aiConfidence}%` }}
              />
            </div>
            <span className="text-lg font-black text-foreground tracking-tighter">{aiConfidence}%</span>
          </div>
        </div>
      )}

      {!usedAI && (
        <div className="flex items-center gap-4 bg-amber-500/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-amber-500/20 shadow-sm mt-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <span className="text-xs font-bold text-amber-900 leading-snug">
            Heuristic Estimation Active. <span className="text-amber-700/60 font-medium">Activate AI-Vision for architectural validation.</span>
          </span>
        </div>
      )}
    </div>
  );
}
