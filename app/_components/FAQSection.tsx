"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
    {
        question: "What is an AI Product Avatar?",
        answer: "An AI Product Avatar is a digital model that can hold and showcase your product in realistic video formats. It eliminates the need for traditional photoshoots, allowing you to create high-quality, customizable videos in minutes.",
    },
    {
        question: "How does TopView's AI Product Avatar work?",
        answer: "Simply upload a product image, select a digital avatar from our library, and let the AI generate a video of the avatar holding and presenting your product. It's quick, easy, and requires no technical expertise.",
    },
    {
        question: "Can I use the AI avatars for different types of products?",
        answer: "Yes, our AI avatars are versatile and can showcase a wide range of products, from cosmetics and apparel to electronics and home goods. The system adapts to different product shapes and sizes effortlessly.",
    },
    {
        question: "Are there multilingual options for the avatars?",
        answer: "Absolutely! Our AI avatars can speak multiple languages, allowing you to create content tailored to specific regions and audiences. This is ideal for global marketing campaigns.",
    },
    {
        question: "Do I need any special equipment to use this tool?",
        answer: "No special equipment is needed. All you need is a clean product image, and the tool will handle the rest. It's designed to be user-friendly and accessible to everyone.",
    },
    {
        question: "Is the video output high-quality and watermark-free?",
        answer: "Yes, all video outputs are of professional quality, free from watermarks, and ready for immediate use across eCommerce platforms, social media, or marketing materials.",
    },
    {
        question: "Can I customize the avatars and their actions?",
        answer: "Yes, you can choose from a variety of avatars and customize their poses, gestures, and even languages. This ensures the final video aligns perfectly with your branding and messaging.",
    },
    {
        question: "How long does it take to generate a video?",
        answer: "The process is fast and efficient. Once you've uploaded your product image and made your selections, the video is typically generated within a few minutes.",
    },
    {
        question: "Is there a free version available?",
        answer: "Yes, TopView offers a free version with essential features. For more advanced customization options and resources, premium plans are available.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full py-24 flex flex-col items-center">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Frequently Asked Questions
                </h2>
            </div>

            {/* Accordion */}
            <div className="w-full max-w-3xl mx-auto px-6 flex flex-col gap-4">
                {FAQS.map((faq, index) => (
                    <div
                        key={index}
                        className="border-b bg-background rounded-lg px-4 border-border/10 last:border-none"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full py-6 flex items-center justify-between gap-4 text-left group"
                        >
                            <span className="text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                                {faq.question}
                            </span>
                            <ChevronDown
                                className={cn(
                                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                                    openIndex === index ? "rotate-180 text-brand-primary" : ""
                                )}
                            />
                        </button>

                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-in-out",
                                openIndex === index ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden">
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
