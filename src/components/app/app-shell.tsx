"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutGrid, FileText, Settings, Users, BarChart3, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/forms", label: "Forms", icon: FileText },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3, soon: true },
  { href: "/app/templates", label: "Templates", icon: BookOpen, soon: true },
  { href: "/app/team", label: "Team", icon: Users, soon: true },
  { href: "/app/settings", label: "Settings", icon: Settings, soon: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold">YourBizz</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Button
                key={it.href}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={`w-full justify-start ${active ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300" : "text-muted-foreground"}`}
              >
                <Link href={it.href} className="relative">
                  <it.icon className="mr-2 h-4 w-4" />
                  {it.label}
                  {it.soon && (
                    <span className="ml-auto text-[9px] rounded-full bg-muted px-1.5 py-0.5 font-semibold uppercase">
                      Soon
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 border-b border-border bg-card flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold">YourBizz</span>
        </Link>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
