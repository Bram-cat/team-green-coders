import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface SuitabilityScoreProps {
  score: number;
  explanation: string;
}

export function SuitabilityScore({ score, explanation }: SuitabilityScoreProps) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Suitability Score</h2>
      <ScoreBadge score={score} size="lg" />
      <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
        {explanation}
      </p>
    </div>
  );
}
