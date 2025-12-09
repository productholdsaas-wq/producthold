import { redirect } from "next/navigation";
import { getUserSubscription } from "@/app/actions/get-user-subscription";
import { auth } from "@clerk/nextjs/server";
import { CreditCard, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { ManageSubscriptionButton } from "./_components/ManageSubscriptionButton";

export default async function BillingPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const subscription = await getUserSubscription();

    if (!subscription) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">User subscription not found. Please contact support.</p>
            </div>
        );
    }

    // Calculate stats
    const creditsAllowed = subscription.credits_allowed || 0;
    const creditsUsed = subscription.credits_used || 0;
    const creditsPercentage = creditsAllowed > 0 ? (creditsUsed / creditsAllowed) * 100 : 0;

    const planName = subscription.plan_tier || "Free";
    const isActive = subscription.subscription_status === "active";
    const statusColor = isActive ? "text-green-500" : "text-yellow-500";

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Billing & Usage</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your subscription and view your credit usage
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Details Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-brand-primary" />
                                Current Plan
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-secondary ${statusColor} bg-opacity-10 capitalize`}>
                                {subscription.subscription_status || "Inactive"}
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1 capitalize">
                                {planName} <span className="text-lg font-normal text-muted-foreground">Plan</span>
                            </p>
                            {subscription.current_period_end && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <Calendar className="w-4 h-4" />
                                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        {/* This would normally be a Server Action form button, simplified here for now */}
                        <ManageSubscriptionButton email={subscription.email} />
                        <Link href="/dashboard/pricing" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
                            Change Plan
                        </Link>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                            Credit Usage
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monthly Credits</span>
                                <span className="font-medium text-foreground">
                                    {creditsUsed} / {creditsAllowed}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-primary to-purple-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(creditsPercentage, 100)}%` }}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">
                                Creates approximately {Math.floor((creditsAllowed - creditsUsed) / 10)} more minutes of video.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                Need more credits? Upgrade your plan or wait for the monthly reset.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
