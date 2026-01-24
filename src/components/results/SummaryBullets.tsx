interface SummaryBulletsProps {
  systemSizeKW: number;
  panelCount: number;
  annualProductionKWh: number;
  roofArea: number;
  layoutSuggestion: string;
}

export function SummaryBullets({
  systemSizeKW,
  panelCount,
  annualProductionKWh,
  roofArea,
  layoutSuggestion,
}: SummaryBulletsProps) {
  const items = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'System Size',
      value: `${systemSizeKW} kW`,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      label: 'Panels Recommended',
      value: `${panelCount} panels`,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: 'Est. Annual Production',
      value: `${annualProductionKWh.toLocaleString()} kWh`,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Usable Roof Area',
      value: `${roofArea} m²`,
      color: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.label} className="group/item">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white scale-90 group-hover/item:scale-100 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">{item.label}</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tighter ml-11">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-white/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Architectural Core</p>
            <p className="text-sm font-bold text-white leading-relaxed">{layoutSuggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
