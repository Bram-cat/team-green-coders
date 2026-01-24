/**
 * NASA POWER API Service
 * 
 * Fetches location-specific solar irradiance data from NASA POWER API
 * https://power.larc.nasa.gov/docs/services/api/
 */

export interface NASAPowerData {
  annualGHI: number; // kWh/m²/year
  monthlyGHI: number[]; // kWh/m²/day for each month
  averagePeakSunHours: number; // hours/day
  photovoltaicPotential: number; // kWh/kWp/year
  dataSource: 'nasa' | 'cached' | 'default';
  location: {
    latitude: number;
    longitude: number;
  };
}

interface NASAPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

// Cache for API responses (24 hour TTL)
const cache = new Map<string, { data: NASAPowerData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch solar irradiance data from NASA POWER API
 */
export async function fetchNASAPowerData(
  latitude: number,
  longitude: number
): Promise<NASAPowerData> {
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[NASA POWER] Using cached data for', cacheKey);
    return { ...cached.data, dataSource: 'cached' };
  }

  try {
    // Get data for the past year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    const url = new URL('https://power.larc.nasa.gov/api/temporal/daily/point');
    url.searchParams.append('parameters', 'ALLSKY_SFC_SW_DWN');
    url.searchParams.append('community', 'RE');
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('start', startStr);
    url.searchParams.append('end', endStr);
    url.searchParams.append('format', 'JSON');

    console.log('[NASA POWER] Fetching data from API:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
    }

    const data: NASAPowerResponse = await response.json();
    const irradianceData = data.properties.parameter.ALLSKY_SFC_SW_DWN;

    // Calculate monthly averages
    const monthlyGHI = calculateMonthlyAverages(irradianceData);
    
    // Calculate annual GHI (sum of daily values)
    const annualGHI = Math.round(
      Object.values(irradianceData).reduce((sum, val) => sum + val, 0)
    );

    // Calculate average peak sun hours (annual GHI / 365)
    const averagePeakSunHours = Number((annualGHI / 365).toFixed(2));

    // Calculate photovoltaic potential (kWh/kWp/year)
    // PV potential = Annual GHI * System efficiency (typically 0.75-0.85)
    const systemEfficiency = 0.80; // 80% system efficiency
    const photovoltaicPotential = Math.round(annualGHI * systemEfficiency);

    const result: NASAPowerData = {
      annualGHI,
      monthlyGHI,
      averagePeakSunHours,
      photovoltaicPotential,
      dataSource: 'nasa',
      location: { latitude, longitude },
    };

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    console.log('[NASA POWER] Successfully fetched data:', {
      annualGHI,
      averagePeakSunHours,
      photovoltaicPotential,
    });

    return result;
  } catch (error) {
    console.error('[NASA POWER] Failed to fetch data:', error);
    throw error;
  }
}

/**
 * Calculate monthly average irradiance from daily data
 */
function calculateMonthlyAverages(dailyData: Record<string, number>): number[] {
  const monthlyTotals = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);

  for (const [dateStr, value] of Object.entries(dailyData)) {
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-indexed
    monthlyTotals[month] += value;
    monthlyCounts[month]++;
  }

  return monthlyTotals.map((total, i) => 
    monthlyCounts[i] > 0 ? Number((total / monthlyCounts[i]).toFixed(2)) : 0
  );
}

/**
 * Format date as YYYYMMDD for NASA API
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Get default PEI solar data (fallback)
 */
export function getDefaultPEISolarData(latitude: number, longitude: number): NASAPowerData {
  return {
    annualGHI: 1150,
    monthlyGHI: [1.8, 2.7, 3.6, 4.5, 5.3, 5.8, 5.7, 5.0, 3.9, 2.7, 1.7, 1.4],
    averagePeakSunHours: 3.7,
    photovoltaicPotential: 1450,
    dataSource: 'default',
    location: { latitude, longitude },
  };
}
