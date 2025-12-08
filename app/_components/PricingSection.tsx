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
        <section id="pricing" className="w-full py-24 md:py-32 px-6 flex flex-col items-center relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    Simple, transparent pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                    Choose the perfect plan for your video creation needs.
                </p>
            </div>

            {/* Grid */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {TIERS.map((tier, index) => (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={cn(
                            "relative flex flex-col p-8 rounded-3xl bg-card/50 backdrop-blur-md border shadow-2xl transition-all duration-300 hover:-translate-y-2 group",
                            tier.popular
                                ? "border-brand-primary ring-1 ring-brand-primary/50 shadow-brand-primary/20 md:-mt-8 md:mb-8 z-10"
                                : "border-white/10 hover:border-white/20 hover:shadow-brand-primary/5"
                        )}
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                        {tier.popular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                <div className="bg-gradient-to-r from-brand-primary to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 fill-white" />
                                    Most Popular
                                </div>
                            </div>
                        )}

                        <div className="mb-8 relative z-10">
                            <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                            <p className="text-muted-foreground text-sm h-10">{tier.description}</p>
                        </div>

                        <div className="mb-8 flex items-baseline gap-1 relative z-10">
                            <span className="text-5xl font-black text-foreground tracking-tight">{tier.price}</span>
                            {tier.period && <span className="text-muted-foreground font-medium">{tier.period}</span>}
                        </div>

                        <ul className="flex-1 flex flex-col gap-4 mb-8 relative z-10">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                    <div className="p-0.5 rounded-full bg-brand-primary/10 text-brand-primary mt-0.5">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link href={tier.href} className="w-full relative z-10">
                            <button
                                className={cn(
                                    "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                                    tier.popular
                                        ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-brand-primary/25"
                                        : "bg-foreground text-background hover:bg-foreground/90"
                                )}
                            >
                                {tier.cta}
                            </button>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
