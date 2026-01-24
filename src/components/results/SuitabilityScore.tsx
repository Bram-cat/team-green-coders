import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface SuitabilityScoreProps {
  score: number;
  explanation: string;
}

export function SuitabilityScore({ score, explanation }: SuitabilityScoreProps) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150" />
        <div className="relative">
          <ScoreBadge score={score} size="lg" />
          <div className="mt-6">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-1">Solar Potential Index</h2>
            <div className="h-0.5 w-12 bg-primary/30 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl px-4">
        <h3 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-8 leading-[0.9]">
          Your Environmental <span className="text-primary italic">Architecture</span>
        </h3>
        <p className="text-xl text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto italic border-l-4 border-primary/20 pl-8 text-left">
          &ldquo;{explanation}&rdquo;
        </p>
      </div>
    </div>
  );
}
