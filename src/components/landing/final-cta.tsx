"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 opacity-10" />
      <div className="absolute inset-0 bg-mesh-brand opacity-50" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300 bg-violet-100 dark:bg-violet-950/60 dark:border-violet-800 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-6">
            <Sparkles className="h-3 w-3" />
            Get started in 60 seconds
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Your first form is{" "}
            <span className="text-gradient-brand">3 clicks</span> away.
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Join 12,000+ teams who run their forms, bookings, and customer
            relationships on YourBizz. No credit card, no setup, no limits on
            how far you can go.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
            >
              <Link href="/signup">
                Create your free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link href="/login">
                I already have an account
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
