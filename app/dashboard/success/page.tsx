"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Success() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setStatus("Invalid session");
        setLoading(false);
        return;
      }

      // OPTIONAL but recommended: Verify session from backend
      const res = await fetch("/api/billing/verify-session", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (data.error) {
        setStatus("Payment error! Contact support.");
      } else {
        setStatus("Payment Successful 🎉 Redirecting...");
      }

      setLoading(false);

      // Redirect user after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }

    verifySession();
  }, [sessionId]);

  return (
    <div className="flex flex-col bg-black text-white items-center justify-center min-h-screen">
      {loading ? (
        <h1 className="text-xl font-semibold">Verifying payment…</h1>
      ) : (
        <h1 className="text-xl font-semibold">{status}</h1>
      )}
    </div>
  );
}
