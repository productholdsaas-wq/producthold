"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Wand2, Upload, Video, Mic2 } from "lucide-react";

const STEPS = [
    {
        id: "01",
        title: "Choose Your Aesthetic",
        heading: "Start with a Premium Template",
        description: "Browse our curated collection of high-converting product video templates. From sleek tech showcases to vibrant lifestyle sets, find the perfect match for your brand identity.",
        imageSrc: "/process1.png",
        icon: Wand2,
        color: "bg-blue-500",
    },
    {
        id: "02",
        title: "Upload Product",
        heading: "Instant Background Magic",
        description: "Simply upload your product photo. Our AI instantly removes the background and perfectly integrates your product into the scene with realistic lighting and shadows.",
        imageSrc: "/process2.png",
        icon: Upload,
        color: "bg-purple-500",
    },
    {
        id: "03",
        title: "AI Animation",
        heading: "Bring It to Life",
        description: "Watch as static images transform into dynamic videos. Our AI adds subtle movements, camera angles, and professional transitions that would normally take hours to film.",
        imageSrc: "/process3.png",
        icon: Video,
        color: "bg-pink-500",
    },
    {
        id: "04",
        title: "Voice & Sync",
        heading: "Give It a Voice",
        description: "Type your script or upload audio. Our advanced lip-sync technology ensures your avatar speaks naturally, adding that final layer of professional polish to your UGC.",
        imageSrc: "/process4.png",
        icon: Mic2,
        color: "bg-indigo-500",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative w-full py-20 md:py-32 flex flex-col items-center overflow-hidden">

            {/* Soft Ambient Background - Adjusted for blending */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="absolute right-0 top-1/4 w-1/3 h-1/3 bg-brand-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute left-0 bottom-1/4 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-[120px] -z-10" />

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-20 md:mb-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm font-medium mb-8 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                        </span>
                        Simple 4-Step Process
                    </div>

                    <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                        From Photo to Pro Video <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">
                            in Minutes
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        No studio, no actors, no editing skills required. Just you, your product, and our AI.
                    </p>
                </motion.div>
            </div>

            {/* Timeline & Steps */}
            <div className="w-full max-w-7xl mx-auto px-6 relative z-10">

                {/* Central Timeline Line (Desktop) */}
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/60 to-transparent hidden lg:block -translate-x-1/2" />

                <div className="flex flex-col gap-16 md:gap-24 lg:gap-32">
                    {STEPS.map((step, index) => {
                        const isEven = index % 2 === 0;
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-24 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                            >
                                {/* Text Side */}
                                <div className={`flex-1 flex flex-col ${isEven ? 'lg:items-end lg:text-right' : 'lg:items-start lg:text-left'} items-center text-center lg:text-left`}>

                                    {/* Mobile: Step Number visible here */}
                                    <div className="lg:hidden flex items-center gap-3 mb-4">
                                        <span className="text-3xl font-bold text-white">{step.id}</span>
                                        <div className={`p-2.5 rounded-2xl bg-muted/50 text-brand-primary`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Desktop: Step Info */}
                                    <div className="hidden lg:flex items-center gap-4 mb-6">
                                        {!isEven && (
                                            <>
                                                <div className={`p-3 rounded-2xl bg-muted/30 text-foreground border border-border/50`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-6xl font-bold text-white/80 select-none font-mono">{step.id}</span>
                                            </>
                                        )}
                                        {isEven && (
                                            <>
                                                <span className="text-6xl font-bold text-white/80 select-none font-mono">{step.id}</span>
                                                <div className={`p-3 rounded-2xl bg-muted/30 text-foreground border border-border/50`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3 md:space-y-4 max-w-md">
                                        <div className={`text-sm font-semibold tracking-wider uppercase text-brand-primary ${isEven ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                                            {step.title}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-foreground relative inline-block">
                                            {step.heading}
                                            {/* Abstract Underline - Hidden on mobile to reduce clutter */}
                                            <span className={`hidden md:block absolute -bottom-2 ${isEven ? 'right-0' : 'left-0'} w-12 h-1 bg-gradient-to-r from-brand-primary to-transparent rounded-full opacity-60`} />
                                        </h3>
                                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Center Point (Desktop) */}
                                <div className="hidden lg:flex relative items-center justify-center w-12 h-12 z-20">
                                    <div className="w-4 h-4 rounded-full bg-brand-primary shadow-[0_0_0_8px_rgba(var(--brand-primary),0.2)]" />
                                    <div className="absolute inset-0 rounded-full border border-brand-primary/30 animate-pulse" />
                                </div>

                                {/* Image Side */}
                                <div className="flex-1 w-full">
                                    <div className="relative group perspective-1000">
                                        {/* Abstract Decorations behind image */}
                                        <div className={`absolute -inset-4 bg-gradient-to-r from-brand-primary/20 to-purple-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />

                                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-card/50 border border-border/50 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-rotate-1">
                                            <Image
                                                src={step.imageSrc}
                                                alt={step.title}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />

                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        );
                    })}
                </div>
            </div>

        </section>
    );
}
