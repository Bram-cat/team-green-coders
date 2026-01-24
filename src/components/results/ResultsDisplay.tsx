import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuitabilityScore } from './SuitabilityScore';
import { SummaryBullets } from './SummaryBullets';
import { SuggestionsSection } from './SuggestionsSection';
import { FinancialSummary } from './FinancialSummary';
import { SolarPanelVisualization } from './SolarPanelVisualization';
import { ImageGenerationPanel } from './ImageGenerationPanel';
import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from '@/types/analysis';
import { GeocodedLocation } from '@/types/address';
import { GeneratedPanelImage } from '@/lib/services/imageGenerationService';

interface ResultsDisplayProps {
  recommendation: SolarRecommendation;
  roofAnalysis: RoofAnalysisResult;
  solarPotential: SolarPotentialResult;
  onReset: () => void;
  // AI-related props
  aiConfidence?: number;
  usedAI?: boolean;
  usedRealGeocoding?: boolean;
  geocodedLocation?: GeocodedLocation;
  uploadedImageBase64?: string;
  aiSummary?: string;
  imagePrompts?: GeneratedPanelImage[];
}

export function ResultsDisplay({
  recommendation,
  roofAnalysis,
  solarPotential,
  onReset,
  aiConfidence,
  usedAI = false,
  usedRealGeocoding = false,
  geocodedLocation,
  uploadedImageBase64,
  aiSummary,
  imagePrompts,
}: ResultsDisplayProps) {
  // Use AI summary if available, otherwise use the default explanation
  const displayExplanation = aiSummary || recommendation.explanation;

  return (
    <div className="space-y-6">
      {/* Suitability Score */}
      <Card>
        <SuitabilityScore
          score={recommendation.suitabilityScore}
          explanation={displayExplanation}
        />
        {/* Location info if geocoded */}
        {geocodedLocation && usedRealGeocoding && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{geocodedLocation.formattedAddress}</span>
            </div>
          </div>
        )}
      </Card>

      {/* AI-Generated Visualizations */}
      {imagePrompts && imagePrompts.length > 0 && (
        <Card>
          <ImageGenerationPanel
            imagePrompts={imagePrompts}
            address={geocodedLocation?.formattedAddress || 'Your Property'}
          />
        </Card>
      )}

      {/* Panel Visualization */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Panel Layout Schematic
        </h2>
        <SolarPanelVisualization
          uploadedImageUrl={uploadedImageBase64}
          panelCount={recommendation.panelCount}
          roofAreaSqM={roofAnalysis.roofAreaSqMeters}
          usableAreaPercentage={roofAnalysis.usableAreaPercentage}
          systemSizeKW={recommendation.systemSizeKW}
          aiConfidence={aiConfidence}
          usedAI={usedAI}
        />
      </Card>

      {/* System Summary */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Summary</h2>
        <SummaryBullets
          systemSizeKW={recommendation.systemSizeKW}
          panelCount={recommendation.panelCount}
          annualProductionKWh={recommendation.estimatedAnnualProductionKWh}
          roofArea={Math.round(roofAnalysis.roofAreaSqMeters * (roofAnalysis.usableAreaPercentage / 100))}
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
