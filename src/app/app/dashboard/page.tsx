"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, FileText, MoreVertical, Loader2, Users, BarChart3,
  Clock, TrendingUp, Sparkles, Copy, Trash2, ExternalLink, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatRelative, formatNumber } from "@/lib/constants";
import { AppShell } from "@/components/app/app-shell";

type FormItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
  publicToken?: string;
  isClosed: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forms", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setForms(data.forms || []);
    } catch (e) {
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function createForm() {
    setCreating(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Untitled Form ${new Date().toLocaleDateString()}`,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        toast.error(e?.error || "Failed to create form");
        return;
      }
      const { form } = await res.json();
      toast.success("Form created — let's build it!");
      router.push(`/app/forms/${form.id}/edit`);
    } catch (e) {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(form: FormItem) {
    const res = await fetch(`/api/forms/${form.id}/publish`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }
    const { form: updated } = await res.json();
    setForms((prev) =>
      prev.map((f) => (f.id === updated.id ? { ...f, status: updated.status } : f))
    );
    toast.success(updated.status === "published" ? "Form published 🎉" : "Form unpublished");
  }

  async function deleteForm(form: FormItem) {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete");
      return;
    }
    setForms((prev) => prev.filter((f) => f.id !== form.id));
    toast.success("Form deleted");
  }

  const filtered = forms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalSubmissions = forms.reduce((s, f) => s + f.submissionCount, 0);
  const publishedCount = forms.filter((f) => f.status === "published").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build, publish, and analyze your forms in one place.
            </p>
          </div>
          <Button
            onClick={createForm}
            disabled={creating}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white"
          >
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New form
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total forms" value={formatNumber(forms.length)} icon={FileText} color="from-violet-500 to-fuchsia-500" />
          <StatCard label="Published" value={formatNumber(publishedCount)} icon={Sparkles} color="from-emerald-500 to-teal-500" />
          <StatCard label="Submissions" value={formatNumber(totalSubmissions)} icon={TrendingUp} color="from-amber-500 to-orange-500" />
          <StatCard label="Team seats" value="1" icon={Users} color="from-cyan-500 to-blue-500" />
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Forms grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="inline-flex h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-950 items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold mb-1">
                {search ? "No forms match your search" : "No forms yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? "Try a different query." : "Create your first form to get started."}
              </p>
              {!search && (
                <Button onClick={createForm} className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create form
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <Card key={f.id} className="group hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-800 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/app/forms/${f.id}/edit`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          f.status === "published"
                            ? "bg-emerald-100 dark:bg-emerald-950"
                            : "bg-muted"
                        }`}>
                          <FileText className={`h-4 w-4 ${
                            f.status === "published"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`} />
                        </div>
                        <CardTitle className="text-base truncate">{f.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-1">
                        {f.description || `/${f.slug}`}
                      </CardDescription>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/app/forms/${f.id}/edit`)}>
                          <FileText className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/app/forms/${f.id}/submissions`)}>
                          <BarChart3 className="mr-2 h-4 w-4" /> Submissions
                        </DropdownMenuItem>
                        {f.publicToken && f.status === "published" && (
                          <DropdownMenuItem onClick={() => window.open(`/f/${f.publicToken}`, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View live
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => togglePublish(f)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {f.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/f/${f.publicToken}`);
                            toast.success("Link copied");
                          }}
                          disabled={!f.publicToken || f.status !== "published"}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-rose-600 dark:text-rose-400"
                          onClick={() => deleteForm(f)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {f.status === "published" ? (
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900">
                          Published
                        </Badge>
                      ) : f.status === "archived" ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">Archived</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900">
                          Draft
                        </Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelative(f.updatedAt)}
                      </span>
                    </div>
                    <span className="font-medium">{formatNumber(f.submissionCount)} subs</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
            <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
