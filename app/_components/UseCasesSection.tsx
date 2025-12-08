"use client";

import { motion } from "framer-motion";
import {
    ShoppingBag,
    Smartphone,
    Share2,
    Megaphone,
    TrendingUp,
    ArrowRight
} from "lucide-react";

const USE_CASES = [
    {
        title: "E-Commerce",
        description: "Boost conversion rates on Amazon, Shopify, and Etsy with high-quality product videos.",
        icon: ShoppingBag,
        colSpan: "col-span-1 md:col-span-2 lg:col-span-1",
    },
    {
        title: "Social Media",
        description: "Create viral-ready content for TikTok, Instagram Reels, and YouTube Shorts in seconds.",
        icon: Smartphone,
        colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    },
    {
        title: "Digital Ads",
        description: "Run high-CTR video ads on Facebook, Instagram, and TikTok without expensive production costs.",
        icon: Megaphone,
        colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    },
    {
        title: "Marketing",
        description: "Personalized product updates and email marketing campaigns that stand out.",
        icon: Share2,
        colSpan: "col-span-1 md:col-span-2 lg:col-span-1",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function UseCasesSection() {
    return (
        <section id="use-cases" className="relative w-full py-24 md:py-32 flex flex-col items-center bg-transparent overflow-hidden">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm font-medium mb-8 backdrop-blur-sm">
                        <TrendingUp className="w-4 h-4 text-brand-primary" />
                        <span>Limitless Possibilities</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                        One Tool, <span className="text-brand-primary">Endless Use Cases</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Whether you&apos;re selling on Amazon or building a brand on TikTok, ProductHold adapts to your needs.
                    </p>
                </motion.div>
            </div>

            {/* Bento Grid */}
            <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {USE_CASES.map((useCase, index) => {
                        const Icon = useCase.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className={`group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 p-8 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 hover:-translate-y-1 ${useCase.colSpan}`}
                            >
                                {/* Premium Subdued Gradient on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Top Highlight Line */}
                                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-brand-primary text-brand-primary group-hover:text-white border border-brand-primary/10 group-hover:border-transparent">
                                        <Icon className="w-6 h-6 transition-colors duration-500" />
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand-primary transition-colors duration-300">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed flex-1 group-hover:text-muted-foreground/80 transition-colors duration-300">
                                        {useCase.description}
                                    </p>

                                    <div className="mt-6 flex items-center gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                        <span className="text-sm font-semibold text-brand-primary/80 group-hover:text-brand-primary">Explore</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-brand-primary/80 group-hover:text-brand-primary" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

        </section>
    );
}
