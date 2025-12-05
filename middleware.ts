import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// All private routes needing authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/topview(.*)",
  "/api/user(.*)",
  "/api/generate-(.*)",
  "/api/save-video(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;

  // ⚠️ Never protect webhook - required by Stripe
  if (path.startsWith("/api/webhook")) return;

  // ⚠️ Allow public checkout session endpoint (Stripe)
  if (path.startsWith("/api/billing/checkout")) return;

  // ⚠️ Allow public endpoints
  if (path.startsWith("/api/voices")) return;
  if (path.startsWith("/api/get-video-script")) return;
  if (path.startsWith("/api/generate-script-prompt")) return;
  if (path.startsWith("/api/remotion-progress")) return;
  if (path.startsWith("/api/remotion-render")) return;

  // 🔐 Protect private endpoints
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// ✅ SAFE Next.js matcher (no capture groups)
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
  ],
};
