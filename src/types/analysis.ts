export type ShadingLevel = 'low' | 'medium' | 'high';

export interface RoofAnalysisResult {
  roofAreaSqMeters: number;
  shadingLevel: ShadingLevel;
  roofPitchDegrees: number;
  complexity: 'simple' | 'moderate' | 'complex';
  usableAreaPercentage: number;
}

export interface SolarPotentialResult {
  yearlySolarPotentialKWh: number;
  averageIrradianceKWhPerSqM: number;
  optimalPanelCount: number;
  peakSunHoursPerDay: number;
}

export interface SolarRecommendation {
  suitabilityScore: number; // 0-100
  systemSizeKW: number;
  panelCount: number;
  estimatedAnnualProductionKWh: number;
  layoutSuggestion: string;
  explanation: string;
  suggestions: Suggestion[];
  financials?: import('@/lib/calculations/financialCalculations').FinancialAnalysis;
}

export interface Suggestion {
  category: 'shading' | 'orientation' | 'equipment' | 'maintenance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// Re-export financial types from the calculations module
export type { FinancialAnalysis, IncentiveInfo } from '@/lib/calculations/financialCalculations';
