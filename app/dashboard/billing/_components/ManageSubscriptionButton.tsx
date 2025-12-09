"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ManageSubscriptionButton({ email }: { email: string | undefined }) {
    const [loading, setLoading] = useState(false);

    const openBillingPortal = async () => {
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch("/api/billing/portal", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            toast.error("Failed to open billing portal");
            console.error("Failed to open billing portal:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={openBillingPortal}
            disabled={loading || !email}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-light transition-colors text-sm font-medium shadow-lg shadow-brand-primary/20 flex items-center justify-center min-w-[160px]"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Manage Subscription
        </button>
    );
}
