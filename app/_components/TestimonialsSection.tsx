"use client";

import Image from "next/image";
import { Star, MessageSquareQuote } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Noah Davis",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/0.webp",
        quote: "ProductHold's AI Product Avatar has revolutionized the creation of dynamic content. It's effortless to use and has made our product showcases more engaging.",
    },
    {
        name: "Mason Clark",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/1.webp",
        quote: "ProductHold's AI avatars provide a cost-effective and highly interactive solution that our clients love. It's a must-have tool in our strategy.",
    },
    {
        name: "Elijah Walker",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/2.webp",
        quote: "ProductHold has revolutionized how we present our brand's products. The AI avatars add a professional touch to our content without costly photoshoots.",
    },
    {
        name: "Mia Robinson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/3.webp",
        quote: "This tool has made product showcasing simple and incredibly efficient. I love how realistic the AI avatars look, holding and presenting my products perfectly.",
    },
    {
        name: "Olivia Brown",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/4.webp",
        quote: "Using ProductHold's AI avatars has streamlined my workflow. It's like having a virtual studio—creating professional videos has never been this straightforward.",
    },
    {
        name: "Liam Wilson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/7.webp",
        quote: "ProductHold's AI Product Avatar has simplified our team's marketing efforts. The flexibility and efficiency it offers are unparalleled.",
    },
    {
        name: "Ethan Johnson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/8.webp",
        quote: "ProductHold enables me to generate high-quality product videos quickly and easily. The AI avatars are versatile, and the customization options are endless!",
    },
];

const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

export default function TestimonialsSection() {
    return (
        <section className="w-full py-24 md:py-32 flex flex-col items-center overflow-hidden bg-transparent relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-brand-primary/5 blur-[120px] rounded-full -z-10" />

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm font-medium mb-8 backdrop-blur-sm">
                    <MessageSquareQuote className="w-4 h-4 text-brand-primary" />
                    <span>Trusted by Creators</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                    How ProductHold is Changing <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">Product Showcasing</span>
                </h2>
            </div>

            {/* Marquee */}
            <div className="w-full relative group">
                {/* Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused] px-4">
                    {ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className="w-[350px] md:w-[450px] flex-none bg-card/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-brand-primary/20 hover:bg-card/60 transition-all duration-300"
                        >
                            <div className="mb-6">
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-foreground/90 text-lg leading-relaxed font-medium">
                                    &ldquo;{item.quote}&rdquo;
                                </p>
                            </div>

                            <div>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-6 opacity-50" />

                                {/* User */}
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/20">
                                        <Image
                                            src={item.avatar}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">
                                            {item.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Verified Creator
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}
