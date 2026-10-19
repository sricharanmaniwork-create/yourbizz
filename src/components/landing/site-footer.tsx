"use client";

import Link from "next/link";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold">YourBizz</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
              Forms, bookings & CRM for modern teams. Build, publish, and analyze
              — all in one place.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" aria-label="Twitter" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com" aria-label="GitHub" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterCol title="Product" links={[
            ["Features", "#features"],
            ["Use cases", "#use-cases"],
            ["Templates", "#templates"],
            ["Pricing", "#pricing"],
            ["Changelog", "#"],
            ["Roadmap", "#"],
          ]} />

          <FooterCol title="Solutions" links={[
            ["Lead generation", "#"],
            ["Event registration", "#"],
            ["Surveys", "#"],
            ["Payments", "#"],
            ["Internal ops", "#"],
            ["Education", "#"],
          ]} />

          <FooterCol title="Resources" links={[
            ["Docs", "#"],
            ["API reference", "#"],
            ["Blog", "#"],
            ["Tutorials", "#"],
            ["Community", "#"],
            ["Webinars", "#"],
          ]} />

          <FooterCol title="Company" links={[
            ["About", "#"],
            ["Careers", "#"],
            ["Contact", "#"],
            ["Press", "#"],
            ["Partners", "#"],
            ["Legal", "#"],
          ]} />
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} YourBizz, Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Security</Link>
            <Link href="#" className="hover:text-foreground">DPA</Link>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
