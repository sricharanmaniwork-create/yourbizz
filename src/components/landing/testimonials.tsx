"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We migrated from Jotform + Calendly + a separate CRM. YourBizz replaced all three and cut our SaaS spend by 60%. The builder is faster and the analytics actually tell us where we lose respondents.",
    name: "Priya Sharma",
    title: "Head of Growth",
    company: "Lumenstack",
    initials: "PS",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    quote: "The conditional logic is the best I've used. We built a 12-page grant application with branching, file uploads, and reviewer workflows in an afternoon. The audit logs alone are worth the Business plan.",
    name: "Marcus Okonkwo",
    title: "Operations Director",
    company: "Brightwater Foundation",
    initials: "MO",
    color: "from-emerald-500 to-teal-500",
  },
  {
    quote: "We process 40k+ job applications a year on YourBizz. Sub-second rendering on mobile, perfect file handling, and the reviewer roles mean our recruiting team can work in parallel without stepping on each other.",
    name: "Sara Lindqvist",
    title: "Talent Operations Lead",
    company: "Northwind Tech",
    initials: "SL",
    color: "from-amber-500 to-orange-500",
  },
  {
    quote: "The webhook + REST API let us pipe every submission into our internal data warehouse in real time. Our analysts get fresh signals within 200ms of someone hitting Submit. Game changer.",
    name: "Daniel Park",
    title: "Staff Engineer",
    company: "Conduit Labs",
    initials: "DP",
    color: "from-cyan-500 to-blue-500",
  },
  {
    quote: "I run a small yoga studio. I built my class registration form, took payments, and set up automated confirmation emails in 20 minutes — without writing a single line of code. Worth every penny.",
    name: "Maya Reyes",
    title: "Owner",
    company: "Lotus Path Yoga",
    initials: "MR",
    color: "from-rose-500 to-pink-500",
  },
  {
    quote: "On Enterprise, the SSO + audit logs + custom data residency check every box our security team requires. We rolled out to 800 employees across 3 regions without a single compliance question.",
    name: "Tobias Klein",
    title: "CISO",
    company: "Meridian Health",
    initials: "TK",
    color: "from-purple-500 to-violet-500",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 mb-4">
            <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
            Loved by 12,000+ teams
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From solopreneurs to <span className="text-gradient-brand">enterprises</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Don't take our word for it. Here's what teams shipping on YourBizz every day have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <Quote className="h-6 w-6 text-violet-300 dark:text-violet-800 mb-3" />
              <p className="text-sm text-foreground/80 leading-relaxed mb-5 flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.title}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
