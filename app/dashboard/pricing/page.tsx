"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        cta: "Current Plan",
        href: "#",
        popular: false,
        disabled: true,
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
        cta: "Upgrade to Pro",
        href: "/dashboard/billing", // Redirect to billing/checkout
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
        href: "mailto:sales@producthold.com",
        popular: false,
    },
];

export default function PricingPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pricing Plans</h1>
                    <p className="text-muted-foreground">
                        Upgrade your plan to unlock more features
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                {TIERS.map((tier, index) => (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={cn(
                            "relative flex flex-col p-8 rounded-3xl bg-card border shadow-sm transition-all duration-300 hover:shadow-lg group",
                            tier.popular
                                ? "border-brand-primary ring-1 ring-brand-primary/50 shadow-brand-primary/10"
                                : "border-border hover:border-brand-primary/30"
                        )}
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="bg-gradient-to-r from-brand-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 fill-white" />
                                    Most Popular
                                </div>
                            </div>
                        )}

                        <div className="mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                            <p className="text-muted-foreground text-sm h-10">{tier.description}</p>
                        </div>

                        <div className="mb-6 flex items-baseline gap-1 relative z-10">
                            <span className="text-4xl font-black text-foreground tracking-tight">{tier.price}</span>
                            {tier.period && <span className="text-muted-foreground font-medium">{tier.period}</span>}
                        </div>

                        <ul className="flex-1 flex flex-col gap-3 mb-8 relative z-10">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <div className="p-0.5 rounded-full bg-brand-primary/10 text-brand-primary mt-0.5 shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link href={tier.href} className="w-full relative z-10">
                            <button
                                disabled={tier.disabled}
                                className={cn(
                                    "w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm",
                                    tier.disabled
                                        ? "bg-muted text-muted-foreground cursor-default"
                                        : tier.popular
                                            ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-brand-primary/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                            : "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                                )}
                            >
                                {tier.cta}
                            </button>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
