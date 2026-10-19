"use client";

import { motion } from "framer-motion";
import { MousePointerClick, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    title: "Drag, drop, customize",
    desc: "Pick from 25+ field types. Add conditional logic, calculations, and your branding. No code required — what you see is what your respondents see.",
    color: "from-violet-500 to-fuchsia-500",
    num: "01",
  },
  {
    icon: Rocket,
    title: "Publish in one click",
    desc: "Share your form via yourbizz.app/f/yourslug, embed it as an iframe on your site, or use your own custom domain. Mobile-optimized automatically.",
    color: "from-emerald-500 to-teal-500",
    num: "02",
  },
  {
    icon: BarChart3,
    title: "Collect & analyze",
    desc: "Watch submissions arrive in real time. Filter, search, export to CSV/PDF. See conversion funnels, drop-off points, and field-level insights.",
    color: "from-amber-500 to-orange-500",
    num: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From idea to <span className="text-gradient-brand">live form</span> in 3 steps
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No setup. No developer. No waiting. Just you, your form, and your audience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-violet-300 via-emerald-300 to-amber-300 dark:from-violet-800 dark:via-emerald-800 dark:to-amber-800" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
                <div className={`absolute h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl`}>
                  <s.icon className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-card border-2 border-border flex items-center justify-center text-[10px] font-bold">
                  {s.num}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
