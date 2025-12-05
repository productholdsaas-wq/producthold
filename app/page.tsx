import Image from "next/image";

export default function Home() {
 return (
    <section className="hero-glow min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-elevated p-8 shadow-[var(--shadow-soft)] ring-1 ring-border">
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Blue SaaS Theme ✅
        </h1>

        <p className="text-muted mb-6 text-sm">
          If this card looks premium dark-blue with a glowing CTA button,
          your global theme is working perfectly.
        </p>

        <div className="flex gap-4">
          <button className="btn-primary px-6 py-3 rounded-md text-sm font-semibold">
            Primary Action
          </button>

          <button className="px-6 py-3 rounded-md border border-border text-sm text-foreground hover:bg-white/5 transition">
            Secondary
          </button>
        </div>

      </div>
    </section>
  );
}
