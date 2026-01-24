import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface SuitabilityScoreProps {
  score: number;
  explanation: string;
}

export function SuitabilityScore({ score, explanation }: SuitabilityScoreProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-2">
        <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Potential Index</h2>
        <div className="h-1 w-12 bg-primary/30 mx-auto rounded-full" />
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-colors duration-1000" />
        <div className="relative border-8 border-primary/10 p-2 rounded-full">
          <ScoreBadge score={score} size="lg" />
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <h3 className="text-3xl font-black text-foreground tracking-tighter">Your Environmental Architecture</h3>
        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <p className="text-lg text-foreground/80 leading-relaxed font-medium italic">
            &ldquo;{explanation}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
