"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
    {
        title: "Product Avatar Generator",
        description: "Create an avatar holding your product with one image.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/product-avatar-generator-0.webp",
        link: "/gen/product-avatar",
        badge: "New",
    },
    {
        title: "Video Avatar Generator",
        description: "Generate avatar videos or clone your avatar from a video.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/product-avatar-generator-1.webp",
        link: "/gen/avatar-video-creation",
    },
    {
        title: "Talking Photo Avatar",
        description: "Turn any photo into a talking video with one click.",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/product-avatar-generator-2.webp",
        link: "/gen/photo-talking-avatar",
    },
];

export default function FeaturesSection() {
    return (
        <div className="w-full py-24 flex flex-col items-center">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    More Than Product Avatar Generator
                </h2>
                <p className="text-lg text-muted-foreground">
                    All-in-one AI avatar generators that effortlessly transform products, photos, and videos into unique AI avatars.
                </p>
            </div>

            {/* Grid */}
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                                <Image
                                    src={feature.imageSrc}
                                    alt={feature.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />

                                {feature.badge && (
                                    <div className="absolute top-4 right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                        {feature.badge}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground mb-6 flex-1">
                                    {feature.description}
                                </p>

                                <Link href={feature.link}>
                                    <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors flex items-center gap-1">
                                        Try now <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
