"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/10 bg-transparent backdrop-blur-md">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Left: Logo */}
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <Image
                            src="/Full_logo.png"
                            alt="ProductHold Logo"
                            width={170}
                            height={50}
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <div className="hidden lg:flex lg:gap-x-8">
                    <button onClick={() => scrollToSection("use-cases")} className="text-sm font-semibold leading-6 text-foreground/80 hover:text-foreground transition-colors">
                        Use cases
                    </button>
                    <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-semibold leading-6 text-foreground/80 hover:text-foreground transition-colors">
                        How it works
                    </button>
                    <button onClick={() => scrollToSection("pricing")} className="text-sm font-semibold leading-6 text-foreground/80 hover:text-foreground transition-colors">
                        Pricing
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-1 items-center justify-end gap-x-4">
                    <SignedOut>
                        <Link
                            href="/sign-in"
                            className="hidden lg:block text-sm font-semibold leading-6 text-foreground hover:text-brand-primary transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link href="/sign-up">
                            <button className="hidden lg:block btn-primary px-4 py-2 rounded-lg text-sm font-semibold">
                                Sign up
                            </button>
                        </Link>
                    </SignedOut>

                    <SignedIn>
                        <Link href="/dashboard" className="hidden lg:block">
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-white/5 transition text-foreground">
                                Dashboard
                            </button>
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground lg:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`lg:hidden absolute top-16 left-0 right-0 mx-6 rounded-2xl border border-border/10 p-6 shadow-2xl bg-elevated/95 backdrop-blur-lg transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                    }`}
            >
                <div className="space-y-4">
                    <button onClick={() => scrollToSection("use-cases")} className="block w-full text-left text-base font-semibold leading-7 text-foreground hover:bg-white/5 p-2 rounded-lg transition-colors">
                        Use cases
                    </button>
                    <button onClick={() => scrollToSection("how-it-works")} className="block w-full text-left text-base font-semibold leading-7 text-foreground hover:bg-white/5 p-2 rounded-lg transition-colors">
                        How it works
                    </button>
                    <Link href="/pricing" className="block text-base font-semibold leading-7 text-foreground hover:bg-white/5 p-2 rounded-lg transition-colors">
                        Pricing
                    </Link>

                    <div className="mt-6 pt-6 border-t border-border/10">
                        <SignedOut>
                            <Link href="/sign-in" className="block text-base font-semibold leading-7 text-foreground mb-4 pl-2 hover:text-brand-primary transition-colors">
                                Sign in
                            </Link>
                            <Link href="/sign-up" className="block w-full">
                                <button className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-semibold shadow-lg">
                                    Sign up
                                </button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard" className="block w-full mb-4">
                                <button className="btn-primary w-full px-4 py-3 rounded-lg text-sm font-semibold shadow-lg">
                                    Dashboard
                                </button>
                            </Link>
                            <div className="flex items-center gap-2 pl-2">
                                <span className="text-sm font-semibold text-foreground">Account:</span>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    );
}