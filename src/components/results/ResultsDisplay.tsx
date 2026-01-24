import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuitabilityScore } from './SuitabilityScore';
import { SummaryBullets } from './SummaryBullets';
import { SuggestionsSection } from './SuggestionsSection';
import { FinancialSummary } from './FinancialSummary';
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
      {/* Suitability Score */}
      <Card>
        <SuitabilityScore
          score={recommendation.suitabilityScore}
          explanation={recommendation.explanation}
        />
      </Card>

      {/* System Summary */}
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

      {/* Financial Analysis */}
      {recommendation.financials && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Financial Analysis
            <span className="text-sm font-normal text-gray-500 ml-2">(PEI Rates)</span>
          </h2>
          <FinancialSummary financials={recommendation.financials} />
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
        <SuggestionsSection suggestions={recommendation.suggestions} />
      </Card>

      {/* Reset Button */}
      <div className="text-center">
        <Button variant="secondary" onClick={onReset} className="px-8">
          Analyze another property
        </Button>
      </div>
    </div>
  );
}
