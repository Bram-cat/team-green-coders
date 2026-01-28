'use client'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getAllIncentives, getMaxFunding } from '@/lib/data/peiIncentives'
import { checkIncentiveEligibility, calculateTotalIncentives } from '@/lib/calculations/incentiveEligibility'
import { DollarSign, Clock, Phone, Mail, ExternalLink, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IncentiveTrackerProps {
  systemSizeKW: number
  estimatedCost: number
  defaultPropertyType?: 'residential' | 'farm' | 'business'
}

export function IncentiveTracker({
  systemSizeKW,
  estimatedCost,
  defaultPropertyType = 'residential'
}: IncentiveTrackerProps) {
  const [propertyType, setPropertyType] = useState<'residential' | 'farm' | 'business'>(defaultPropertyType)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const incentives = useMemo(() => getAllIncentives(propertyType), [propertyType])

  const incentivesWithEligibility = useMemo(() => {
    return incentives.map(incentive => ({
      ...incentive,
      eligibility: checkIncentiveEligibility(incentive, {
        systemSizeKW,
        estimatedCost,
        propertyType
      })
    }))
  }, [incentives, systemSizeKW, estimatedCost, propertyType])

  const totalFunding = useMemo(() =>
    calculateTotalIncentives(incentives, { systemSizeKW, estimatedCost, propertyType }),
    [incentives, systemSizeKW, estimatedCost, propertyType]
  )

  const maxPossibleFunding = useMemo(() => getMaxFunding(propertyType), [propertyType])

  const coveragePercent = ((totalFunding.totalValue / estimatedCost) * 100).toFixed(0)

  return (
    <div className="space-y-8">
      {/* Prominent Government Grant Promotion Banner */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 dark:bg-primary/20 blur-[100px]" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-accent/10 dark:bg-accent/20 blur-[80px]" />

        <div className="relative p-8 md:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-black text-foreground dark:text-foreground tracking-tight mb-2">
                Up to <span className="text-primary dark:text-primary">40% Funded</span> by Government
              </h3>
              <p className="text-foreground/70 dark:text-foreground/80 font-medium text-lg">
                PEI and Federal programs can cover a significant portion of your solar installation!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background/50 dark:bg-background/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 dark:border-border/30">
              <div className="text-sm font-black text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">Available to You</div>
              <div className="text-3xl font-black text-primary dark:text-primary">${totalFunding.totalValue.toLocaleString()}</div>
            </div>
            <div className="bg-background/50 dark:bg-background/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 dark:border-border/30">
              <div className="text-sm font-black text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">Your System Cost</div>
              <div className="text-3xl font-black text-foreground dark:text-foreground">${estimatedCost.toLocaleString()}</div>
            </div>
            <div className="bg-background/50 dark:bg-background/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 dark:border-border/30">
              <div className="text-sm font-black text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">Coverage</div>
              <div className="text-3xl font-black text-accent dark:text-accent">{coveragePercent}%</div>
            </div>
          </div>

          <p className="text-sm text-foreground/60 dark:text-foreground/70 italic font-medium">
            <CheckCircle2 className="inline w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
            Combine multiple programs to maximize your funding!
          </p>
        </div>
      </Card>

      {/* Property Type Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h4 className="text-2xl font-black text-foreground dark:text-foreground mb-2">
            Available <span className="text-primary dark:text-primary">Programs</span>
          </h4>
          <p className="text-muted-foreground dark:text-muted-foreground/90">
            Select your property type to see eligible incentives
          </p>
        </div>

        <div className="flex gap-2 bg-muted/30 dark:bg-muted/20 p-2 rounded-2xl border border-border/50 dark:border-border/30">
          <button
            onClick={() => setPropertyType('residential')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all",
              propertyType === 'residential'
                ? "bg-primary text-white dark:bg-primary dark:text-white shadow-lg shadow-primary/20"
                : "text-foreground/60 dark:text-foreground/50 hover:text-foreground dark:hover:text-foreground hover:bg-background/50 dark:hover:bg-background/30"
            )}
          >
            Homeowner
          </button>
          <button
            onClick={() => setPropertyType('farm')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all",
              propertyType === 'farm'
                ? "bg-primary text-white dark:bg-primary dark:text-white shadow-lg shadow-primary/20"
                : "text-foreground/60 dark:text-foreground/50 hover:text-foreground dark:hover:text-foreground hover:bg-background/50 dark:hover:bg-background/30"
            )}
          >
            Farmer
          </button>
          <button
            onClick={() => setPropertyType('business')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all",
              propertyType === 'business'
                ? "bg-primary text-white dark:bg-primary dark:text-white shadow-lg shadow-primary/20"
                : "text-foreground/60 dark:text-foreground/50 hover:text-foreground dark:hover:text-foreground hover:bg-background/50 dark:hover:bg-background/30"
            )}
          >
            Business
          </button>
        </div>
      </div>

      {/* Incentive Cards */}
      <div className="grid gap-6">
        {incentivesWithEligibility.map(incentive => {
          const isExpanded = expandedId === incentive.id
          const isEligible = incentive.eligibility.eligible

          return (
            <Card
              key={incentive.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer",
                isEligible
                  ? "border-2 border-primary/30 dark:border-primary/40 hover:border-primary/50 dark:hover:border-primary/60 bg-background dark:bg-background"
                  : "border border-border/50 dark:border-border/30 opacity-75 bg-muted/20 dark:bg-muted/10"
              )}
              onClick={() => setExpandedId(isExpanded ? null : incentive.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                        incentive.type === 'Grant'
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : incentive.type === 'Interest-Free Loan'
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      )}>
                        {incentive.type}
                      </span>
                      {isEligible && (
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary">
                          Eligible
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-black text-foreground dark:text-foreground mb-2">{incentive.name}</h4>
                    <p className="text-foreground/70 dark:text-foreground/80 leading-relaxed">{incentive.description}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-primary dark:text-primary">
                      ${(incentive.eligibility.estimatedValue || incentive.max_amount || 0).toLocaleString()}
                    </div>
                    {incentive.id === 'pei-farm-003' && (
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground/80 font-medium">per watt</div>
                    )}
                  </div>
                </div>

                {/* Eligibility Requirements */}
                <div className={cn(
                  "transition-all duration-300 overflow-hidden",
                  isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="border-t border-border/50 dark:border-border/30 pt-6 mt-4 space-y-6">
                    {/* Requirements */}
                    <div>
                      <h5 className="font-bold text-sm text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary dark:text-primary" />
                        Eligibility Requirements
                      </h5>
                      <ul className="space-y-2">
                        {incentive.eligibilityCriteria?.map((criteria, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/70 dark:text-foreground/80">
                            <span className="text-primary dark:text-primary mt-1">•</span>
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {incentive.deadline && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-xl">
                          <Clock className="w-5 h-5 text-primary dark:text-primary flex-shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">Deadline</div>
                            <div className="text-sm font-bold text-foreground dark:text-foreground">{incentive.deadline}</div>
                          </div>
                        </div>
                      )}

                      {incentive.processing_weeks && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-xl">
                          <Clock className="w-5 h-5 text-accent dark:text-accent flex-shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-wider">Processing Time</div>
                            <div className="text-sm font-bold text-foreground dark:text-foreground">{incentive.processing_weeks} weeks</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    {(incentive.contact_phone || incentive.contact_email) && (
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-foreground dark:text-foreground mb-2">Contact Information</h5>
                        {incentive.contact_phone && (
                          <a href={`tel:${incentive.contact_phone}`} className="flex items-center gap-2 text-sm text-primary dark:text-primary hover:underline">
                            <Phone className="w-4 h-4" />
                            {incentive.contact_phone}
                          </a>
                        )}
                        {incentive.contact_email && (
                          <a href={`mailto:${incentive.contact_email}`} className="flex items-center gap-2 text-sm text-primary dark:text-primary hover:underline">
                            <Mail className="w-4 h-4" />
                            {incentive.contact_email}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Apply Button */}
                    {incentive.application_url && (
                      <Button
                        asChild
                        className="w-full rounded-2xl h-12 font-bold shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={incentive.application_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          Learn More & Apply
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/30 dark:bg-muted/20 border-border/50 dark:border-border/30">
        <div className="p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-primary dark:text-primary flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-bold text-foreground dark:text-foreground mb-2">Important Notes</h5>
            <ul className="space-y-1 text-sm text-foreground/70 dark:text-foreground/80">
              <li>• Programs may have specific application windows and fund availability</li>
              <li>• Most programs require pre-approval before installation begins</li>
              <li>• Consult with certified installers about program requirements</li>
              <li>• Some programs can be combined to maximize your funding</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
