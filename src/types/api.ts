import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from './analysis';
import { GeocodedLocation } from './address';

export interface AnalyzeResponse {
  success: true;
  data: {
    recommendation: SolarRecommendation;
    roofAnalysis: RoofAnalysisResult;
    solarPotential: SolarPotentialResult;
    // AI-related fields
    aiConfidence?: number;
    usedAI: boolean;
    usedRealGeocoding: boolean;
    geocodedLocation?: GeocodedLocation;
    // Image for visualization
    uploadedImageBase64?: string;
    aiSummary?: string;
  };
}

export interface AnalyzeErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type AnalyzeAPIResponse = AnalyzeResponse | AnalyzeErrorResponse;

// Extended roof analysis with AI metadata
export interface ExtendedRoofAnalysis extends RoofAnalysisResult {
  aiConfidence?: number;
  usedAI: boolean;
  orientation?: 'north' | 'south' | 'east' | 'west' | 'flat';
  obstacles?: string[];
}

// Extended solar potential with geocoding metadata
export interface ExtendedSolarPotential extends SolarPotentialResult {
  geocodedLocation: GeocodedLocation;
  usedRealGeocoding: boolean;
}

// Improve feature API responses
export interface ImproveResponse {
  success: true;
  data: {
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
    uploadedImageBase64?: string;
    aiConfidence?: number;
  };
}

export interface ImproveErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ImproveAPIResponse = ImproveResponse | ImproveErrorResponse;
