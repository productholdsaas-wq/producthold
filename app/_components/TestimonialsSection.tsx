"use client";

import Image from "next/image";

const TESTIMONIALS = [
    {
        name: "Noah Davis",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/0.webp",
        quote: "TopView's AI Product Avatar has revolutionized the creation of dynamic content. It's effortless to use and has made our product showcases more engaging, helping us boost our audience interaction significantly.",
    },
    {
        name: "Mason Clark",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/1.webp",
        quote: "TopView's AI avatars provide a cost-effective and highly interactive solution that our clients love. It's a must-have tool in our strategy.",
    },
    {
        name: "Elijah Walker",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/2.webp",
        quote: "TopView has revolutionized how we present our brand's products. The AI avatars add a professional touch to our content and allow us to create stunning visuals without the need for costly photoshoots.",
    },
    {
        name: "Mia Robinson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/3.webp",
        quote: "This tool has made product showcasing simple and incredibly efficient. I love how realistic the AI avatars look, holding and presenting my products perfectly.",
    },
    {
        name: "Olivia Brown",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/4.webp",
        quote: "Using TopView's AI avatars has streamlined my workflow. It's like having a virtual studio—creating professional videos has never been this straightforward.",
    },
    {
        name: "Liam Wilson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/7.webp",
        quote: "TopView's AI Product Avatar has simplified our team's marketing efforts. The flexibility and efficiency it offers are unparalleled, making it an essential tool in our arsenal.",
    },
    {
        name: "Ethan Johnson",
        avatar: "https://d1735p3aqhycef.cloudfront.net/official-website/public/avatar/8.webp",
        quote: "TopView enables me to generate high-quality product videos quickly and easily. The AI avatars are versatile, and the customization options are endless!",
    },
];

const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

export default function TestimonialsSection() {
    return (
        <div className="w-full py-24 flex flex-col items-center overflow-hidden">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center px-6 mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                    How Topview Are Changing Product Showcasing
                </h2>
            </div>

            {/* Marquee */}
            <div className="w-full relative group">
                <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused] px-4">
                    {ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className="w-[350px] md:w-[400px] flex-none bg-card border border-border/50 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                        >
                            <div>
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                                    “ {item.quote} ”
                                </p>
                            </div>

                            <div>
                                <hr className="border-border/10 mb-6" />

                                {/* User */}
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                        <Image
                                            src={item.avatar}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="font-semibold text-foreground">
                                        {item.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

function StarIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.9984 21.304L5.7694 25.9102L7.60728 16.6605L0.683594 10.2578L10.0485 9.14739L13.9984 0.583984L17.9483 9.14739L27.3131 10.2578L20.3895 16.6605L22.2274 25.9102L13.9984 21.304Z" fill="#FBBF24" />
        </svg>
    );
}
