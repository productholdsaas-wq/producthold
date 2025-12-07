"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TIERS = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for individuals just getting started with AI avatars.",
        features: [
            "1 AI Avatar",
            "5 Video generations per month",
            "720p Video quality",
            "Standard support",
            "Watermarked results",
        ],
        cta: "Start for Free",
        href: "/sign-up",
        popular: false,
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For creators and professionals who need high-quality content.",
        features: [
            "5 AI Avatars",
            "Unlimited Video generations",
            "4K Video quality",
            "Priority support",
            "No watermarks",
            "Commercial usage rights",
        ],
        cta: "Get Started",
        href: "/sign-up?plan=pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large teams and brands requiring scale and control.",
        features: [
            "Unlimited Custom Avatars",
            "API Access",
            "SSO Authentication",
            "Dedicated account manager",
            "Custom brand voice training",
            "SLA & Enterprise contract",
        ],
        cta: "Contact Sales",
        href: "/contact",
        popular: false,
    },
];

export default function PricingSection() {
    return (
        <div className="w-full py-24 px-6 flex flex-col items-center">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    Simple, transparent pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                    Choose the perfect plan for your video creation needs.
                </p>
            </div>

            {/* Grid */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
                {TIERS.map((tier) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative flex flex-col p-8 rounded-3xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl",
                            tier.popular
                                ? "border-brand-primary ring-2 ring-brand-primary/20 shadow-brand-primary/10 md:-mt-8 md:mb-8 z-10"
                                : "hover:-translate-y-1"
                        )}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                            <p className="text-muted-foreground text-sm h-10">{tier.description}</p>
                        </div>

                        <div className="mb-8 flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                            {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                        </div>

                        <ul className="flex-1 flex flex-col gap-4 mb-8">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <Check className="w-5 h-5 text-brand-primary shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link href={tier.href} className="w-full">
                            <button
                                className={cn(
                                    "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200",
                                    tier.popular
                                        ? "bg-brand-primary text-white hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25"
                                        : "bg-muted text-foreground hover:bg-muted/80"
                                )}
                            >
                                {tier.cta}
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
