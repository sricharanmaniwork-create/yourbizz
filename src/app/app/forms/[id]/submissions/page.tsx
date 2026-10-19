"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Search, Download, ChevronLeft, ChevronRight,
  Inbox, FileText, Tag, Clock, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatDateTime, formatNumber } from "@/lib/constants";
import { AppShell } from "@/components/app/app-shell";
import { parseSchema, type FormSchema } from "@/lib/form-schema";

type Submission = {
  id: string;
  data: string;
  submittedAt: string;
  ip: string | null;
  isCompleted: boolean;
  completionTimeMs: number | null;
  tags: string[];
};

export default function SubmissionsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Load form first
      const formRes = await fetch(`/api/forms/${params.id}`, { cache: "no-store" });
      if (formRes.status === 401) {
        router.push("/login");
        return;
      }
      if (formRes.ok) {
        const { form: f } = await formRes.json();
        setForm(f);
        setSchema(parseSchema(f.schema));
      }

      // Load submissions
      const url = new URL(`/api/forms/${params.id}/submissions`, window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", "20");
      if (search) url.searchParams.set("search", search);

      const subRes = await fetch(url.toString(), { cache: "no-store" });
      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(data.submissions || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [params.id, page, search, router]);

  useEffect(() => {
    load();
  }, [load]);

  function exportCSV() {
    if (!schema || submissions.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const allFields = schema.pages.flatMap((p) => p.fields).filter((f) => !["section", "divider", "page_break", "rich_text"].includes(f.type));
    const headers = ["Submitted At", "IP", ...allFields.map((f) => f.label || f.id)];
    const rows = submissions.map((s) => {
      const data = JSON.parse(s.data);
      return [
        s.submittedAt,
        s.ip || "",
        ...allFields.map((f) => {
          const v = data[f.id];
          if (v === undefined || v === null) return "";
          if (typeof v === "object") return JSON.stringify(v);
          return String(v);
        }),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.slug || "form"}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }

  const allFields = schema?.pages.flatMap((p) => p.fields).filter((f) => !["section", "divider", "page_break", "rich_text"].includes(f.type)) || [];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {form?.name || "Form"} · Submissions
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatNumber(total)} total · Page {page} of {totalPages}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!submissions.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total submissions" value={formatNumber(total)} icon={Inbox} color="from-violet-500 to-fuchsia-500" />
          <StatCard label="On this page" value={formatNumber(submissions.length)} icon={FileText} color="from-emerald-500 to-teal-500" />
          <StatCard label="Completion rate" value="100%" icon={Tag} color="from-amber-500 to-orange-500" />
          <StatCard label="Avg time" value="—" icon={Clock} color="from-cyan-500 to-blue-500" />
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : submissions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="inline-flex h-12 w-12 rounded-xl bg-muted items-center justify-center mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No submissions yet</h3>
              <p className="text-sm text-muted-foreground">
                {form?.status === "published"
                  ? "Share your form link to start collecting responses."
                  : "Publish your form to start collecting responses."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Submitted</TableHead>
                      {allFields.slice(0, 4).map((f) => (
                        <TableHead key={f.id}>{f.label || f.id}</TableHead>
                      ))}
                      {allFields.length > 4 && (
                        <TableHead>+{allFields.length - 4} more</TableHead>
                      )}
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => {
                      const data = JSON.parse(s.data);
                      return (
                        <TableRow
                          key={s.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelected(s)}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(s.submittedAt)}
                          </TableCell>
                          {allFields.slice(0, 4).map((f) => {
                            const v = data[f.id];
                            let display = "—";
                            if (v !== undefined && v !== null && v !== "") {
                              display = typeof v === "object" ? JSON.stringify(v) : String(v);
                              if (display.length > 60) display = display.slice(0, 57) + "...";
                            }
                            return <TableCell key={f.id} className="text-sm">{display}</TableCell>;
                          })}
                          {allFields.length > 4 && (
                            <TableCell className="text-xs text-muted-foreground">...</TableCell>
                          )}
                          <TableCell>
                            {s.tags?.length > 0 && (
                              <Badge variant="outline" className="text-[10px]">{s.tags[0]}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {formatNumber(total)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-sm px-2">{page} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submission details</SheetTitle>
            <SheetDescription>
              {selected && formatDateTime(selected.submittedAt)}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-4 pb-8 space-y-3">
              {selected.ip && (
                <div className="text-xs text-muted-foreground">IP: {selected.ip}</div>
              )}
              <div className="h-px bg-border" />
              {allFields.map((f) => {
                const data = JSON.parse(selected.data);
                const v = data[f.id];
                return (
                  <div key={f.id} className="py-2 border-b border-border last:border-0">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {f.label || f.id}
                    </div>
                    <div className="text-sm">
                      {v === undefined || v === null || v === ""
                        ? <span className="text-muted-foreground italic">No response</span>
                        : typeof v === "object"
                        ? JSON.stringify(v, null, 2)
                        : String(v)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
          <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
            <Icon className="h-4 w-4 text-white" strokeWidth={2.2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
