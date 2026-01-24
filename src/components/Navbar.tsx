"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Button } from "@/components/ui/Button"

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const navLinks = [
        { href: "/", label: "Home" },
        {
            label: "Features",
            dropdown: [
                { href: "/features/plan", label: "Plan" },
                { href: "/features/improve", label: "Improve" },
            ]
        },
        { href: "/history", label: "History" },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-3 group transition-all duration-300">
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
                        <span className="font-extrabold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-accent transition-all">SolarPEI</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        link.dropdown ? (
                            <DropdownMenu key={link.label}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="font-semibold text-sm px-4 h-9 rounded-full hover:bg-primary/10 transition-colors">
                                        {link.label}
                                        <svg className="ml-1 w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-48 p-2 rounded-2xl bg-background/80 backdrop-blur-lg border-white/20 shadow-2xl animate-in">
                                    {link.dropdown.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild className="rounded-xl focus:bg-primary focus:text-white transition-all cursor-pointer">
                                            <Link href={item.href} className="font-medium p-2 block w-full">{item.label}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 hover:bg-primary/10",
                                    pathname === link.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <SignedIn>
                            <Link
                                href="/profile"
                                className={cn(
                                    "text-sm font-bold transition-all px-4 py-2 rounded-full",
                                    pathname === "/profile" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
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
                                <Button size="sm" className="rounded-full shadow-lg hover:shadow-primary/20">Sign In</Button>
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
                    {navLinks.map((link) => (
                        link.dropdown ? (
                            <div key={link.label} className="space-y-2">
                                <div className="font-medium px-2">{link.label}</div>
                                <div className="pl-4 space-y-2 border-l ml-2">
                                    {link.dropdown.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block text-sm text-muted-foreground hover:text-primary"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "block text-sm font-medium transition-colors hover:text-primary px-2",
                                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                    <div className="pt-4 border-t">
                        <SignedIn>
                            <div className="flex items-center justify-between px-2">
                                <Link href="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
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
    )
}
