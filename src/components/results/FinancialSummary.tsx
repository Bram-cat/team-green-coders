import { FinancialAnalysis, formatCurrency, formatNumber } from '@/lib/calculations/financialCalculations';

interface FinancialSummaryProps {
  financials: FinancialAnalysis;
}

export function FinancialSummary({ financials }: FinancialSummaryProps) {
  return (
    <div className="space-y-10">
      {/* Cost & Savings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* System Cost */}
        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Procurement</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.estimatedSystemCost)}
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
            @ ${financials.costPerWatt.toFixed(2)} / watt installed
          </div>
        </div>

        {/* Annual Savings */}
        <div className="bg-accent/5 rounded-[2rem] p-8 border border-accent/10 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-xs font-black text-accent uppercase tracking-[0.2em]">Annuity Yield</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.annualElectricitySavings)}
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
            ~{formatCurrency(financials.monthlyAverageSavings)} / month avg
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-orange-500/5 rounded-[2rem] p-8 border border-orange-500/10 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-black text-orange-600 uppercase tracking-[0.2em]">Amortization</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {financials.simplePaybackYears} <span className="text-lg">Years</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
            Break-even Timeline
          </div>
        </div>

        {/* Net Wealth Generation */}
        <div className="bg-blue-600/5 rounded-[2rem] p-8 border border-blue-600/10 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Asset Growth</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.twentyFiveYearSavings)}
          </div>
          <div className="text-xs text-blue-600 mt-2 font-black uppercase tracking-widest">
            {financials.returnOnInvestment}% ROI Projection
          </div>
        </div>
      </div>

      {/* PEI Rate Info */}
      <div className="bg-muted/30 rounded-[1.5rem] p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-relaxed">
              PEI Electricity Context: <span className="text-muted-foreground font-medium italic">Based on {financials.utilityName} residential rate of ${financials.electricityRate.toFixed(4)}/kWh with active net metering protocol.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact - High Contrast */}
      <div className="bg-foreground text-background rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-1000" />
        <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-primary italic">Atmospheric Impact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-2 border-l-4 border-primary pl-6">
            <div className="text-5xl font-black tracking-tighter text-white">
              {formatNumber(financials.annualCO2OffsetKg)} <span className="text-lg text-primary uppercase">KG</span>
            </div>
            <div className="text-xs font-black uppercase tracking-widest opacity-60">CO2 Neutralized Per Year</div>
          </div>

          <div className="space-y-2 border-l-4 border-accent pl-6">
            <div className="text-5xl font-black tracking-tighter text-white">
              {financials.equivalentTreesPlanted}
            </div>
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Arboreal Equivalency (Trees)</div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/5 rounded-[1.5rem] border border-white/10 italic text-sm font-medium leading-relaxed">
          Over 25 years, this installation will neutralize {formatNumber(financials.lifetimeCO2OffsetKg)} kg of CO2 &mdash; equivalent to the extraction of {formatNumber(Math.round(financials.lifetimeCO2OffsetKg / 0.21))} driven kilometers.
        </div>
      </div>

      {/* Lifetime Production */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-muted/30 border border-border/50">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Lifetime Output Projection:</span>
          <span className="text-sm font-black text-foreground">{formatNumber(financials.lifetimeProductionKWh)} kWh</span>
        </div>
      </div>
    </div>
  );
}
