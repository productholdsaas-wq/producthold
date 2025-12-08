"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex bg-background hero-glow overflow-hidden">
            {/* LEFT SIDE - BRANDING & VISUALS */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between">
                {/* Background Gradient/Image - Removed as main container has hero-glow */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-elevated/50 to-transparent" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/Full_logo.png"
                            alt="ProductHold Logo"
                            width={180}
                            height={30}
                            className="object-contain"
                        />
                    </Link>

                    {/* Main Visuals & Text */}
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Create AI UGC Videos in Minutes, Your Way
                        </h1>
                        <p className="text-gray-400 max-w-md mb-10">
                            Create stunning and ready-to-use AI UGC videos delivered while your coffee is still hot.
                        </p>

                        {/* Overlapping Videos - Mix of Faceless & UGC */}
                        <div className="relative w-full max-w-2xl h-[420px] flex items-center justify-center">
                            {/* Video 1 - Left Up (Faceless) */}
                            <video
                                src="/video/RealStory.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute w-[220px] h-[360px] rounded-2xl object-cover border-2 border-white/20 shadow-2xl rotate-3 -translate-x-52 -translate-y-8 z-10"
                            />

                            {/* Video 2 - Center Left Down (Faceless) */}
                            <video
                                src="/video/newyork.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute w-[220px] h-[360px] rounded-2xl object-cover border-2 border-white/20 shadow-2xl -rotate-3 -translate-x-20 translate-y-8 z-20"
                            />

                            {/* Video 3 - Center Right Up (UGC) */}
                            <video
                                src="https://www.vidaify.com/vid5.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute w-[220px] h-[360px] rounded-2xl object-cover border-2 border-brand-primary-light/40 shadow-2xl rotate-3 translate-x-20 -translate-y-8 z-30"
                            />

                            {/* Video 4 - Right Down (UGC) */}
                            <video
                                src="https://www.vidaify.com/vid4.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute w-[220px] h-[360px] rounded-2xl object-cover border-2 border-brand-primary-light/40 shadow-2xl -rotate-3 translate-x-52 translate-y-8 z-40"
                            />
                        </div>
                    </div>

                    {/* Trust Badges / Footer */}
                    <div className="flex items-center justify-center gap-6 mt-8">
                        {/* Placeholders for badges - using text/icons for now if specific assets aren't known */}
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className="text-[#FFB800]">★</span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400">Based on 100+ reviews from our users</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 bg-black/40 backdrop-blur-sm border-l border-white/5">
                <div className="w-full max-w-md bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
                    {/* Mobile Logo (visible only on small screens) */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/Full_logo.png"
                                alt="ProductHold Logo"
                                width={120}
                                height={32}
                                className="h-8 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Logo (centered at top, visible only on large screens) */}
                    <div className="hidden lg:flex items-center justify-center gap-2 mb-8">
                        <Image
                            src="/Full_logo.png"
                            alt="ProductHold Logo"
                            width={150}
                            height={40}
                            className="object-contain h-10 w-auto"
                        />
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
