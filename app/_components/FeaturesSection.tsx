"use client";

import { ArrowRight, Box, Play, Mic, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
    {
        title: "Product Avatar Generator",
        description: "Create an avatar holding your product with one image.",
        imageSrc: "/Image1.png",
        link: "/gen/product-avatar",
        badge: "New",
        icon: Box,
    },
    {
        title: "Video Avatar Generator",
        description: "Generate avatar videos or clone your avatar from a video.",
        imageSrc: "/Image4.png",
        link: "/gen/avatar-video-creation",
        icon: Play,
    },
    {
        title: "Talking Photo Avatar",
        description: "Turn any photo into a talking video with one click.",
        imageSrc: "/Image3.png",
        link: "/gen/photo-talking-avatar",
        icon: Mic,
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

export default function FeaturesSection() {
    return (
        <section className="relative w-full py-24 flex flex-col items-center overflow-hidden">

            {/* ✅ Background Glows - Matching Hero Style */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 -z-10" />


            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Creation</span>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        More Than Product Avatar Generator
                    </h2>
                    <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
                        All-in-one AI avatar generators that effortlessly transform products, photos, and videos into unique AI avatars.
                    </p>
                </motion.div>
            </div>

            {/* Grid */}
            <div className="w-full max-w-7xl mx-auto px-6 z-10">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className="group relative flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Card Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden p-6">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={feature.imageSrc}
                                            alt={feature.title}
                                            fill
                                            className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>

                                    {feature.badge && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-brand-primary-dark to-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            {feature.badge}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1 relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            {feature.title}
                                        </h3>
                                    </div>

                                    <p className="text-muted-foreground mb-6 flex-1 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>

                                    <Link href={feature.link} className="inline-block mt-auto">
                                        <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-light transition-colors flex items-center gap-2 group/btn">
                                            Try now
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

        </section>
    );
}
