"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight">
              YourBizz
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Forms · Bookings · CRM
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
          >
            <Link href="/signup">Start free</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-1 p-4">
            <NavLinks mobile onClick={() => setOpen(false)} />
            <div className="h-px bg-border my-2" />
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
            >
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinks({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  const items = [
    { label: "Features", href: "#features" },
    { label: "Use cases", href: "#use-cases" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          onClick={onClick}
          className={cn(
            "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md",
            mobile ? "px-3 py-2 hover:bg-muted" : "px-3 py-2"
          )}
        >
          {it.label}
        </Link>
      ))}
    </>
  );
}
