"use client";

import {
  Sparkles, Zap, Shield, BarChart3, Workflow, Globe,
  CreditCard, Users, FileText, Bell, Palette, Code2,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Drag-drop builder",
    desc: "25+ field types, multi-page forms, conditional logic, calculated fields. Build any form in minutes.",
    color: "from-violet-500 to-fuchsia-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-600 dark:text-violet-300",
  },
  {
    icon: Zap,
    title: "Lightning-fast",
    desc: "Edge-rendered public forms with sub-100ms TTFB. Mobile-first, optimized for conversions on any device.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-300",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    desc: "Row-level security, SOC 2-ready audit logs, GDPR tools, PII encryption, SSO/SAML on Enterprise.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    desc: "Conversion funnels, drop-off analysis, field-level abandonment, geo/device breakdowns, custom date ranges.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-600 dark:text-cyan-300",
  },
  {
    icon: Workflow,
    title: "Workflows & automation",
    desc: "Trigger → condition → action rules. Send emails, fire webhooks, update fields, route to teammates.",
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-300",
  },
  {
    icon: Globe,
    title: "Custom domain & i18n",
    desc: "Publish to yourbizz.app/f/yourslug, embed via iframe, or use your own domain. 20+ languages out of the box.",
    color: "from-fuchsia-500 to-purple-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    text: "text-fuchsia-600 dark:text-fuchsia-300",
  },
  {
    icon: CreditCard,
    title: "Payments built-in",
    desc: "Collect payments with Stripe. Sell products, accept donations, take deposits. Recurring supported.",
    color: "from-teal-500 to-emerald-500",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-600 dark:text-teal-300",
  },
  {
    icon: Users,
    title: "Team workspaces",
    desc: "Multiple workspaces, role-based access (Owner/Admin/Builder/Reviewer/Viewer), shared templates, audit trails.",
    color: "from-purple-500 to-violet-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-300",
  },
  {
    icon: FileText,
    title: "40+ templates",
    desc: "Contact, RSVP, survey, registration, order, feedback, job application, lead-gen — start from a polished base.",
    color: "from-orange-500 to-rose-500",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-600 dark:text-orange-300",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    desc: "Email alerts on submit, auto-responders with merge fields, routing rules, Slack/Discord/Teams webhooks.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-600 dark:text-pink-300",
  },
  {
    icon: Palette,
    title: "White-label themes",
    desc: "Custom fonts, colors, button styles, background images or gradients. Full CSS editor on Business plan.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-600 dark:text-violet-300",
  },
  {
    icon: Code2,
    title: "REST API & SDK",
    desc: "Programmatic form creation, submission retrieval, webhooks. JavaScript SDK + Zapier/Make integrations.",
    color: "from-slate-500 to-zinc-500",
    bg: "bg-slate-50 dark:bg-slate-950/40",
    text: "text-slate-600 dark:text-slate-300",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 dark:bg-violet-950/40 dark:border-violet-900 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-4">
            <Sparkles className="h-3 w-3" />
            Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            One platform. <span className="text-gradient-brand">Infinite</span> use cases.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From a simple contact form to a multi-step booking flow with payments
            and CRM sync — YourBizz scales with you. Built for solo founders and
            10,000-person teams alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-violet-500/5 hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <div className={`h-5 w-5 rounded-md bg-gradient-to-br ${f.color}`} />
                <f.icon className={`h-5 w-5 -ml-5 ${f.text}`} strokeWidth={2.2} />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
