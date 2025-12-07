"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <div className="relative isolate pt-14 overflow-hidden">

            {/* ✅ Premium Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.15] -z-20" />

            {/* ✅ Floating Gradient Orbs */}
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-1/4 w-72 h-72 bg-brand-primary/30 rounded-full blur-[120px] -z-10"
            />

            <motion.div
                animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[140px] -z-10"
            />

            {/* ✅ Premium Light Streak */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />

            <div className="py-24 sm:py-32 lg:pb-40">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="mx-auto max-w-2xl text-center"
                    >

                        {/* ✅ Animated Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6"
                        >
                            Product Avatars for <br className="hidden sm:block" />
                            <span className="relative inline-block text-brand-primary">
                                AI UGC Videos
                                <span className="absolute inset-x-0 -bottom-1 h-[6px] bg-brand-primary/20 rounded-full blur-md" />
                            </span>
                        </motion.h1>

                        {/* ✅ Subtitle Fade-Up */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="mt-6 text-lg leading-8 text-muted-foreground mb-10"
                        >
                            Upload your product image and instantly create an AI avatar showcasing it.
                            <br className="hidden sm:block" />
                            Create scroll-stopping UGC without ever picking up a camera.
                        </motion.p>

                        {/* ✅ Premium CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="mt-10 flex items-center justify-center gap-x-6"
                        >
                            <Link href="/dashboard">
                                <button className="relative btn-primary px-10 py-4 rounded-2xl text-lg font-semibold flex items-center gap-3 group overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

                                    {/* ✅ Button Glow */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-brand-primary via-purple-500 to-brand-primary opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500" />

                                    <span className="relative flex items-center gap-2">
                                        Create Now
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>

                                </button>
                            </Link>
                        </motion.div>

                    </motion.div>

                </div>
            </div>
        </div>
    );
}
