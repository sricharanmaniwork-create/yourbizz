"use client";

import Link from "next/link";
import { ArrowRight, FileText, Calendar, Star, ShoppingCart, Briefcase, Mail, Heart, ClipboardList, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const templates = [
  { name: "Contact Form", icon: Mail, color: "from-violet-500 to-fuchsia-500", category: "Marketing", uses: "12.4k" },
  { name: "Event Registration", icon: Calendar, color: "from-emerald-500 to-teal-500", category: "Events", uses: "8.1k" },
  { name: "Customer Survey", icon: Star, color: "from-amber-500 to-orange-500", category: "Feedback", uses: "9.7k" },
  { name: "Product Order", icon: ShoppingCart, color: "from-rose-500 to-pink-500", category: "Commerce", uses: "6.3k" },
  { name: "Job Application", icon: Briefcase, color: "from-cyan-500 to-blue-500", category: "HR", uses: "5.2k" },
  { name: "Volunteer Sign-up", icon: Heart, color: "from-fuchsia-500 to-purple-500", category: "Community", uses: "3.8k" },
  { name: "IT Request", icon: ClipboardList, color: "from-teal-500 to-emerald-500", category: "Internal", uses: "4.5k" },
  { name: "Course Enrollment", icon: GraduationCap, color: "from-orange-500 to-rose-500", category: "Education", uses: "2.9k" },
];

export function Templates() {
  return (
    <section id="templates" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 dark:bg-cyan-950/40 dark:border-cyan-900 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-4">
            <FileText className="h-3 w-3" />
            40+ templates
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Start from a <span className="text-gradient-brand">polished base</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every template is conversion-optimized, mobile-first, and fully customizable.
            Pick one, swap your branding, and you're live in minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((t) => (
            <Link
              key={t.name}
              href="/signup"
              className="group rounded-2xl border border-border bg-card p-5 hover:shadow-xl hover:shadow-violet-500/5 hover:border-violet-300 dark:hover:border-violet-800 transition-all"
            >
              <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-4 shadow-md", t.color)}>
                <t.icon className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t.category}
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {t.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.uses} uses</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">
              Browse all 40+ templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
