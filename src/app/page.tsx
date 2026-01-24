import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import peiData from '../../information.json';

export default function HomePage() {
  const { pei_energy_context } = peiData;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_image.png"
            alt="Solar Panels on PEI Home"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Power Your PEI Home with Solar
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto">
            Join the renewable revolution. Get personalized insights and plan your solar future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/features/plan">Start Your Solar Plan</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-black" asChild>
              <Link href="#learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="learn-more" className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Solar Energy in PEI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Prince Edward Island is committed to a sustainable future. Here's why solar makes sense now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Net Zero 2040</CardTitle>
                <CardDescription>PEI's Ambitious Goal</CardDescription>
              </CardHeader>
              <CardContent>
                <p>PEI is targeting Net Zero by {pei_energy_context.general_overview.net_zero_target_year}. Solar plays a crucial role in reducing our reliance on imported power ({pei_energy_context.general_overview.current_electricity_sources.imported_from_new_brunswick}).</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growing Capacity</CardTitle>
                <CardDescription>Solar Adoption Rising</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Solar capacity is growing. Currently at {pei_energy_context.general_overview.renewable_generation_capacity.solar}, small-scale installations for households are becoming increasingly popular across the island.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incentives Available</CardTitle>
                <CardDescription>Save on Installation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Take advantage of programs like the Canada Greener Homes Loan and provincial rebates. Contact Net Zero Navigator at {peiData.financial_data.pei_specific_factors.rebates_incentives.contact}.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Plan Your System with AI</h2>
              <p className="text-xl text-muted-foreground">
                Our advanced solar calculator analyzes your roof's potential using satellite imagery and PEI-specific solar data. Get an instant estimate on production, savings, and costs.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Roof suitability analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Financial breakdown with PEI rates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Visual panel layout</span>
                </li>
              </ul>
              <Button size="lg" asChild className="mt-6">
                <Link href="/features/plan">Try the Calculator</Link>
              </Button>
            </div>
            <div className="flex-1 relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/feature image.png"
                alt="Solar Planning Feature"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
