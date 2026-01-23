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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className={`${item.color} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <span className="text-sm font-medium opacity-80">{item.label}</span>
            </div>
            <div className="text-xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <div>
            <p className="font-medium text-gray-900 mb-1">Layout Recommendation</p>
            <p className="text-sm text-gray-600">{layoutSuggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
