import { FinancialAnalysis, formatCurrency, formatNumber } from '@/lib/calculations/financialCalculations';

interface FinancialSummaryProps {
  financials: FinancialAnalysis;
}

export function FinancialSummary({ financials }: FinancialSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Cost & Savings Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* System Cost */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-600 opacity-80">Estimated System Cost</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            {formatCurrency(financials.estimatedSystemCost)}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            @ ${financials.costPerWatt.toFixed(2)}/watt installed
          </div>
        </div>

        {/* Annual Savings */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-green-600 opacity-80">Annual Savings</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(financials.annualElectricitySavings)}
          </div>
          <div className="text-xs text-green-500 mt-1">
            ~{formatCurrency(financials.monthlyAverageSavings)}/month
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-orange-600 opacity-80">Payback Period</span>
          </div>
          <div className="text-xl font-bold text-orange-700">
            {financials.simplePaybackYears} years
          </div>
          <div className="text-xs text-orange-500 mt-1">
            Simple payback estimate
          </div>
        </div>

        {/* Net Wealth Generation */}
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium text-purple-600 opacity-80">Net Wealth Generated</span>
          </div>
          <div className="text-xl font-bold text-purple-700">
            {formatCurrency(financials.twentyFiveYearSavings)}
          </div>
          <div className="text-xs text-purple-500 mt-1 font-semibold">
            {financials.returnOnInvestment}% Return on Investment
          </div>
        </div>
      </div>

      {/* PEI Rate Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">PEI Electricity Rate:</span> Based on {financials.utilityName} residential rate of ${financials.electricityRate.toFixed(4)}/kWh with net metering available at the same rate.
            </p>
          </div>
        </div>
      </div>

      {/* Incentives Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Available Incentives & Programs
        </h3>
        <div className="space-y-2">
          {financials.availableIncentives.map((incentive, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${incentive.available
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm ${incentive.available ? 'text-green-800' : 'text-gray-500'
                  }`}>
                  {incentive.name}
                </span>
                {incentive.available ? (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                ) : (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    Not Available
                  </span>
                )}
              </div>
              <p className={`text-xs ${incentive.available ? 'text-green-700' : 'text-gray-500'
                }`}>
                {incentive.description}
              </p>
              {incentive.potentialValue && incentive.available && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Up to {formatCurrency(incentive.potentialValue)} available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Environmental Impact
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-700">
              {formatNumber(financials.annualCO2OffsetKg)} kg
            </div>
            <div className="text-xs text-green-600">CO2 offset per year</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">
              {financials.equivalentTreesPlanted}
            </div>
            <div className="text-xs text-green-600">trees planted equivalent</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-2">
          Over 25 years, this system would offset approximately {formatNumber(financials.lifetimeCO2OffsetKg)} kg of CO2 - equivalent to driving {formatNumber(Math.round(financials.lifetimeCO2OffsetKg / 0.21))} fewer kilometers!
        </div>
      </div>

      {/* Lifetime Production */}
      <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
        <span className="font-medium">Estimated lifetime production:</span>{' '}
        {formatNumber(financials.lifetimeProductionKWh)} kWh over 25 years
      </div>
    </div>
  );
}
