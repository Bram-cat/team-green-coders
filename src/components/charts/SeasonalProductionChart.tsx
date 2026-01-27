"use client"

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import { PEI_MONTHLY_POWER_OUTPUT_100KWP } from '@/lib/data/peiSolarData'

interface SeasonalProductionChartProps {
  systemSizeKW: number
  title?: string
  showComparison?: boolean
}

export function SeasonalProductionChart({
  systemSizeKW,
  title = "Monthly Energy Production",
  showComparison = false
}: SeasonalProductionChartProps) {
  const chartData = useMemo(() => {
    const months = [
      { key: 'january', name: 'Jan', season: 'winter' },
      { key: 'february', name: 'Feb', season: 'winter' },
      { key: 'march', name: 'Mar', season: 'spring' },
      { key: 'april', name: 'Apr', season: 'spring' },
      { key: 'may', name: 'May', season: 'spring' },
      { key: 'june', name: 'Jun', season: 'summer' },
      { key: 'july', name: 'Jul', season: 'summer' },
      { key: 'august', name: 'Aug', season: 'summer' },
      { key: 'september', name: 'Sep', season: 'fall' },
      { key: 'october', name: 'Oct', season: 'fall' },
      { key: 'november', name: 'Nov', season: 'fall' },
      { key: 'december', name: 'Dec', season: 'winter' }
    ]

    return months.map(({ key, name, season }) => {
      const baseProduction = PEI_MONTHLY_POWER_OUTPUT_100KWP[key as keyof typeof PEI_MONTHLY_POWER_OUTPUT_100KWP]
      const scaledProduction = (baseProduction / 100) * systemSizeKW

      return {
        month: name,
        production: Math.round(scaledProduction),
        season,
        // For comparison: show average consumption pattern (optional)
        consumption: showComparison ? Math.round(scaledProduction * 0.85) : undefined
      }
    })
  }, [systemSizeKW, showComparison])

  const totalAnnualProduction = chartData.reduce((sum, month) => sum + month.production, 0)
  const summerAvg = Math.round(
    chartData.filter(m => m.season === 'summer').reduce((sum, m) => sum + m.production, 0) / 3
  )
  const winterAvg = Math.round(
    chartData.filter(m => m.season === 'winter').reduce((sum, m) => sum + m.production, 0) / 3
  )

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on Charlottetown PEI solar irradiance data
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {totalAnnualProduction.toLocaleString()} kWh
            </div>
            <div className="text-xs text-muted-foreground">Total Annual Production</div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
                {showComparison && (
                  <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {showComparison && <Legend />}
              <Area
                type="monotone"
                dataKey="production"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#productionGradient)"
                name="Solar Production"
              />
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#consumptionGradient)"
                  name="Estimated Usage"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">❄️ Winter Avg</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {winterAvg.toLocaleString()} kWh
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">🌸 Spring Avg</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {Math.round(
                chartData.filter(m => m.season === 'spring').reduce((sum, m) => sum + m.production, 0) / 3
              ).toLocaleString()} kWh
            </div>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">☀️ Summer Avg</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {summerAvg.toLocaleString()} kWh
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">🍂 Fall Avg</div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(
                chartData.filter(m => m.season === 'fall').reduce((sum, m) => sum + m.production, 0) / 3
              ).toLocaleString()} kWh
            </div>
          </div>
        </div>

        {/* Key insights */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Seasonal Insights</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Peak production</strong> occurs in{' '}
                {chartData.reduce((max, month) => month.production > max.production ? month : max).month}{' '}
                with {chartData.reduce((max, month) => month.production > max.production ? month : max).production.toLocaleString()} kWh
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Summer produces {((summerAvg / winterAvg - 1) * 100).toFixed(0)}% more</strong> than winter due to longer days and higher sun angle
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Winter production</strong> is reduced by shorter days, lower sun angle, and occasional snow coverage on panels
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Spring and fall</strong> offer excellent production with moderate temperatures improving panel efficiency
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
