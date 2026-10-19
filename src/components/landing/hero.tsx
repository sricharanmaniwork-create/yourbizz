"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh-brand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <Badge
              variant="secondary"
              className="w-fit gap-1.5 rounded-full py-1 pl-1.5 pr-3 border border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:border-violet-900 dark:text-violet-300"
            >
              <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                New
              </span>
              <span className="text-xs font-medium">
                Conditional logic + multi-page forms are live
              </span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Build forms that{" "}
              <span className="text-gradient-brand">convert.</span>
              <br />
              Run your whole business online.
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              YourBizz is the all-in-one platform for forms, bookings, and
              customer relationships. Drag-drop builder, conditional logic,
              payments, analytics, and 40+ templates — no code required.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
              >
                <Link href="/signup">
                  Start free — no card required
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link href="#demo">
                  <Play className="mr-2 h-4 w-4" />
                  Watch demo
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free forever plan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Unlimited forms (Pro)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[
                  "from-violet-500 to-fuchsia-500",
                  "from-emerald-500 to-teal-500",
                  "from-amber-500 to-orange-500",
                  "from-rose-500 to-pink-500",
                  "from-cyan-500 to-blue-500",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-background`}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Loved by 12,000+ teams worldwide
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <FormBuilderMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FormBuilderMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-amber-500/30 rounded-3xl blur-2xl" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-violet-500/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-3 h-6 rounded-md bg-background/60 text-[10px] text-muted-foreground flex items-center justify-center">
            app.yourbizz.app/forms/new/edit
          </div>
        </div>

        {/* Builder body */}
        <div className="grid grid-cols-[180px_1fr_180px] h-[420px] text-[11px]">
          {/* Palette */}
          <div className="border-r border-border bg-muted/20 p-3 overflow-hidden">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Fields
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ["Short Text", "from-violet-500 to-purple-500"],
                ["Email", "from-emerald-500 to-teal-500"],
                ["Dropdown", "from-amber-500 to-orange-500"],
                ["Rating", "from-rose-500 to-pink-500"],
                ["Date", "from-cyan-500 to-blue-500"],
                ["File", "from-fuchsia-500 to-violet-500"],
              ].map(([label, g], i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-card p-1.5 flex flex-col gap-1"
                >
                  <div className={`h-4 rounded bg-gradient-to-br ${g} opacity-80`} />
                  <div className="text-[9px] font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="p-4 overflow-hidden">
            <div className="text-sm font-bold mb-1">Customer Feedback Survey</div>
            <div className="text-[10px] text-muted-foreground mb-3">3 fields · 1 page</div>

            <div className="space-y-2.5">
              <FieldPreview label="How did you hear about us?" type="dropdown" tint="violet" />
              <FieldPreview label="Rate your experience" type="rating" tint="amber" />
              <FieldPreview label="Any additional feedback?" type="textarea" tint="emerald" />
            </div>

            <div className="mt-4 h-7 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[10px] font-semibold flex items-center justify-center">
              Submit
            </div>
          </div>

          {/* Properties */}
          <div className="border-l border-border bg-muted/20 p-3 overflow-hidden">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Properties
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-[9px] text-muted-foreground">Label</div>
                <div className="h-5 rounded bg-background border border-border" />
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-muted-foreground">Required</div>
                <div className="h-5 w-9 rounded-full bg-emerald-500 relative">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-muted-foreground">Show if</div>
                <div className="h-5 rounded bg-background border border-border text-[8px] flex items-center px-1.5 text-muted-foreground">
                  rating &gt;= 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-3 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold">+1,284</div>
            <div className="text-[10px] text-muted-foreground">submissions today</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FieldPreview({
  label,
  type,
  tint,
}: {
  label: string;
  type: string;
  tint: "violet" | "emerald" | "amber";
}) {
  const ring = {
    violet: "ring-violet-200 dark:ring-violet-900",
    emerald: "ring-emerald-200 dark:ring-emerald-900",
    amber: "ring-amber-200 dark:ring-amber-900",
  }[tint];

  return (
    <div className={`rounded-lg border border-border bg-background p-2 ring-1 ${ring}`}>
      <div className="text-[10px] font-medium mb-1.5">{label}</div>
      {type === "dropdown" && (
        <div className="h-5 rounded border border-border bg-muted/30 flex items-center justify-between px-1.5 text-[9px] text-muted-foreground">
          Select...<span>▾</span>
        </div>
      )}
      {type === "rating" && (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      )}
      {type === "textarea" && (
        <div className="h-8 rounded border border-border bg-muted/30" />
      )}
    </div>
  );
}
