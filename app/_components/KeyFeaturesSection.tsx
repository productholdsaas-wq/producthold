"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const FEATURES = [
    {
        title: "No Real Models Needed",
        description: "Simply upload a product image, and instantly create an AI avatar holding your product — no need for expensive photoshoots or video shoots.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_1_new2.webp",
        color: "from-blue-500/20 to-cyan-500/20",
    },
    {
        title: "Product-Friendly",
        description: "All avatar templates are expertly designed to naturally hold and showcase products of any size or shape.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_2_new_new.webp",
        color: "from-purple-500/20 to-pink-500/20",
    },
    {
        title: "Lip-Synced & Multilingual",
        description: "Our avatars feature multilingual speech and seamless lip-sync, enabling effortless connections with customers worldwide.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_3_new_new.webp",
        color: "from-orange-500/20 to-red-500/20",
    },
    {
        title: "1000+ Avatars & Customizable",
        description: "Choose from Over 1,000 Ready-to-Use Avatars or Create Your Own Custom Designs.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_4_new_new.webp",
        color: "from-green-500/20 to-emerald-500/20",
    },
    {
        title: "Fully Customizable",
        description: "Design your avatar exactly how you want — DIY with AI, tailored to your brand and product.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_5_new_new.webp",
        color: "from-brand-primary/20 to-blue-600/20",
    },
];

const FeatureItem = ({ feature, index, setActiveIndex }: { feature: typeof FEATURES[0], index: number, setActiveIndex: (index: number) => void }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

    useEffect(() => {
        if (isInView) {
            setActiveIndex(index);
        }
    }, [isInView, index, setActiveIndex]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-[80vh] flex flex-col justify-center py-20"
        >
            <div className="flex items-center gap-4 mb-6">
                <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-primary/20 to-transparent select-none font-mono">
                    {`0${index + 1}`}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent" />
            </div>

            <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {feature.title}
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground/90 mb-8 leading-relaxed max-w-lg">
                {feature.description}
            </p>

            <Link href="/gen/product-avatar">
                <button className="group flex items-center gap-2 text-brand-primary font-semibold text-lg hover:text-brand-primary-light transition-colors">
                    Trying it now
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
            </Link>

            {/* Mobile Image (Visible only on small screens) */}
            <div className="lg:hidden mt-8 relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted/10 border border-border/50">
                <Image
                    src={feature.imageSrc}
                    alt={feature.title}
                    fill
                    className="object-cover"
                />
            </div>
        </motion.div>
    );
};

export default function KeyFeaturesSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="relative w-full bg-transparent">
            {/* Header */}
            <div className="pt-24 md:pt-32 pb-12 max-w-4xl mx-auto text-center px-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm font-medium mb-8 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span>Why Choose ProductHold?</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                    Key Features of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">Product Avatar</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Everything you need to create professional product videos without the overhead.
                </p>
            </div>

            <div className="relative w-full max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row items-start">

                {/* Sticky Image Side (Desktop) */}
                <div className="hidden lg:flex w-1/2 sticky top-0 h-screen items-center justify-center p-8 lg:p-12 perspective-1000">
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-card/10 backdrop-blur-md border border-white/10 shadow-2xl">

                        {/* Dynamic Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${FEATURES[activeIndex].color} opacity-20 transition-colors duration-700`} />

                        {FEATURES.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 1.1, rotateX: 10 }}
                                animate={{
                                    opacity: activeIndex === index ? 1 : 0,
                                    scale: activeIndex === index ? 1 : 1.1,
                                    rotateX: activeIndex === index ? 0 : 10,
                                    zIndex: activeIndex === index ? 10 : 0
                                }}
                                transition={{ duration: 0.7, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                <motion.div
                                    animate={{ y: [-10, 10, -10] }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.2 // Stagger float slightly
                                    }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={feature.imageSrc}
                                        alt={feature.title}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />

                                    {/* Glossy Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/10 mix-blend-overlay pointer-events-none" />

                                    {/* Edge Highlight */}
                                    <div className="absolute inset-0 border-2 border-white/10 rounded-3xl pointer-events-none" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Shadow that reacts to float */}
                    <motion.div
                        animate={{
                            scale: [0.9, 1, 0.9],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-12 w-3/4 h-8 bg-black/20 blur-xl rounded-full z-[-1]"
                    />
                </div>

                {/* Scrolling Text Side */}
                <div className="w-full lg:w-1/2 lg:pl-16">
                    {FEATURES.map((feature, index) => (
                        <FeatureItem
                            key={index}
                            feature={feature}
                            index={index}
                            setActiveIndex={setActiveIndex}
                        />
                    ))}
                    {/* Extra padding at bottom to allow last item to scroll fully */}
                    <div className="h-[20vh]" />
                </div>

            </div>
        </section>
    );
}
