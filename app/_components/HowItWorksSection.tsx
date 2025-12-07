"use client";

import Image from "next/image";

const STEPS = [
    {
        title: "1. Choose a Product Avatar Template",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/three_column_1_new.webp",
    },
    {
        title: "2. Upload Your Product Image",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/three_column_2_new.webp",
    },
    {
        title: "3. Generate Your Video Avatar Magically",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/three_column_3_new.webp",
    },
    {
        title: "4. Enter Text or Audio for Speech and Lip-Sync",
        imageSrc: "https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/ai-product-avatar/three_column_4.webp",
    },
];

export default function HowItWorksSection() {
    return (
        <div className="w-full py-24 flex flex-col items-center">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    How to Use the Product Avatar
                </h2>
            </div>

            {/* Grid */}
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, index) => (
                        <div
                            key={index}
                            className="flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="p-6 border-b border-border/10">
                                <h3 className="text-lg font-bold text-foreground leading-tight">
                                    {step.title}
                                </h3>
                            </div>

                            <div className="relative aspect-[4/5] w-full bg-muted">
                                <Image
                                    src={step.imageSrc}
                                    alt={step.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
