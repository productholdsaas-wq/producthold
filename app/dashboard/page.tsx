"use client";

import { Video, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary-light p-8 text-white shadow-[var(--shadow-glow)]">
        <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-white/90 text-lg">
          Ready to create amazing AI-powered UGC videos?
        </p>
        <button className="mt-6 px-6 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg">
          Create New Video
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Videos */}
        <div className="rounded-xl bg-card border border-border p-6 hover:border-brand-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <Video className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Videos
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">24</p>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-500">+3</span> this week
            </p>
          </div>
        </div>

        {/* Credits Used */}
        <div className="rounded-xl bg-card border border-border p-6 hover:border-brand-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Credits Used
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">10 / 100</p>
            <p className="text-sm text-muted-foreground">
              90 credits remaining
            </p>
          </div>
        </div>

        {/* Processing */}
        <div className="rounded-xl bg-card border border-border p-6 hover:border-brand-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <Clock className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Processing
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">2</p>
            <p className="text-sm text-muted-foreground">
              Videos in progress
            </p>
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Recent Videos</h3>
          <button className="text-sm text-brand-primary hover:text-brand-primary-light font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 p-4 rounded-lg bg-sidebar border border-sidebar-border hover:border-brand-primary/50 transition-all"
            >
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-brand-primary-dark to-brand-primary flex items-center justify-center">
                <Video className="w-8 h-8 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">
                  Product Video #{item}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Created 2 days ago • 0:45 duration
                </p>
              </div>

              {/* Status Badge */}
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-medium text-green-500">
                  Completed
                </span>
              </div>

              {/* Actions */}
              <button className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-light transition-all">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6 hover:border-brand-primary/50 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-primary-dark to-brand-primary flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Create from Template
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose from our pre-made templates to get started quickly
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 hover:border-brand-primary/50 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-primary-dark to-brand-primary flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upgrade Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            Get more credits and unlock premium features
          </p>
        </div>
      </div>
    </div>
  );
}
