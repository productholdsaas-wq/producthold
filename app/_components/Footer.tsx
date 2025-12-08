"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full border-t border-border/10 pt-20 pb-12">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 mb-20">

                    {/* Brand Column */}
                    <div className="flex flex-col gap-8 lg:w-1/3">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/Full_logo.png"
                                    alt="ProductHold Logo"
                                    width={180}
                                    height={50}
                                    className=" object-contain"
                                />
                            </div>
                            <p className="text-muted-foreground text-lg">
                                Scaling your video creation with AI
                            </p>
                        </div>

                        {/* Language Selector (Visual) */}
                        <div>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card hover:bg-muted transition-colors text-foreground font-medium">
                                <Globe className="w-5 h-5" />
                                <span>English</span>
                            </button>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {/* LinkedIn */}
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="text-foreground fill-current">
                                    <path d="M44.4469 0H3.54375C1.58437 0 0 1.54688 0 3.45938V44.5312C0 46.4437 1.58437 48 3.54375 48H44.4469C46.4063 48 48 46.4438 48 44.5406V3.45938C48 1.54688 46.4063 0 44.4469 0ZM14.2406 40.9031H7.11563V17.9906H14.2406V40.9031ZM10.6781 14.8688C8.39063 14.8688 6.54375 13.0219 6.54375 10.7437C6.54375 8.46562 8.39063 6.61875 10.6781 6.61875C12.9563 6.61875 14.8031 8.46562 14.8031 10.7437C14.8031 13.0125 12.9563 14.8688 10.6781 14.8688ZM40.9031 40.9031H33.7875V29.7656C33.7875 27.1125 33.7406 23.6906 30.0844 23.6906C26.3812 23.6906 25.8187 26.5875 25.8187 29.5781V40.9031H18.7125V17.9906H25.5375V21.1219H25.6312C26.5781 19.3219 28.9031 17.4188 32.3625 17.4188C39.5719 17.4188 40.9031 22.1625 40.9031 28.3313V40.9031V40.9031Z" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                                <svg width="24" height="24" viewBox="0 0 33 23" fill="none" className="text-foreground fill-current">
                                    <path d="M13.25 16.375L21.6838 11.5L13.25 6.625V16.375ZM32.035 3.65125C32.2462 4.415 32.3925 5.43875 32.49 6.73875C32.6038 8.03875 32.6525 9.16 32.6525 10.135L32.75 11.5C32.75 15.0588 32.49 17.675 32.035 19.3487C31.6287 20.8113 30.6863 21.7537 29.2237 22.16C28.46 22.3712 27.0625 22.5175 24.9175 22.615C22.805 22.7288 20.8713 22.7775 19.0837 22.7775L16.5 22.875C9.69125 22.875 5.45 22.615 3.77625 22.16C2.31375 21.7537 1.37125 20.8113 0.965 19.3487C0.75375 18.585 0.6075 17.5613 0.51 16.2612C0.39625 14.9613 0.3475 13.84 0.3475 12.865L0.25 11.5C0.25 7.94125 0.51 5.325 0.965 3.65125C1.37125 2.18875 2.31375 1.24625 3.77625 0.84C4.54 0.62875 5.9375 0.4825 8.0825 0.385C10.195 0.27125 12.1287 0.2225 13.9163 0.2225L16.5 0.125C23.3088 0.125 27.55 0.385 29.2237 0.84C30.6863 1.24625 31.6287 2.18875 32.035 3.65125Z" />
                                </svg>
                            </a>
                            {/* Discord */}
                            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                                <svg width="24" height="24" viewBox="0 0 1280 1024" fill="none" className="text-foreground fill-current">
                                    <path d="M1049.062 139.672a3 3 0 0 0-1.528-1.4A970.13 970.13 0 0 0 808.162 64.06a3.632 3.632 0 0 0-3.846 1.82 674.922 674.922 0 0 0-29.8 61.2 895.696 895.696 0 0 0-268.852 0 619.082 619.082 0 0 0-30.27-61.2 3.78 3.78 0 0 0-3.848-1.82 967.378 967.378 0 0 0-239.376 74.214 3.424 3.424 0 0 0-1.576 1.352C78.136 367.302 36.372 589.38 56.86 808.708a4.032 4.032 0 0 0 1.53 2.75 975.332 975.332 0 0 0 293.65 148.378 3.8 3.8 0 0 0 4.126-1.352A696.4 696.4 0 0 0 416.24 860.8a3.72 3.72 0 0 0-2.038-5.176 642.346 642.346 0 0 1-91.736-43.706 3.77 3.77 0 0 1-0.37-6.252 502.094 502.094 0 0 0 18.218-14.274 3.638 3.638 0 0 1 3.8-0.512c192.458 87.834 400.82 87.834 591 0a3.624 3.624 0 0 1 3.848 0.466 469.066 469.066 0 0 0 18.264 14.32 3.768 3.768 0 0 1-0.324 6.252 602.814 602.814 0 0 1-91.78 43.66 3.75 3.75 0 0 0-2 5.222 782.11 782.11 0 0 0 60.028 97.63 3.728 3.728 0 0 0 4.126 1.4A972.096 972.096 0 0 0 1221.4 811.458a3.764 3.764 0 0 0 1.53-2.704c24.528-253.566-41.064-473.824-173.868-669.082zM444.982 675.16c-57.944 0-105.688-53.174-105.688-118.478s46.818-118.482 105.688-118.482c59.33 0 106.612 53.64 105.686 118.478 0 65.308-46.82 118.482-105.686 118.482z m390.76 0c-57.942 0-105.686-53.174-105.686-118.478s46.818-118.482 105.686-118.482c59.334 0 106.614 53.64 105.688 118.478 0 65.308-46.354 118.482-105.688 118.482z" />
                                </svg>
                            </a>
                        </div>

                        {/* Trustpilot (Placeholder) */}
                        <div className="bg-card border border-border/20 rounded-lg p-2 w-fit">
                            <div className="flex items-center gap-1 text-sm font-semibold">
                                <span className="text-emerald-500">★</span> Trustpilot
                            </div>
                        </div>

                    </div>

                    {/* Links Columns */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">

                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">AI tools</h4>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Avatar 4</Link>
                            <Link href="/gen/product-avatar" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Product Avatar</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Product AnyShoot</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Materials to Video</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">URL to Video</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">View all →</Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">Use cases</h4>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Advertising</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Affiliate marketing</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Ecommerce</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">DTC brands</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">AI live stream</Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">Resources</h4>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Blog</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Affiliate program</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Learning center</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Alternative</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">API</Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">Company</h4>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Privacy policy</Link>
                            <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors text-sm">Terms</Link>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © 2025 ProductHold PTE. LTD. | Singapore
                    </p>
                </div>
            </div>
        </footer>
    );
}
