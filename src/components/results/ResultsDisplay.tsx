import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuitabilityScore } from './SuitabilityScore';
import { SummaryBullets } from './SummaryBullets';
import { SuggestionsSection } from './SuggestionsSection';
import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from '@/types/analysis';

interface ResultsDisplayProps {
  recommendation: SolarRecommendation;
  roofAnalysis: RoofAnalysisResult;
  solarPotential: SolarPotentialResult;
  onReset: () => void;
}

export function ResultsDisplay({
  recommendation,
  roofAnalysis,
  onReset,
}: ResultsDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <SuitabilityScore
          score={recommendation.suitabilityScore}
          explanation={recommendation.explanation}
        />
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Summary</h2>
        <SummaryBullets
          systemSizeKW={recommendation.systemSizeKW}
          panelCount={recommendation.panelCount}
          annualProductionKWh={recommendation.estimatedAnnualProductionKWh}
          roofArea={roofAnalysis.roofAreaSqMeters}
          layoutSuggestion={recommendation.layoutSuggestion}
        />
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
        <SuggestionsSection suggestions={recommendation.suggestions} />
      </Card>

      <div className="text-center">
        <Button variant="secondary" onClick={onReset} className="px-8">
          Analyze another property
        </Button>
      </div>
    </div>
  );
}
