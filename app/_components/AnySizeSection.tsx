"use client";

import { Play, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const DATA_SOURCES = [
    { type: "home", id: "0" },
    { type: "home", id: "1" },
    { type: "home", id: "20" },
    { type: "home", id: "15" },
    { type: "home", id: "8" },
    { type: "home", id: "21" },
    { type: "home", id: "22" },
    { type: "home", id: "6" },
    { type: "home", id: "10" }
];

const ITEMS = DATA_SOURCES.map((source, i) => {
    const basePath = source.type === "home"
        ? `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/home`
        : `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/anyfit/${source.id}`;

    const suffix = source.type === "home" ? `_${source.id}` : "";

    return {
        id: i,
        videoSrc: `${basePath}/result${suffix}.mp4`,
        posterSrc: `${basePath}/init${suffix}.webp`,
        materialSrc: `${basePath}/material${suffix}.webp`,
        humanSrc: `${basePath}/material_human${suffix}.webp`,
    };
});

export default function AnySizeSection() {
    return (
        <div className="w-full py-24 flex flex-col items-center">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    Product Avatar 2 - Beyond handheld <br />
                    <span className="text-brand-primary">Any product, any size</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                    Whether worn, displayed, or held — your product gets the attention it deserves.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="grid grid-cols-2 md:grid-cols-5 auto-rows-[200px] md:auto-rows-[350px] gap-4 grid-flow-dense">
                    {ITEMS.map((item, index) => {
                        // Define span logic to preserve 9:16 aspect ratio (1x1 or 2x2)
                        let spanClass = "col-span-1 row-span-1";

                        // Create a "Big" feature item every few items for the "unique" look
                        // Index 0, 5, 10...
                        if (index === 0 || index === 5 || index === 10) {
                            spanClass = "col-span-2 row-span-2";
                        }

                        return (
                            <VideoCard
                                key={item.id}
                                item={item}
                                className={spanClass}
                            />
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <Link href="/dashboard">
                <button className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 group transition-all hover:scale-105">
                    Create Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </Link>
        </div>
    );
}

function VideoCard({ item, className }: { item: typeof ITEMS[0], className?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        videoRef.current?.play().catch(() => { });
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className={cn(
                "relative group rounded-xl overflow-hidden bg-card border border-border/50 cursor-pointer transition-transform hover:scale-[1.02] duration-300",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Main Video */}
            <div className="relative w-full h-full">
                <video
                    ref={videoRef}
                    src={item.videoSrc}
                    poster={item.posterSrc}
                    muted
                    playsInline
                    loop
                    preload="none"
                    className="w-full h-full object-cover"
                />

                {/* Overlay Content */}
                <div className="absolute bottom-3 left-3 right-3 p-2 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-between gap-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300">

                    {/* Inputs */}
                    <div className="flex items-center gap-1.5">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted">
                            <Image
                                src={item.materialSrc}
                                alt="Product"
                                fill
                                className="object-cover"
                                sizes="32px"
                            />
                        </div>
                        <Plus className="w-2.5 h-2.5 text-white/70" />
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted">
                            <Image
                                src={item.humanSrc}
                                alt="Model"
                                fill
                                className="object-cover"
                                sizes="32px"
                            />
                        </div>
                    </div>

                    {/* Outcome Indicator */}
                    <div className="w-6 h-6 rounded-full bg-brand-primary/90 flex items-center justify-center">
                        <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
