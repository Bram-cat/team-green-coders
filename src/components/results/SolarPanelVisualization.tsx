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
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-700">{panelCount}</div>
          <div className="text-xs text-blue-600">Panels</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <div className="text-lg font-bold text-green-700">{systemSizeKW} kW</div>
          <div className="text-xs text-green-600">System Size</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="text-lg font-bold text-orange-700">{Math.round(roofAreaSqM * usableAreaPercentage / 100)} m²</div>
          <div className="text-xs text-orange-600">Usable Area</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <div className="text-lg font-bold text-purple-700 capitalize">{orientation}</div>
          <div className="text-xs text-purple-600">Orientation</div>
        </div>
      </div>

      {/* AI confidence indicator */}
      {usedAI && aiConfidence !== undefined && (
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 py-2 border border-blue-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">AI-Powered Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${aiConfidence >= 70 ? 'bg-green-500' :
                  aiConfidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${aiConfidence}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">{aiConfidence}%</span>
          </div>
        </div>
      )}

      {!usedAI && (
        <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-4 py-2 border border-amber-200">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-amber-800">
            Using estimated values. Enable AI analysis for more accurate results.
          </span>
        </div>
      )}
    </div>
  );
}
