"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Zap } from "lucide-react";

const stats = [
  { icon: FileText, value: "8.4M+", label: "Forms created", color: "from-violet-500 to-fuchsia-500" },
  { icon: Users, value: "1.2B+", label: "Submissions collected", color: "from-emerald-500 to-teal-500" },
  { icon: Zap, value: "99.99%", label: "Uptime last 12 months", color: "from-amber-500 to-orange-500" },
  { icon: TrendingUp, value: "12,000+", label: "Teams worldwide", color: "from-rose-500 to-pink-500" },
];

export function StatsBar() {
  return (
    <section className="border-y border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="h-6 w-6 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
