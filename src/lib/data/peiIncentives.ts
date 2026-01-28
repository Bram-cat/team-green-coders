import type { EnhancedIncentiveInfo } from '@/types/incentives'

// Residential Homeowner Incentives
export const RESIDENTIAL_INCENTIVES: EnhancedIncentiveInfo[] = [
  {
    id: "pei-grebate-001",
    name: "PEI Home Energy Efficiency Loan Program",
    type: "Loan",
    available: true,
    max_amount: 10000,
    description: "Interest-free loans for energy efficiency upgrades including solar PV installations",
    eligibilityCriteria: [
      "PEI homeowner",
      "Primary residence",
      "Must complete energy assessment"
    ],
    application_url: "https://www.princeedwardisland.ca/en/service/apply-for-energy-efficiency-loan",
    deadline: "Ongoing",
    requires_pre_approval: true,
    processing_weeks: 4,
    contact_phone: "1-877-734-6336",
    contact_email: "energy@gov.pe.ca"
  },
  {
    id: "fed-grebate-002",
    name: "Canada Greener Homes Grant",
    type: "Grant",
    available: true,
    max_amount: 5000,
    description: "Federal grant for home energy retrofits including solar panel installation",
    eligibilityCriteria: [
      "Canadian homeowner",
      "Primary residence",
      "Pre-and-post retrofit EnerGuide evaluation required"
    ],
    application_url: "https://natural-resources.canada.ca/energy-efficiency/homes/canada-greener-homes-grant",
    deadline: "2027-03-31",
    requires_pre_approval: true,
    processing_weeks: 12,
    contact_phone: "1-833-674-8282",
    contact_email: "greenerhomesgrant-subventionsmaisonsvertes@nrcan-rncan.gc.ca"
  },
  {
    id: "fed-loan-003",
    name: "Canada Greener Homes Loan",
    type: "Interest-Free Loan",
    available: true,
    max_amount: 40000,
    description: "Interest-free loan of up to $40,000 for home energy improvements - can cover up to 40% of your solar installation cost!",
    eligibilityCriteria: [
      "Approved for Greener Homes Grant",
      "Canadian homeowner",
      "Good credit history"
    ],
    application_url: "https://natural-resources.canada.ca/energy-efficiency/homes/canada-greener-homes-loan",
    deadline: "2027-03-31",
    requires_pre_approval: true,
    processing_weeks: 8,
    contact_phone: "1-866-292-9517",
    contact_email: "greenerhomesloan-pretsmaisonsvertes@nrcan-rncan.gc.ca"
  }
]

// Farmer/Agricultural Incentives
export const FARMER_INCENTIVES: EnhancedIncentiveInfo[] = [
  {
    id: "pei-farm-001",
    name: "PEI Agricultural Energy Solutions Program",
    type: "Grant",
    available: true,
    max_amount: 35000,
    description: "Financial assistance for farmers to implement renewable energy and energy efficiency projects",
    eligibilityCriteria: [
      "Registered farm operation in PEI",
      "Farm Business Registration Number",
      "Project reduces energy consumption or generates renewable energy"
    ],
    application_url: "https://www.princeedwardisland.ca/en/service/agricultural-energy-solutions-program",
    deadline: "Ongoing",
    requires_pre_approval: true,
    processing_weeks: 8,
    contact_phone: "902-368-4880",
    contact_email: "agenergy@gov.pe.ca"
  },
  {
    id: "fed-farm-002",
    name: "On-Farm Climate Action Fund",
    type: "Grant",
    available: true,
    max_amount: 100000,
    description: "Federal funding for agricultural climate action projects including renewable energy",
    eligibilityCriteria: [
      "Agricultural producer",
      "Member of participating organization",
      "Project aligns with program priorities"
    ],
    application_url: "https://agriculture.canada.ca/en/agricultural-programs-and-services/on-farm-climate-action-fund",
    deadline: "2028-03-31",
    requires_pre_approval: true,
    processing_weeks: 12,
    contact_phone: "1-866-367-8506",
    contact_email: "ofaaf-cpadaa@agr.gc.ca"
  },
  {
    id: "pei-farm-003",
    name: "Farm Solar PV Rebate Program",
    type: "Grant",
    available: true,
    max_amount: 1.0, // Per watt
    description: "Per watt rebate for solar PV installations on farm buildings and operations",
    eligibilityCriteria: [
      "Active farm business in PEI",
      "Minimum 5kW system",
      "Must be grid-connected"
    ],
    application_url: "https://www.princeedwardisland.ca/en/service/farm-solar-pv-rebate-program",
    deadline: "Funds available",
    requires_pre_approval: true,
    processing_weeks: 10,
    contact_phone: "902-368-4880",
    contact_email: "agriculture@gov.pe.ca"
  },
  {
    id: "pei-farm-004",
    name: "Agricultural Clean Technology Program",
    type: "Loan",
    available: true,
    max_amount: 250000,
    description: "Support for adoption of clean technology including solar energy systems",
    eligibilityCriteria: [
      "Agricultural or agri-food business",
      "Project reduces GHG emissions",
      "Minimum 50% equity contribution"
    ],
    application_url: "https://agriculture.canada.ca/en/agricultural-programs-and-services/agricultural-clean-technology-program",
    deadline: "2028-03-31",
    requires_pre_approval: true,
    processing_weeks: 16,
    contact_phone: "1-855-773-0241",
    contact_email: "agclean.agpropre@agr.gc.ca"
  }
]

// Business/Commercial Incentives (placeholder - user can add more)
export const BUSINESS_INCENTIVES: EnhancedIncentiveInfo[] = [
  {
    id: "pei-business-001",
    name: "Commercial Solar Investment Program",
    type: "Grant",
    available: true,
    max_amount: 50000,
    description: "Funding for commercial solar installations (Contact for more details)",
    eligibilityCriteria: [
      "Registered business in PEI",
      "Commercial property",
      "Minimum 10kW system"
    ],
    application_url: "https://www.princeedwardisland.ca",
    deadline: "Ongoing",
    requires_pre_approval: true,
    processing_weeks: 12,
    contact_phone: "902-368-4880",
    contact_email: "business@gov.pe.ca"
  }
]

// Aggregate all incentives by property type
export const getAllIncentives = (propertyType: 'residential' | 'farm' | 'business') => {
  switch (propertyType) {
    case 'residential':
      return RESIDENTIAL_INCENTIVES
    case 'farm':
      return FARMER_INCENTIVES
    case 'business':
      return BUSINESS_INCENTIVES
    default:
      return RESIDENTIAL_INCENTIVES
  }
}

// Calculate maximum available funding by property type
export const getMaxFunding = (propertyType: 'residential' | 'farm' | 'business'): number => {
  const incentives = getAllIncentives(propertyType)
  return incentives.reduce((sum, incentive) => {
    // For per-watt programs, use a reasonable estimate
    if (incentive.id === 'pei-farm-003') {
      return sum + (incentive.max_amount || 0) * 10000 // Assume 10kW system
    }
    return sum + (incentive.max_amount || 0)
  }, 0)
}
