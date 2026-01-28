export interface EnhancedIncentiveInfo {
  id: string
  name: string
  type: 'Grant' | 'Loan' | 'Interest-Free Loan' | 'federal' | 'provincial' | 'municipal' | 'utility'
  available: boolean
  description: string
  max_amount?: number
  eligibility_1?: string
  eligibility_2?: string
  eligibility_3?: string
  eligibilityCriteria?: string[]
  application_url?: string
  deadline?: string // ISO date or "Ongoing"
  requires_pre_approval: boolean
  processing_weeks?: number
  contact_phone?: string
  contact_email?: string
}
