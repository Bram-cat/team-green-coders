import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuitabilityScore } from './SuitabilityScore';
import { SummaryBullets } from './SummaryBullets';
import { SuggestionsSection } from './SuggestionsSection';
import { FinancialSummary } from './FinancialSummary';
import { SolarPanelVisualization } from './SolarPanelVisualization';
import { SolarCompaniesCard } from './SolarCompaniesCard';
import { SavingsCalculator } from '@/components/calculators/SavingsCalculator';
import { SeasonalProductionChart } from '@/components/charts/SeasonalProductionChart';
import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from '@/types/analysis';
import { GeocodedLocation } from '@/types/address';

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
}: ResultsDisplayProps) {
  // Use AI summary if available, otherwise use the default explanation
  const displayExplanation = aiSummary || recommendation.explanation;

  return (
    <div className="animate-in pb-32 max-w-6xl mx-auto space-y-24">
      {/* 1. HERO - Header & Suitability */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-border/50">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
              Architectural Audit v3
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
              Analysis <span className="text-primary">Ready</span>
            </h1>
          </div>
          {geocodedLocation && usedRealGeocoding && (
            <div className="flex items-center gap-4 bg-white p-5 rounded-[2.5rem] shadow-2xl border border-border/50 max-w-sm">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Site Index</span>
                <span className="text-base font-black text-foreground tracking-tight truncate leading-tight">{geocodedLocation.formattedAddress}</span>
              </div>
            </div>
          )}
        </div>

        <SuitabilityScore
          score={recommendation.suitabilityScore}
          explanation={displayExplanation}
        />
      </section>

      {/* 2. THE VISION - Active Schematic */}
      <section className="space-y-10 group">
        <div className="flex items-center gap-8">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none whitespace-nowrap">
            Vision <span className="text-primary italic">Mapping</span>
          </h2>
          <div className="h-0.5 w-full bg-border/40" />
          <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full shadow-xl border border-border/50 text-primary">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black tracking-[0.2em] uppercase">Active Simulation</span>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl border border-border/30 relative overflow-hidden transition-all duration-700 hover:shadow-primary/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
          <SolarPanelVisualization
            uploadedImageUrl={uploadedImageBase64}
            panelCount={recommendation.panelCount}
            roofAreaSqM={roofAnalysis.roofAreaSqMeters}
            usableAreaPercentage={roofAnalysis.usableAreaPercentage}
            systemSizeKW={recommendation.systemSizeKW}
            aiConfidence={aiConfidence}
            usedAI={usedAI}
          />
        </div>
      </section>

      {/* 3. PERFORMANCE DATA - Financials & Tech */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Economic <span className="text-accent">Yield</span></h3>
            <p className="text-muted-foreground font-medium text-lg leading-snug">Projected financial performance based on Atlantic Canada baseline rates ($0.174/kWh).</p>
          </div>
          {recommendation.financials && (
            <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-border/40 h-full">
              <FinancialSummary financials={recommendation.financials} />
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-foreground text-right md:text-left">Technical <span className="text-primary">Specs</span></h3>
            <p className="text-muted-foreground font-medium text-lg leading-snug">High-precision architecture results calculated using site-specific irradiance vectors.</p>
          </div>
          <div className="bg-primary text-primary-foreground rounded-[3.5rem] p-12 shadow-2xl shadow-primary/20 h-full flex flex-col justify-center">
            <SummaryBullets
              systemSizeKW={recommendation.systemSizeKW}
              panelCount={recommendation.panelCount}
              annualProductionKWh={recommendation.estimatedAnnualProductionKWh}
              roofArea={Math.round(roofAnalysis.roofAreaSqMeters * (roofAnalysis.usableAreaPercentage / 100))}
              layoutSuggestion={recommendation.layoutSuggestion}
            />
          </div>
        </div>
      </section>

      {/* 3.5 INTERACTIVE SAVINGS CALCULATOR */}
      {recommendation.financials && (
        <section className="space-y-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
              Dynamic <span className="text-primary">Savings</span> Simulator
            </h3>
            <p className="text-muted-foreground font-medium text-lg leading-snug max-w-3xl">
              Adjust your monthly electricity bill to see personalized savings projections.
              Our real-time calculator shows how solar fits your specific energy consumption.
            </p>
          </div>
          <SavingsCalculator
            systemSizeKW={recommendation.systemSizeKW}
            annualProductionKWh={recommendation.estimatedAnnualProductionKWh}
            installationCost={recommendation.financials.totalSystemCost}
            defaultMonthlyBill={174}
          />
        </section>
      )}

      {/* 3.75 SEASONAL PRODUCTION VISUALIZATION */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Seasonal <span className="text-accent">Production</span> Analysis
          </h3>
          <p className="text-muted-foreground font-medium text-lg leading-snug max-w-3xl">
            Understand how your solar system performs throughout the year. PEI's seasonal patterns
            show strong summer production and reduced winter output.
          </p>
        </div>
        <SeasonalProductionChart
          systemSizeKW={recommendation.systemSizeKW}
          title="Monthly Energy Production Forecast"
        />
      </section>

      {/* 4. EXECUTION ROADMAP */}
      <section className="bg-muted/10 rounded-[5rem] p-10 md:p-20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:scale-125">
          <svg className="w-96 h-96 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3L4 14h7v7l9-11h-7z" /></svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
              Strategic <span className="text-primary italic">Roadmap</span>
            </h2>
            <div className="h-1 w-24 bg-primary/20 mx-auto rounded-full" />
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Validated next steps to transition your property to an energy-independent architecture.
            </p>
          </div>

          <SuggestionsSection suggestions={recommendation.suggestions} />
        </div>
      </section>

      {/* 4.5. CERTIFIED INSTALLERS */}
      <section className="max-w-4xl mx-auto">
        <SolarCompaniesCard
          title="Certified PEI Solar Installers"
          description="Contact these top-rated local companies for professional installation quotes and consultations."
        />
      </section>

      {/* 5. FINISH / CTA */}
      <div className="flex flex-col items-center gap-8 pt-12">
        <div className="h-32 w-px bg-gradient-to-b from-primary/40 to-transparent" />
        <Button variant="outline" onClick={onReset} className="px-12 h-24 rounded-[3rem] font-black text-2xl hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-500 group shadow-2xl bg-white border-2 hover:scale-105">
          <svg className="mr-6 w-8 h-8 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Initialize New Assessment
        </Button>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">System Release 2.5 &bull; Core Optimized</p>
      </div>
    </div>
  );
}
