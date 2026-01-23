import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from './analysis';

export interface AnalyzeResponse {
  success: true;
  data: {
    recommendation: SolarRecommendation;
    roofAnalysis: RoofAnalysisResult;
    solarPotential: SolarPotentialResult;
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
