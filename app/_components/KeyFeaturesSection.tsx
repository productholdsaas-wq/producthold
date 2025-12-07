"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURES = [
    {
        title: "No Real Models Needed",
        description: "Simply upload a product image, and instantly create an AI avatar holding your product — no need for expensive photoshoots or video shoots.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_1_new2.webp",
    },
    {
        title: "Product-Friendly",
        description: "All avatar templates are expertly designed to naturally hold and showcase products of any size or shape.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_2_new_new.webp",
    },
    {
        title: "Lip-Synced & Multilingual",
        description: "Our avatars feature multilingual speech and seamless lip-sync, enabling effortless connections with customers worldwide.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_3_new_new.webp",
    },
    {
        title: "1000+ Avatars & Customizable",
        description: "Choose from Over 1,000 Ready-to-Use Avatars or Create Your Own Custom Designs.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_4_new_new.webp",
    },
    {
        title: "Fully Customizable",
        description: "Design your avatar exactly how you want — DIY with AI, tailored to your brand and product.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/avatar_5_new_new.webp",
    },
];

export default function KeyFeaturesSection() {
    return (
        <div className="w-full py-24">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-24">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Key Features of Product Avatar
                </h2>
            </div>

            {/* Features List */}
            <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col gap-24">
                {FEATURES.map((feature, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex flex-col md:flex-row items-center gap-12 lg:gap-24",
                            index % 2 === 1 ? "md:flex-row-reverse" : ""
                        )}
                    >
                        {/* Image Side */}
                        <div className="w-full md:w-1/2">
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={feature.imageSrc}
                                    alt={feature.title}
                                    fill
                                    className="transition-transform hover:scale-105 duration-700 "
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                />
                                {/* Gradient Fade Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-background/20 z-10 pointer-events-none" />
                            </div>
                        </div>

                        {/* Text Side */}
                        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
                                {feature.title}
                            </h3>
                            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                                {feature.description}
                            </p>

                            <Link href="/gen/product-avatar">
                                <button className="btn-primary px-8 py-3 rounded-xl text-base font-semibold flex items-center gap-2 group">
                                    Create Now
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
