"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <div className="w-full py-24 px-6 flex justify-center">
            <div className="w-full max-w-5xl bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] rounded-3xl p-12 md:p-16 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">

                {/* Vibrant Overlay Gradient - Animated */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-dark via-purple-600 to-brand-primary mix-blend-overlay z-0 animate-gradient-flow opacity-90"></div>

                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight max-w-3xl relative z-10">
                    Use Product Avatar to create product introduction videos quickly
                </h2>

                <Link href="/gen/product-avatar" className="relative z-10">
                    <button className="bg-white text-brand-primary-dark px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 hover:bg-white/90 transition-all hover:scale-105 hover:shadow-lg">
                        Start Now
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
