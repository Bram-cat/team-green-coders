"use client"

import { useState, useMemo, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Zap } from 'lucide-react'
import { PEI_ELECTRICITY_RATES } from '@/lib/data/peiSolarData'
import { ScreenReaderAnnouncement } from '@/components/ui/ScreenReaderAnnouncement'

interface SavingsCalculatorProps {
  systemSizeKW: number
  annualProductionKWh: number
  installationCost: number
  defaultMonthlyBill?: number
}

export function SavingsCalculator({
  systemSizeKW,
  annualProductionKWh,
  installationCost,
  defaultMonthlyBill = 174
}: SavingsCalculatorProps) {
  const [monthlyBill, setMonthlyBill] = useState(defaultMonthlyBill)
  const [announcement, setAnnouncement] = useState('')

  // Calculate savings based on slider value
  const calculations = useMemo(() => {
    const annualBill = monthlyBill * 12
    const monthlyConsumption = (annualBill - (PEI_ELECTRICITY_RATES.monthlyBasicCharge * 12)) /
      (PEI_ELECTRICITY_RATES.residentialRate * 12)
    const annualConsumption = monthlyConsumption * 12

    // Calculate coverage percentage
    const coveragePercent = Math.min(100, (annualProductionKWh / annualConsumption) * 100)

    // Calculate annual savings
    const annualSavings = (annualProductionKWh * PEI_ELECTRICITY_RATES.residentialRate)
    const monthlySavings = annualSavings / 12

    // Calculate offset percentage
    const offsetPercent = Math.min(100, Math.round(coveragePercent))

    // Payback calculation
    const simplePayback = installationCost / annualSavings

    // 25-year savings with 3% rate increase
    let totalSavings = 0
    let currentProduction = annualProductionKWh
    let currentRate = PEI_ELECTRICITY_RATES.residentialRate
    for (let year = 1; year <= 25; year++) {
      totalSavings += currentProduction * currentRate
      currentProduction *= 0.995 // 0.5% degradation
      currentRate *= 1.03 // 3% rate increase
    }

    const netProfit = totalSavings - installationCost

    return {
      monthlyBill,
      annualBill,
      annualConsumption,
      coveragePercent,
      monthlySavings,
      annualSavings,
      offsetPercent,
      simplePayback,
      twentyFiveYearSavings: totalSavings,
      netProfit
    }
  }, [monthlyBill, annualProductionKWh, installationCost])

  // Announce changes to screen readers with debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      setAnnouncement(
        `Monthly bill set to $${monthlyBill}. Monthly savings: $${calculations.monthlySavings.toFixed(0)}. Annual savings: $${calculations.annualSavings.toFixed(0)}.`
      )
    }, 500)
    return () => clearTimeout(debounce)
  }, [monthlyBill, calculations.monthlySavings, calculations.annualSavings])

  return (
    <>
      <ScreenReaderAnnouncement message={announcement} />
      <div className="space-y-10">
        {/* Slider Section */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-border/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />

        <div className="space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Energy Consumption Profile</h4>
              <p className="text-2xl font-black text-foreground tracking-tight">Average Monthly Electric Bill</p>
            </div>
            <div className="bg-primary/5 px-8 py-4 rounded-[2rem] border border-primary/10">
              <div className="text-4xl font-black text-primary tracking-tighter">
                ${monthlyBill.toFixed(0)} <span className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-2">CAD / Mo</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 flex items-center">
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(parseFloat(e.target.value))}
                aria-label="Adjust monthly electricity bill"
                aria-valuemin={50}
                aria-valuemax={500}
                aria-valuenow={monthlyBill}
                aria-valuetext={`$${monthlyBill} CAD per month`}
                className="w-full h-2.5 bg-muted rounded-full appearance-none cursor-pointer slider-premium"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((monthlyBill - 50) / 450) * 100}%, hsl(var(--muted)) ${((monthlyBill - 50) / 450) * 100}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>
            <div className="flex justify-between px-2">
              {[50, 150, 250, 350, 500].map((val) => (
                <div key={val} className="flex flex-col items-center gap-2">
                  <div className={`h-1.5 w-0.5 rounded-full ${monthlyBill >= val ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`text-[10px] font-black tracking-widest ${monthlyBill >= val ? 'text-primary' : 'text-muted-foreground/40'}`}>${val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Monthly Return"
          value={`$${calculations.monthlySavings.toFixed(0)}`}
          subtext="Net Utility Offset"
          color="text-emerald-600"
          bgColor="bg-emerald-500/5"
        />
        <MetricCard
          icon={<Calendar className="h-5 w-5" />}
          label="Annual Yield"
          value={`$${calculations.annualSavings.toFixed(0)}`}
          subtext="Projected Savings"
          color="text-blue-600"
          bgColor="bg-blue-500/5"
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Reliance Offset"
          value={`${calculations.offsetPercent}%`}
          subtext="Energy Independence"
          color="text-orange-600"
          bgColor="bg-orange-500/5"
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Amortization"
          value={`${calculations.simplePayback.toFixed(1)}`}
          subtext="Years to Break-Even"
          color="text-primary"
          bgColor="bg-primary/5"
        />
      </div>

      {/* 25-Year Projection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-foreground text-background rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[100px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-primary/30" />

          <div className="relative z-10 space-y-10">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Wealth Accumulation</h4>
              <p className="text-3xl font-black tracking-tighter text-white">25-Year Financial projection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <div className="text-5xl font-black text-white tracking-tighter">
                  ${calculations.twentyFiveYearSavings.toLocaleString()}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">Total Lifetime Accumulation</p>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-black text-primary tracking-tighter">
                  ${calculations.netProfit.toLocaleString()}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-none">Net Profit (Post-Amortization)</p>
              </div>
            </div>

            <div className="pt-10 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="text-white/60">Break-Even Progress</span>
                <span className="text-primary">Year {Math.ceil(calculations.simplePayback)} of 25</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min(100, (calculations.simplePayback / 25) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] font-medium text-white/40 leading-relaxed max-w-xl italic">
                * Projections include a 0.5% annual panel degradation factor and a 3% annual utility rate increase adjustment based on Maritime Electric historical data.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Card */}
        <div className="bg-white rounded-[3.5rem] p-10 border border-border/40 shadow-2xl flex flex-col justify-between">
          <div className="space-y-8">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Portfolio Edge</h4>
              <p className="text-2xl font-black text-foreground tracking-tight leading-tight">Cost Comparison</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Traditional Grid</span>
                  <span className="text-destructive">$25yr Exposure</span>
                </div>
                <div className="text-2xl font-black tracking-tighter text-foreground">
                  ${(calculations.annualBill * 25 * 1.4).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Solar Hybrid</span>
                  <span className="text-emerald-600">Optimized Cost</span>
                </div>
                <div className="text-2xl font-black tracking-tighter text-foreground">
                  ${(installationCost + (calculations.annualBill * 25 * 1.4 - calculations.twentyFiveYearSavings)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border mt-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Total Managed Savings</div>
            <div className="text-4xl font-black tracking-tighter text-primary">
              ${calculations.netProfit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-premium::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 32px;
          background: hsl(var(--primary));
          border: 4px solid white;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }
        .slider-premium::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3);
        }
        .slider-premium::-moz-range-thumb {
          width: 32px;
          height: 32px;
          background: hsl(var(--primary));
          border: 4px solid white;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      </div>
    </>
  )
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color,
  bgColor
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 space-y-4 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all group">
      <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
        <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{subtext}</p>
      </div>
    </div>
  )
}
