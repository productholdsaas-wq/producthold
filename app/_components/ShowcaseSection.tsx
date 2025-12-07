"use client";

import { Play, Plus } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

const ORIGINAL_ITEMS = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    videoSrc: `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/home/result_${i}.mp4`,
    posterSrc: `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/home/init_${i}.webp`,
    materialSrc: `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/home/material_${i}.webp`,
    humanSrc: `https://d1735p3aqhycef.cloudfront.net/official-website/public/landing-page/home/material_human_${i}.webp`,
}));

// Duplicate items for seamless loop
const ITEMS = [...ORIGINAL_ITEMS, ...ORIGINAL_ITEMS];

export default function ShowcaseSection() {
    return (
        <div className="w-full py-16 overflow-hidden group">
            <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
                {ITEMS.map((item, index) => (
                    <VideoCard key={`${item.id}-${index}`} item={item} />
                ))}
            </div>
        </div>
    );
}

function VideoCard({ item }: { item: typeof ORIGINAL_ITEMS[0] }) {
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
            className="flex-none w-[200px] aspect-[9/16] relative group rounded-xl overflow-hidden bg-card border border-border/50 cursor-pointer"
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
                <div className="absolute bottom-3 left-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-between gap-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300">

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
