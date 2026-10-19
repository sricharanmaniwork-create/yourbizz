"use client";

import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    desc: "For trying things out & tiny projects",
    color: "from-slate-500 to-zinc-500",
    border: "border-border",
    cta: "Start free",
    features: [
      "3 active forms",
      "200 submissions / month",
      "50 MB file storage",
      "Basic email notifications",
      "Standard templates",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 19, yearly: 15 },
    desc: "For freelancers & small teams that ship fast",
    color: "from-violet-600 to-fuchsia-500",
    border: "border-violet-400 dark:border-violet-700",
    cta: "Start 14-day trial",
    popular: true,
    features: [
      "Unlimited forms",
      "10,000 submissions / month",
      "10 GB file storage",
      "Conditional logic & calculations",
      "Payments (Stripe)",
      "Custom domain",
      "Remove YourBizz branding",
      "Priority email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 49, yearly: 39 },
    desc: "For growing teams that need governance",
    color: "from-emerald-500 to-teal-500",
    border: "border-border",
    cta: "Start 14-day trial",
    features: [
      "Everything in Pro",
      "50,000 submissions / month",
      "100 GB file storage",
      "5 team members",
      "Role-based access (Owner/Admin/Builder/Reviewer)",
      "Workflows & approval routing",
      "Audit logs (90-day retention)",
      "Custom CSS themes",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: null, yearly: null },
    desc: "For organizations with scale & compliance needs",
    color: "from-amber-500 to-orange-500",
    border: "border-border",
    cta: "Talk to sales",
    features: [
      "Everything in Business",
      "Unlimited submissions",
      "1 TB+ file storage",
      "Unlimited team members",
      "SSO/SAML + SCIM provisioning",
      "Advanced audit logs (3-year retention)",
      "Custom data residency (US/EU/AP)",
      "99.9% uptime SLA + dedicated CSM",
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple pricing that <span className="text-gradient-brand">scales</span> with you
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start free forever. Upgrade when you need more. No setup fees, no
            hidden costs, cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-full border border-border bg-muted/40">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                !yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
              <span className="text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-6 flex flex-col",
                plan.border,
                plan.popular && "shadow-2xl shadow-violet-500/10 scale-[1.02]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{plan.desc}</p>
              </div>

              <div className="mb-5">
                {plan.price.monthly === null ? (
                  <div className="text-3xl font-bold">Custom</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                )}
                {plan.price.monthly !== null && yearly && (
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Billed annually (${plan.price.yearly * 12}/yr)
                  </div>
                )}
              </div>

              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className={cn(
                  "w-full mb-5",
                  plan.popular && `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                )}
              >
                <Link href={plan.id === "enterprise" ? "mailto:sales@yourbizz.app" : "/signup"}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <ul className="space-y-2.5 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={cn("h-4 w-4 mt-0.5 shrink-0", `text-emerald-500`)} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          Need something custom?{" "}
          <Link href="mailto:sales@yourbizz.app" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
            Talk to our team →
          </Link>
        </div>
      </div>
    </section>
  );
}
