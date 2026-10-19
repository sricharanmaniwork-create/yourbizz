"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Building2, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    workspaceName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto sign-in
      const sign = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!sign || sign.error) {
        // Account created but auto-login failed — send to login
        router.push("/login?signup=success");
        return;
      }
      router.push("/app/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  const pwChecks = [
    { ok: form.password.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Z]/.test(form.password), label: "One uppercase letter" },
    { ok: /[0-9]/.test(form.password), label: "One number" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col p-6 sm:p-10 bg-background">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold">YourBizz</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Have an account?{" "}
            <Link href="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Log in
            </Link>
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Start free today</h1>
            <p className="text-muted-foreground">
              No credit card required. Free forever plan included.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 p-3 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="workspaceName"
                  placeholder="Acme Inc. or Jane's Studio"
                  value={form.workspaceName}
                  onChange={(e) => update("workspaceName", e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="new-password"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {pwChecks.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-center gap-1 text-[10px] ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                  >
                    <CheckCircle2 className={`h-3 w-3 ${c.ok ? "" : "opacity-30"}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By signing up you agree to our{" "}
            <Link href="#" className="underline">Terms</Link> and{" "}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="hidden lg:flex bg-mesh-brand items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-violet-500/10" />
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Everything you get on day one:
          </h2>
          <ul className="space-y-3.5">
            {[
              ["Drag-drop builder with 25+ field types", "from-violet-500 to-fuchsia-500"],
              ["Conditional logic & calculated fields", "from-emerald-500 to-teal-500"],
              ["Real-time submissions dashboard", "from-amber-500 to-orange-500"],
              ["Email notifications + auto-responders", "from-rose-500 to-pink-500"],
              ["40+ conversion-optimized templates", "from-cyan-500 to-blue-500"],
              ["REST API + webhooks + Zapier", "from-purple-500 to-violet-500"],
            ].map(([text, color]) => (
              <li key={text} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur p-5">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["from-violet-500 to-fuchsia-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"].map((g, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-background`} />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">Join 12,000+ teams</div>
                <div className="text-xs text-muted-foreground">Shipping forms on YourBizz today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
