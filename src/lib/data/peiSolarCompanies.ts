/**
 * PEI Solar Panel Installation Companies
 * Data sourced from Google Maps scrape (2025)
 */

export interface SolarCompany {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  phone: string;
  website?: string;
}

/**
 * Verified solar installation companies in Prince Edward Island
 * Sorted by rating and review count
 */
export const PEI_SOLAR_COMPANIES: SolarCompany[] = [
  {
    name: 'Greenfoot Energy Solutions',
    address: '2 Aviation Avenue',
    rating: 4.9,
    reviewCount: 1370,
    category: 'HVAC contractor',
    phone: '(844) 725-3956',
    website: 'https://www.greenfootenergy.ca',
  },
  {
    name: 'Hansen Solar Energy',
    address: '14 Garfield St',
    rating: 4.8,
    reviewCount: 17,
    category: 'Solar energy company',
    phone: '+1 866-888-1532',
    website: 'https://hansensolarenergy.ca/',
  },
  {
    name: 'Sunly Energy',
    address: '14 Kinlock Rd Unit 7B',
    rating: 4.8,
    reviewCount: 235,
    category: 'Solar energy company',
    phone: '+1 833-467-8659',
    website: 'http://sunly.ca/',
  },
  {
    name: 'Polaron Solar Energy',
    address: '423 Mt Edward Rd',
    rating: 4.8,
    reviewCount: 245,
    category: 'Solar energy company',
    phone: '+1 888-318-1988',
    website: 'https://polaronsolar.com/',
  },
  {
    name: 'MoJi-fast Technology Ltd.',
    address: '3 Bendella Dr',
    rating: 5.0,
    reviewCount: 15,
    category: 'Solar energy company',
    phone: '(902) 208-0102',
    website: 'https://moji-fast.com/',
  },
  {
    name: 'Urbanite Electrical Services',
    address: '10 Viceroy Ave',
    rating: 5.0,
    reviewCount: 15,
    category: 'Electrician',
    phone: '(902) 333-3130',
    website: 'https://urbaniteelectrical.ca/',
  },
  {
    name: 'M.B. Eye Electrical Inc.',
    address: '4 Melody Ln',
    rating: 4.6,
    reviewCount: 57,
    category: 'Contractor',
    phone: '(902) 892-8839',
    website: 'https://www.mbeyeelectrical.com/',
  },
  {
    name: 'Tradewinds Mitsubishi Heat Pumps',
    address: '15 Walker Dr',
    rating: 5.0,
    reviewCount: 3,
    category: 'Air conditioning contractor',
    phone: '(902) 892-6280',
    website: 'http://www.tradewindsecoenergy.com/',
  },
];

/**
 * Get top-rated solar companies (rating >= 4.8 and reviewCount >= 15)
 */
export function getTopRatedCompanies(): SolarCompany[] {
  return PEI_SOLAR_COMPANIES.filter(
    (company) => company.rating >= 4.8 && company.reviewCount >= 15
  ).sort((a, b) => {
    // Sort by rating first, then by review count
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.reviewCount - a.reviewCount;
  });
}

/**
 * Get all solar-specific companies
 */
export function getSolarSpecificCompanies(): SolarCompany[] {
  return PEI_SOLAR_COMPANIES.filter(
    (company) => company.category === 'Solar energy company'
  ).sort((a, b) => b.rating - a.rating);
}

/**
 * Get all certified installers (solar companies + electrical contractors)
 */
export function getAllInstallers(): SolarCompany[] {
  return PEI_SOLAR_COMPANIES.filter(
    (company) =>
      company.category === 'Solar energy company' ||
      company.category === 'Electrician' ||
      company.category === 'Contractor' ||
      company.category === 'HVAC contractor'
  ).sort((a, b) => b.rating - a.rating);
}
