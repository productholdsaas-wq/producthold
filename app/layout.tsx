export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidshortify",
  description: "Generate AI UGC videos in minutes, your way.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
          <Provider>{children}</Provider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
