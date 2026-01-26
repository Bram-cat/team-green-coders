import { Card, CardContent } from '@/components/ui/Card';
import { getTopRatedCompanies, type SolarCompany } from '@/lib/data/peiSolarCompanies';

interface SolarCompaniesCardProps {
  title?: string;
  description?: string;
}

export function SolarCompaniesCard({
  title = 'Certified PEI Solar Installers',
  description = 'Contact these top-rated local companies for professional installation quotes and consultations.',
}: SolarCompaniesCardProps) {
  const companies = getTopRatedCompanies();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {companies.map((company, index) => (
            <CompanyCard key={index} company={company} />
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Note:</strong> These companies are listed based on public ratings and reviews.
            We recommend contacting multiple installers for quotes. Always verify licensing, insurance, and warranty terms before proceeding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyCard({ company }: { company: SolarCompany }) {
  const starRating = '★'.repeat(Math.floor(company.rating)) + '☆'.repeat(5 - Math.floor(company.rating));

  return (
    <div className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base mb-1">{company.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="text-amber-500 font-medium" title={`${company.rating}/5 stars`}>
              {starRating}
            </span>
            <span className="font-semibold text-foreground">{company.rating}</span>
            <span className="text-xs">({company.reviewCount.toLocaleString()} reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{company.category}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-muted-foreground">{company.address}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a
            href={`tel:${company.phone}`}
            className="text-primary hover:underline font-medium"
          >
            {company.phone}
          </a>
        </div>

        {company.website && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Visit Website →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
