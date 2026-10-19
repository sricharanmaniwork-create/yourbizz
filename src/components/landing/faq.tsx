"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is YourBizz really free forever?",
    a: "Yes. The Free plan never expires and doesn't require a credit card. You get 3 active forms, 200 submissions per month, and 50MB of file storage — enough to run a small project or validate an idea. Upgrade only when you outgrow it.",
  },
  {
    q: "How does YourBizz compare to Zoho Forms, Jotform, or Typeform?",
    a: "YourBizz matches the core feature surface of all three (drag-drop builder, conditional logic, payments, analytics, integrations) but bundles forms + bookings + CRM together — so you don't need separate subscriptions. We also charge $0 transaction fees on payments (most competitors charge 2-3%) and our public forms render on the edge for sub-100ms TTFB.",
  },
  {
    q: "Can I migrate my existing forms from another platform?",
    a: "Yes. We provide a JSON import tool that accepts field definitions from Jotform, Typeform, and Zoho Forms (with field-type mapping). For large migrations, our team will do it for you on Business and Enterprise plans — reach out to support@yourbizz.app.",
  },
  {
    q: "What about data security and compliance?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We're SOC 2 Type II audit-ready, GDPR compliant, and offer custom data residency (US/EU/AP) on Enterprise. PII fields can be marked for additional encryption and auto-purge. Full audit logs are retained for 90 days (Pro/Business) or 3 years (Enterprise).",
  },
  {
    q: "Do you support team collaboration?",
    a: "Yes. Workspaces are the unit of tenancy, and within a workspace you can invite teammates with one of 5 roles: Owner, Admin, Builder, Reviewer, Viewer. Pro includes 1 user; Business includes 5; Enterprise is unlimited. Shared form templates, audit trails, and granular per-form permissions are all built in.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes — Pro and above support custom domains (e.g. forms.yourcompany.com). Just point a CNAME to us and we handle TLS automatically. Enterprise supports wildcard domains and bring-your-own-cert.",
  },
  {
    q: "What happens if I hit my submission limit?",
    a: "On paid plans, we never block submissions — we'll notify you at 80%, 90%, and 100% of your quota, and you can either upgrade or pay $0.01 per extra submission. On the Free plan, the 201st submission shows a friendly 'form paused' message until the next billing cycle or an upgrade.",
  },
  {
    q: "Do you offer a non-profit or educational discount?",
    a: "Yes — 50% off Pro and Business for registered non-profits and accredited educational institutions. Email sales@yourbizz.app with your documentation and we'll set it up within one business day.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 dark:bg-fuchsia-950/40 dark:border-fuchsia-900 px-3 py-1 text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300 mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Questions, answered
          </h2>
          <p className="text-lg text-muted-foreground">
            Can't find what you're looking for?{" "}
            <a href="mailto:support@yourbizz.app" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Email us
            </a>.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-all",
                open === i ? "border-violet-300 dark:border-violet-800 shadow-md" : "border-border"
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-base">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground shrink-0 transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
