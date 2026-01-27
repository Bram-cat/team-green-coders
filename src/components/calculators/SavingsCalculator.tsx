"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DollarSign, TrendingUp, Calendar, Zap } from 'lucide-react'
import { PEI_ELECTRICITY_RATES, PEI_SOLAR_DATA } from '@/lib/data/peiSolarData'

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

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Real-Time Savings Calculator
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust your monthly bill to see personalized savings estimates
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Average Monthly Electric Bill
              </Label>
              <div className="text-2xl font-bold text-primary">
                ${monthlyBill.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">CAD/month</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(parseFloat(e.target.value))}
                className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((monthlyBill - 50) / 450) * 100}%, hsl(var(--muted)) ${((monthlyBill - 50) / 450) * 100}%, hsl(var(--muted)) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$50</span>
                <span>$275</span>
                <span>$500</span>
              </div>
            </div>

            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                background: hsl(var(--primary));
                border: 3px solid white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              }
              .slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                background: hsl(var(--primary));
                border: 3px solid white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              }
            `}</style>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Monthly Savings"
              value={`$${calculations.monthlySavings.toFixed(0)}`}
              subtext="per month"
              color="text-green-600 dark:text-green-400"
            />
            <MetricCard
              icon={<Calendar className="h-4 w-4" />}
              label="Annual Savings"
              value={`$${calculations.annualSavings.toFixed(0)}`}
              subtext="per year"
              color="text-blue-600 dark:text-blue-400"
            />
            <MetricCard
              icon={<Zap className="h-4 w-4" />}
              label="Bill Offset"
              value={`${calculations.offsetPercent}%`}
              subtext="of your bill"
              color="text-amber-600 dark:text-amber-400"
            />
            <MetricCard
              icon={<DollarSign className="h-4 w-4" />}
              label="Payback Period"
              value={`${calculations.simplePayback.toFixed(1)}`}
              subtext="years"
              color="text-purple-600 dark:text-purple-400"
            />
          </div>

          {/* 25-Year Projection */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 space-y-3">
            <h4 className="font-bold text-foreground text-lg">25-Year Financial Projection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Lifetime Savings</div>
                <div className="text-3xl font-bold text-foreground">
                  ${calculations.twentyFiveYearSavings.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Net Profit After Installation</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${calculations.netProfit.toLocaleString()}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Projection includes 0.5% annual panel degradation and 3% annual electricity rate increases.
              Actual savings may vary based on energy consumption patterns and rate changes.
            </p>
          </div>

          {/* Break-even visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Break-even progress</span>
              <span className="font-semibold text-foreground">
                Year {Math.ceil(calculations.simplePayback)} of 25
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${Math.min(100, (calculations.simplePayback / 25) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              After break-even, all savings are pure profit for the remaining {Math.max(0, 25 - Math.ceil(calculations.simplePayback))} years
            </p>
          </div>

          {/* Comparison */}
          <div className="border-t pt-4 space-y-3">
            <h5 className="font-semibold text-foreground text-sm">Cost Comparison</h5>
            <div className="space-y-2">
              <ComparisonRow
                label="Without Solar (25 years)"
                amount={calculations.annualBill * 25 * 1.4}
                color="text-red-600 dark:text-red-400"
              />
              <ComparisonRow
                label="With Solar (25 years)"
                amount={installationCost + (calculations.annualBill * 25 * 1.4 - calculations.twentyFiveYearSavings)}
                color="text-green-600 dark:text-green-400"
              />
              <div className="pt-2 border-t">
                <ComparisonRow
                  label="Your Savings"
                  amount={calculations.netProfit}
                  color="text-primary"
                  bold
                />
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
}) {
  return (
    <div className="bg-background border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className={color}>{icon}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{subtext}</div>
    </div>
  )
}

function ComparisonRow({
  label,
  amount,
  color,
  bold = false
}: {
  label: string
  amount: number
  color: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-bold' : ''} text-foreground`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-lg' : ''} ${color}`}>
        ${amount.toLocaleString()}
      </span>
    </div>
  )
}
