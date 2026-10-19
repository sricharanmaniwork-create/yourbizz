"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const useCases = [
  {
    id: "lead-gen",
    name: "Lead Generation",
    color: "from-violet-500 to-fuchsia-500",
    headline: "Capture, qualify & route leads automatically",
    desc: "Embed lead forms on your landing pages, qualify with conditional logic, route to the right sales rep, and sync to your CRM. Real-time Slack alerts included.",
    stats: [
      ["3.4x", "more leads captured"],
      ["78%", "faster follow-up time"],
      ["12k+", "leads per month supported"],
    ],
    features: [
      "Conditional qualification questions",
      "Auto-routing to sales reps by region",
      "HubSpot, Pipedrive, Zoho CRM sync",
      "Real-time Slack & email alerts",
      "Hidden UTM field capture",
      "AI lead scoring (Pro plan)",
    ],
  },
  {
    id: "events",
    name: "Event Registration",
    color: "from-emerald-500 to-teal-500",
    headline: "RSVPs, tickets & check-ins — handled",
    desc: "Sell tickets with Stripe, send branded confirmation emails, generate QR codes for check-in, and export attendee lists in one click.",
    stats: [
      ["2 min", "to launch an event form"],
      ["Stripe", "payments built-in"],
      ["QR", "check-in codes"],
    ],
    features: [
      "Stripe ticket sales + deposits",
      "Capacity limits & waitlists",
      "QR code email attachments",
      "Calendar (.ics) invitations",
      "Group/team registrations",
      "Multi-day event support",
    ],
  },
  {
    id: "feedback",
    name: "Surveys & Feedback",
    color: "from-amber-500 to-orange-500",
    headline: "NPS, CSAT, and deep research — in one place",
    desc: "Star ratings, sliders, matrix questions, branching logic. Real-time charts show distribution and trends as responses come in.",
    stats: [
      ["25+", "question types"],
      ["Real-time", "charts & exports"],
      ["Anon", "or identified modes"],
    ],
    features: [
      "NPS, CSAT, CES templates",
      "Matrix / Likert scale questions",
      "Skip logic & branching",
      "Anonymous responses",
      "CSV / Excel / SPSS export",
      "Custom report dashboards",
    ],
  },
  {
    id: "orders",
    name: "Orders & Payments",
    color: "from-rose-500 to-pink-500",
    headline: "Turn any form into a checkout",
    desc: "Product catalogs, quantities, coupons, shipping, taxes — all built-in. Connect Stripe and start selling in minutes.",
    stats: [
      ["Stripe", "native integration"],
      ["Coupons", "and discount codes"],
      ["0%", "transaction fees"],
    ],
    features: [
      "Product catalog with images",
      "Quantity & variant selectors",
      "Coupon codes & % discounts",
      "Shipping & tax calculation",
      "Stripe Connect for marketplaces",
      "Refunds via dashboard",
    ],
  },
  {
    id: "applications",
    name: "Job & Grant Applications",
    color: "from-cyan-500 to-blue-500",
    headline: "Collect files, review collaboratively, decide faster",
    desc: "Resumes, portfolios, cover letters — all organized per applicant. Reviewer roles, scoring rubrics, and bulk status updates built in.",
    stats: [
      ["2GB", "file uploads/applicant"],
      ["Roles", "for reviewers"],
      ["Bulk", "status updates"],
    ],
    features: [
      "File uploads (PDF, DOCX, images)",
      "Multi-reviewer scoring",
      "Custom scoring rubrics",
      "Status pipeline (New / Review / Interview / Reject / Offer)",
      "Bulk email to shortlist",
      "Blind review mode",
    ],
  },
  {
    id: "internal",
    name: "Internal & Ops",
    color: "from-purple-500 to-violet-500",
    headline: "IT requests, PTO, onboarding — automate the busywork",
    desc: "Pre-built templates for HR, IT, and ops teams. Approvals, routing, and audit logs keep everything tracked.",
    stats: [
      ["40+", "internal templates"],
      ["Approvals", "with routing"],
      ["SOC 2", "audit-ready logs"],
    ],
    features: [
      "PTO, expense, IT request templates",
      "Multi-step approval workflows",
      "Manager routing by department",
      "SSO/SAML for Enterprise",
      "Full audit trail (immutable)",
      "Custom SLA timers",
    ],
  },
];

export function UseCases() {
  const [active, setActive] = useState(useCases[0].id);
  const current = useCases.find((u) => u.id === active)!;

  return (
    <section id="use-cases" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
            Use cases
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From <span className="text-gradient-brand">contact forms</span> to{" "}
            <span className="text-gradient-brand">commerce</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whatever you're collecting — leads, RSVPs, feedback, payments, files,
            approvals — YourBizz has a polished, conversion-optimized template ready.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {useCases.map((u) => (
            <button
              key={u.id}
              onClick={() => setActive(u.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                active === u.id
                  ? "border-transparent text-white shadow-md"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
              style={
                active === u.id
                  ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` }
                  : undefined
              }
            >
              <span
                className={cn(
                  active === u.id && `bg-gradient-to-r ${u.color} text-white -m-2 px-4 py-2 rounded-full`
                )}
              >
                {u.name}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            <div>
              <div className={cn("inline-block rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white mb-4", current.color)}>
                {current.name}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">{current.headline}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{current.desc}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-8">
                {current.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={`bg-gradient-to-r ${current.color} text-white`}>
                <Link href="/signup">
                  Try this template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-3">
                {current.stats.map(([val, label], i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4 text-center"
                  >
                    <div className={cn("text-2xl font-bold bg-gradient-to-br bg-clip-text text-transparent", current.color)}>
                      {val}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-border bg-card p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  What it looks like
                </div>
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <div className="h-2 w-1/3 rounded bg-muted mb-2" />
                      <div className={cn("h-6 rounded bg-gradient-to-br opacity-70", current.color)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
