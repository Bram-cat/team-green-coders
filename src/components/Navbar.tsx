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
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <Image
                                src="/Gemini_Generated_Image_cqr8nkcqr8nkcqr8.png"
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-xl hidden sm:inline-block">SolarPEI</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        link.dropdown ? (
                            <DropdownMenu key={link.label}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="font-medium text-base">
                                        {link.label}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {link.dropdown.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link href={item.href}>{item.label}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex">
                        <SignedIn>
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/profile" ? "text-primary" : "text-muted-foreground")}>
                                    Profile
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button size="sm">Sign In</Button>
                            </SignInButton>
                        </SignedOut>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
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
