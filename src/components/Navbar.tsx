"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Menu, X, Zap, TrendingUp, History as HistoryIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/NavigationMenu";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg group-hover:rotate-6 transition-transform">
              <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-background">
                <Image
                  src="/Gemini_Generated_Image_cqr8nkcqr8nkcqr8.png"
                  alt="SolarPEI Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-accent transition-all">
              SolarPEI
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/" && "bg-primary/10 text-primary",
                    )}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[600px] gap-3 p-6 md:grid-cols-2">
                    <ListItem
                      href="/features/plan"
                      title="Plan New Installation"
                      icon={<Zap className="h-5 w-5 text-primary" />}
                    >
                      Upload a photo of your roof to get AI-powered
                      recommendations for a new solar panel installation. Get
                      accurate panel counts, system sizing, and financial
                      projections for Charlottetown PEI.
                    </ListItem>
                    <ListItem
                      href="/features/improve"
                      title="Improve Existing System"
                      icon={<TrendingUp className="h-5 w-5 text-accent" />}
                    >
                      Already have solar panels? Upload a photo to get expert
                      optimization recommendations. Analyze panel condition,
                      efficiency, shading issues, and discover opportunities to
                      boost your system&apos;s performance.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/history" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/history" && "bg-primary/10 text-primary",
                    )}
                  >
                    History
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <SignedIn>
              <Link
                href="/profile"
                className={cn(
                  "text-sm font-bold transition-all px-4 py-2 rounded-full",
                  pathname === "/profile"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Profile
              </Link>
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 p-0.5">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="rounded-full shadow-lg hover:shadow-primary/20"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full hover:bg-primary/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background">
          <Link
            href="/"
            className={cn(
              "block text-sm font-medium transition-colors hover:text-primary px-2",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>

          <div className="space-y-2">
            <div className="font-medium px-2 text-foreground">Features</div>
            <div className="pl-4 space-y-3 border-l ml-2">
              <Link
                href="/features/plan"
                className="block group"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Plan New Installation
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Get AI recommendations for new solar panels
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                href="/features/improve"
                className="block group"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      Improve Existing System
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Optimize your current solar installation
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <Link
            href="/history"
            className={cn(
              "block text-sm font-medium transition-colors hover:text-primary px-2",
              pathname === "/history"
                ? "text-primary"
                : "text-muted-foreground",
            )}
            onClick={() => setIsOpen(false)}
          >
            History
          </Link>

          <div className="pt-4 border-t">
            <SignedIn>
              <div className="flex items-center justify-between px-2">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="w-full">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
}

const ListItem = ({
  className,
  title,
  children,
  href,
  icon,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-xl p-4 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <div className="text-sm font-semibold leading-none">{title}</div>
          </div>
          <p className="line-clamp-3 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
