import { FinancialAnalysis, formatCurrency, formatNumber } from '@/lib/calculations/financialCalculations';

interface FinancialSummaryProps {
  financials: FinancialAnalysis;
}

export function FinancialSummary({ financials }: FinancialSummaryProps) {
  return (
    <div className="space-y-12">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-12">
        {/* System Cost */}
        <div className="space-y-2 group/metric">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/metric:bg-primary group-hover/metric:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Capital Req.</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.estimatedSystemCost)}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Net Procurement @ ${financials.costPerWatt.toFixed(2)}/W</p>
        </div>

        {/* Wealth Generation */}
        <div className="space-y-2 group/metric">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/5 flex items-center justify-center text-orange-600 group-hover/metric:bg-orange-500 group-hover/metric:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">25yr Wealth</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.twentyFiveYearSavings)}
          </div>
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">{financials.returnOnInvestment}% Return on Asset</p>
        </div>

        {/* Annual Yield */}
        <div className="space-y-2 group/metric">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent group-hover/metric:bg-accent group-hover/metric:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Annuity</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {formatCurrency(financials.annualElectricitySavings)}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Annual Utility Offset</p>
        </div>

        {/* Amortization */}
        <div className="space-y-2 group/metric">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/5 flex items-center justify-center text-blue-600 group-hover/metric:bg-blue-600 group-hover/metric:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Break Even</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {financials.simplePaybackYears} <span className="text-sm">Yrs</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Capital Recovery Window</p>
        </div>
      </div>

      {/* Environmental Signature */}
      <div className="pt-8 border-t border-border/50">
        <div className="bg-foreground text-background rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-1000" />
          <h4 className="text-[8px] font-black uppercase tracking-[0.5em] mb-6 text-primary">Atmospheric Neutralization</h4>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
              <div className="text-4xl font-black tracking-tighter text-white leading-none mb-1">
                {formatNumber(financials.annualCO2OffsetKg)} <span className="text-xs text-primary font-bold uppercase tracking-widest ml-1">KG / Year</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total CO2 Neutralized</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl font-black text-primary leading-none">{financials.equivalentTreesPlanted}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/60 leading-tight">Arboreal Sync<br />(Trees)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
