import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import peiData from "../../.json/information.json";

export default function HomePage() {
  const { pei_energy_context, market_data_solar, financial_data } = peiData;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_image.png"
            alt="Solar Panels on PEI Home"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
            <span className="text-primary-foreground font-semibold tracking-wide text-sm uppercase">
              Supporting PEI&apos;s Solar Revolution
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
            Powering PEI&apos;s <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Solar Revolution
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-medium">
            Join us in leading Prince Edward Island toward a sustainable future.
            Get precision-engineered solar insights for your specific roof.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              asChild
              className="text-lg px-10 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform"
            >
              <Link href="/features/plan">Start Your Solar Plan</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 rounded-2xl bg-white/5 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-sm"
              asChild
            >
              <Link href="#solutions">Explore Our Solutions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {pei_energy_context.general_overview.net_zero_target_year}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Net Zero Target
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {
                  pei_energy_context.general_overview
                    .renewable_generation_capacity.solar
                }
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Current Solar Capacity
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {
                  market_data_solar.technical_components.module_efficiency
                    .residential_median
                }
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Median Panel Efficiency
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                ~{market_data_solar.system_sizing.residential.median_size_kw} kW
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Median System Size
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="solutions" className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Solar Energy in the Island Context
              </h2>
              <p className="text-xl text-muted-foreground">
                Prince Edward Island currently imports{" "}
                {
                  pei_energy_context.general_overview
                    .current_electricity_sources.imported_from_new_brunswick
                }{" "}
                of its electricity. Our team, <strong>Green Coders</strong>, is
                building the bridge to local energy independence.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              View Technical Specs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="bg-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Grid Independence</CardTitle>
                <CardDescription>PEI&apos;s Ambitious Goal</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  With{" "}
                  {
                    pei_energy_context.general_overview
                      .current_electricity_sources.imported_from_new_brunswick
                  }{" "}
                  power imported, solar is crucial for self-reliance.
                  Small-scale installations are rising to meet the{" "}
                  {pei_energy_context.general_overview.net_zero_target_year}{" "}
                  vision.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Modern Efficiency</CardTitle>
                <CardDescription>Industry-Leading Tech</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We use{" "}
                  {
                    market_data_solar.technical_components.module_efficiency
                      .residential_median
                  }{" "}
                  median efficiency calculations. Adoption of MLPE technology is
                  at{" "}
                  {
                    market_data_solar.technical_components.power_electronics
                      .residential_mlpe_adoption
                  }
                  , ensuring peak performance in PEI&apos;s unique weather.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Financial Returns</CardTitle>
                <CardDescription>Incentives & Savings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Net metering limits go up to{" "}
                  {
                    financial_data.pei_specific_factors.net_metering
                      .capacity_limit_kw
                  }{" "}
                  kW. With rates at $
                  {
                    peiData.calculations_framework.recommended_defaults_for_pei
                      .financial_assumptions.electricity_rate_usd_per_kwh
                  }
                  /kWh, the payback is faster than ever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  AI-Powered Precision Modeling
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Our advanced solar calculator uses Gemini Vision AI to analyze
                  your roof. We don&apos;t just estimate; we architect your
                  solar future using PEI-specific environmental factors.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Roof suitability analysis",
                  "PEI-specific solar irradiance",
                  "Financial breakdown with local rates",
                  "Obstacle & Shading detection",
                  "25-year ROI projections",
                  "Net metering compliance check",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    <span className="font-medium text-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Button size="lg" asChild className="mt-8 rounded-xl px-8 h-14">
                <Link href="/features/plan">Try the Calculator</Link>
              </Button>
            </div>
            <div className="flex-1 relative aspect-square w-full max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src="/feature image.png"
                  alt="Solar Planning Feature"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 15% Impact Analysis Section - NEW */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4" />

        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
              Strategic Simulation
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-[0.9]">
              The <span className="text-primary italic">15%</span> Efficiency
              Leap
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              What happens when we optimize an entire province? A 10-15%
              efficiency boost across PEI&apos;s solar fleet changes everything.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-lg">
                    <Image
                      src="/heat_map_pei.png"
                      alt="Current PEI Solar Heat Map"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">
                      Current State
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20">
                    <Image
                      src="/heat_map_improved.png"
                      alt="Improved PEI Solar Heat Map"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-primary backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">
                      Optimized Core
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 italic text-sm font-medium text-muted-foreground">
                Visualizing the thermal and production intensity shift across
                the Island when applying advanced MLPE and AI-routing.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none bg-white shadow-xl rounded-2xl p-6">
                <h4 className="text-primary font-black uppercase tracking-widest text-[10px] mb-3">
                  Community Scale
                </h4>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Power a Small Town
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extra 13 GWh/year provides free energy for{" "}
                  <strong>1,500 PEI homes</strong> without taking an extra inch
                  of land.
                </p>
              </Card>
              <Card className="border-none bg-white shadow-xl rounded-2xl p-6">
                <h4 className="text-accent font-black uppercase tracking-widest text-[10px] mb-3">
                  Fiscal Impact
                </h4>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  $2.2 Million Saved
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Annual economic yield kept within the community instead of
                  being sent off-island for power imports.
                </p>
              </Card>
              <Card className="border-none bg-white shadow-xl rounded-2xl p-6">
                <h4 className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-3">
                  Independence
                </h4>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Cutting the Cord
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reduces reliance on undersea cables and accelerates the{" "}
                  <strong>2030 100% Renewable Goal</strong>.
                </p>
              </Card>
              <Card className="border-none bg-white shadow-xl rounded-2xl p-6">
                <h4 className="text-green-600 font-black uppercase tracking-widest text-[10px] mb-3">
                  Ecology
                </h4>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  1,000 Cars Off-Road
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Offsets 5,000 tonnes of CO2 annually &mdash; like permanently
                  removing 1,000 cars from the Confederation Bridge.
                </p>
              </Card>
            </div>
          </div>

          <div className="bg-foreground text-background rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
            <div className="grid md:grid-cols-3 gap-12 items-center relative z-10">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                  The Future is Already{" "}
                  <span className="text-primary">Landing</span>
                </h3>
                <p className="text-white/70 font-medium leading-relaxed max-w-2xl">
                  Standard panels at 15% are yesterday&apos;s tech. With 22%
                  being the current PEI standard and perovskite tandem cells
                  aiming for 30%+, our vision for an optimized Island is
                  effectively the new baseline.
                </p>
              </div>
              <div>
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl h-16 shadow-xl shadow-primary/20"
                  asChild
                >
                  <Link href="/features/plan">Join the Wave</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team & Credit Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Meet the Team</h2>
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl mb-12 group">
              <Image
                src="/team_work.png"
                alt="Green Coders Team"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                <p className="text-white text-xl font-bold tracking-widest uppercase italic">
                  The Green Coders Engineering Force
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">Green Coders</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for the PEI Hackathon. This project represents our
                commitment to leveraging AI for environmental sustainability.
              </p>
              <div className="pt-6">
                <div className="inline-flex flex-col items-center">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest mb-1">
                    Lead Developer & Visionary
                  </span>
                  <span className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Ram
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/40 dark:bg-muted/20 border-t border-border dark:border-border/50">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/90 font-medium">
            © {new Date().getFullYear()} SolarPEI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/60 mt-2">
            Built by local PEI developers 🍁
          </p>
        </div>
      </footer>
    </div>
  );
}
