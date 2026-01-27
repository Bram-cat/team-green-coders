import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoofAnalysisResult, SolarPotentialResult } from '@/types/analysis';
import { SolarCompaniesCard } from './SolarCompaniesCard';
import { SavingsCalculator } from '@/components/calculators/SavingsCalculator';

interface ImprovementResultsDisplayProps {
  currentInstallation: {
    panelCount: number;
    estimatedSystemSizeKW: number;
    currentEfficiency: number;
    orientation: string;
    panelCondition: string;
  };
  improvements: {
    potentialEfficiency: number;
    efficiencyGain: number;
    suggestions: Array<{
      type: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedEfficiencyGain: number;
      estimatedCost?: number;
    }>;
    estimatedAdditionalProductionKWh: number;
  };
  roofAnalysis: RoofAnalysisResult;
  solarPotential: SolarPotentialResult;
  onReset: () => void;
  uploadedImageBase64?: string;
  aiConfidence?: number;
}

export function ImprovementResultsDisplay({
  currentInstallation,
  improvements,
  roofAnalysis,
  solarPotential,
  onReset,
  uploadedImageBase64,
  aiConfidence,
}: ImprovementResultsDisplayProps) {
  const priorityColors = {
    high: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800',
    medium: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800',
    low: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800',
  };

  const priorityIcons = {
    high: '�',
    medium: '⚡',
    low: '✅',
  };

  // Determine confidence level
  const isLowConfidence = aiConfidence && aiConfidence < 70;
  const isMediumConfidence = aiConfidence && aiConfidence >= 70 && aiConfidence < 85;

  return (
    <div className="space-y-6">
      {/* Low Confidence Warning */}
      {isLowConfidence && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Low Confidence Analysis ({aiConfidence}%)
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                  Our AI analysis has <strong>{aiConfidence}% confidence</strong> in these estimates due to image quality, viewing angle, or panel visibility. The numbers shown may be less accurate than usual.
                </p>
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 text-sm text-amber-900 dark:text-amber-200">
                  <p className="font-medium mb-2">For more accurate results, try:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Uploading a closer, higher-resolution photo</li>
                    <li>Taking an aerial or rooftop photo showing panels clearly</li>
                    <li>Providing multiple images from different angles</li>
                    <li>Ensuring good lighting and minimal shadows</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medium Confidence Notice */}
      {isMediumConfidence && (
        <Card className="border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                AI confidence: <strong>{aiConfidence}%</strong>. These estimates are reasonably accurate, but uploading additional images may improve precision.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Installation Status */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Current Installation</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {currentInstallation.panelCount} - {currentInstallation.panelCount + 7}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Panels</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {currentInstallation.estimatedSystemSizeKW} - {((currentInstallation.panelCount + 7) * (currentInstallation.estimatedSystemSizeKW / currentInstallation.panelCount)).toFixed(1)} kW
              </div>
              <div className="text-sm text-muted-foreground mt-1">System Size</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-primary">{currentInstallation.currentEfficiency}%</div>
              <div className="text-sm text-muted-foreground mt-1">Current Efficiency</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-background rounded border">
              <span className="text-muted-foreground">Orientation:</span>
              <span className="font-medium text-foreground">{currentInstallation.orientation}</span>
            </div>
            <div className="flex justify-between p-3 bg-background rounded border">
              <span className="text-muted-foreground">Panel Condition:</span>
              <span className="font-medium text-foreground">{currentInstallation.panelCondition}</span>
            </div>
          </div>

          {aiConfidence && (
            <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI Analysis Confidence: {aiConfidence}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Image */}
      {uploadedImageBase64 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Solar Installation</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImageBase64}
              alt="Uploaded solar installation"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Improvement Potential */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Improvement Potential</h2>

          <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Potential Efficiency</div>
                <div className="text-4xl font-bold text-primary">{improvements.potentialEfficiency}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Efficiency Gain</div>
                <div className="text-4xl font-bold text-accent">+{improvements.efficiencyGain.toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Additional Production</div>
                <div className="text-2xl font-bold text-foreground">
                  {improvements.estimatedAdditionalProductionKWh.toLocaleString()} kWh/year
                </div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">
            By implementing the suggested improvements, you could increase your system&apos;s efficiency from{' '}
            <span className="font-semibold text-foreground">{currentInstallation.currentEfficiency}%</span> to{' '}
            <span className="font-semibold text-primary">{improvements.potentialEfficiency}%</span>, adding an estimated{' '}
            <span className="font-semibold text-foreground">
              {improvements.estimatedAdditionalProductionKWh.toLocaleString()} kWh
            </span>{' '}
            of annual energy production.
          </p>
        </CardContent>
      </Card>

      {/* Interactive Savings Calculator */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">Improved System Savings</h2>
            <p className="text-muted-foreground text-sm">
              See how the suggested improvements will impact your energy savings and payback period.
              Adjust your monthly bill to see personalized projections.
            </p>
          </div>
          <SavingsCalculator
            systemSizeKW={currentInstallation.estimatedSystemSizeKW}
            annualProductionKWh={
              // Current production + additional from improvements
              currentInstallation.estimatedSystemSizeKW * 1174.9 + improvements.estimatedAdditionalProductionKWh
            }
            installationCost={
              // Calculate total improvement cost from suggestions
              improvements.suggestions.reduce((total, s) => total + (s.estimatedCost || 0), 0)
            }
            defaultMonthlyBill={174}
          />
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recommended Improvements</h2>

          {improvements.suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your solar installation is already performing optimally!</p>
              <p className="text-sm mt-2">No major improvements detected at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {improvements.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${priorityColors[suggestion.priority]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{priorityIcons[suggestion.priority]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium">+{suggestion.estimatedEfficiencyGain}% efficiency</span>
                          {suggestion.estimatedCost && (
                            <span className="text-muted-foreground">
                              ~${suggestion.estimatedCost.toLocaleString()} CAD
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{suggestion.description}</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-background/50">
                          {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roof & Solar Data */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Property Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Roof Area:</span>
              <span className="font-medium text-foreground">{roofAnalysis.roofAreaSqMeters} m²</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Usable Area:</span>
              <span className="font-medium text-foreground">{roofAnalysis.usableAreaPercentage}%</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Shading Level:</span>
              <span className="font-medium text-foreground capitalize">{roofAnalysis.shadingLevel}</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Roof Pitch:</span>
              <span className="font-medium text-foreground">{roofAnalysis.roofPitchDegrees}°</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Peak Sun Hours:</span>
              <span className="font-medium text-foreground">{solarPotential.peakSunHoursPerDay} hrs/day</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/30 rounded">
              <span className="text-muted-foreground">Solar Potential:</span>
              <span className="font-medium text-foreground">
                {solarPotential.yearlySolarPotentialKWh.toLocaleString()} kWh/year
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solar Companies */}
      <SolarCompaniesCard
        title="Professional Solar Installers in PEI"
        description="Contact these certified local companies for system upgrades, maintenance, and optimization services."
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onReset} variant="outline" className="flex-1">
          Analyze Another Installation
        </Button>
      </div>
    </div>
  );
}
