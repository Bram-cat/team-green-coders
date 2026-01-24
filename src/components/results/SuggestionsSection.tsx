import { Suggestion } from '@/types/analysis';

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  shading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  orientation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    </svg>
  ),
  equipment: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  maintenance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  // Sort suggestions by priority (high first)
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      {sortedSuggestions.map((suggestion, index) => (
        <div
          key={index}
          className="group relative flex items-start gap-6 p-6 bg-white rounded-[1.5rem] border border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center shadow-inner text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {categoryIcons[suggestion.category]}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                {suggestion.title}
              </h4>
              <span
                className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm ${suggestion.priority === 'high'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : suggestion.priority === 'medium'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-green-50 text-green-600 border-green-100'
                  }`}
              >
                {suggestion.priority}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {suggestion.description}
            </p>
          </div>

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
