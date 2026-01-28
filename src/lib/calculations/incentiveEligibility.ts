import type { EnhancedIncentiveInfo } from '@/types/incentives'

export interface EligibilityCheckInput {
  systemSizeKW: number
  estimatedCost: number
  propertyType: 'residential' | 'farm' | 'business'
}

export function checkIncentiveEligibility(
  incentive: EnhancedIncentiveInfo,
  input: EligibilityCheckInput
): {
  eligible: boolean
  reasons: string[]
  estimatedValue: number
} {
  const reasons: string[] = []
  let eligible = true
  let estimatedValue = incentive.max_amount || 0

  // Check if incentive is available
  if (!incentive.available) {
    eligible = false
    reasons.push('Program currently not accepting applications')
    return { eligible, reasons, estimatedValue: 0 }
  }

  // Special handling for per-watt programs (farm solar)
  if (incentive.id === 'pei-farm-003' && input.propertyType === 'farm') {
    estimatedValue = Math.min(
      (incentive.max_amount || 0) * input.systemSizeKW * 1000, // Per watt
      input.estimatedCost * 0.3 // Max 30% of cost
    )
    if (input.systemSizeKW < 5) {
      eligible = false
      reasons.push('System must be minimum 5kW')
    }
  }

  // For loans, calculate actual value based on system cost
  if (incentive.type === 'Loan' || incentive.type === 'Interest-Free Loan') {
    estimatedValue = Math.min(incentive.max_amount || 0, input.estimatedCost)
  }

  // Default to eligible if all checks pass
  if (eligible && reasons.length === 0) {
    reasons.push('✓ Meets basic eligibility requirements')
  }

  return {
    eligible,
    reasons,
    estimatedValue
  }
}

export function calculateTotalIncentives(
  incentives: EnhancedIncentiveInfo[],
  input: EligibilityCheckInput
): {
  totalGrants: number
  totalLoans: number
  totalValue: number
  eligiblePrograms: Array<{ name: string; value: number; type: string }>
} {
  let totalGrants = 0
  let totalLoans = 0
  const eligiblePrograms: Array<{ name: string; value: number; type: string }> = []

  incentives.forEach(incentive => {
    const check = checkIncentiveEligibility(incentive, input)
    if (check.eligible) {
      eligiblePrograms.push({
        name: incentive.name,
        value: check.estimatedValue,
        type: incentive.type
      })

      if (incentive.type === 'Grant') {
        totalGrants += check.estimatedValue
      } else if (incentive.type === 'Loan' || incentive.type === 'Interest-Free Loan') {
        totalLoans += check.estimatedValue
      }
    }
  })

  return {
    totalGrants,
    totalLoans,
    totalValue: totalGrants + totalLoans,
    eligiblePrograms
  }
}
