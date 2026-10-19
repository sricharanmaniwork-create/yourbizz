"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Star, ChevronDown, Upload, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  type FormSchema, type FormField, type FormTheme, type FormSettings,
  parseSchema, parseTheme, parseSettings,
} from "@/lib/form-schema";

type FormResponse = {
  form: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    schema: string;
    theme: string;
    settings: string;
  };
};

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const token = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormResponse["form"] | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [theme, setTheme] = useState<FormTheme>({});
  const [settings, setSettings] = useState<FormSettings>({});
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/public/forms/${token}`, { cache: "no-store" });
        if (!res.ok) {
          const e = await res.json();
          setError(e?.error || "Form not found");
          return;
        }
        const data: FormResponse = await res.json();
        setForm(data.form);
        setSchema(parseSchema(data.form.schema));
        setTheme(parseTheme(data.form.theme));
        setSettings(parseSettings(data.form.settings));
      } catch (e) {
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  function updateValue(id: string, value: any) {
    setValues((v) => ({ ...v, [id]: value }));
  }

  function isFieldVisible(field: FormField): boolean {
    if (!field.showIf || field.showIf.length === 0) return true;
    // All conditions must match (AND logic)
    return field.showIf.every((cond) => {
      const v = values[cond.fieldId];
      switch (cond.operator) {
        case "eq": return String(v) === String(cond.value);
        case "neq": return String(v) !== String(cond.value);
        case "contains": return Array.isArray(v) ? v.includes(cond.value) : String(v || "").includes(String(cond.value));
        case "gt": return Number(v) > Number(cond.value);
        case "lt": return Number(v) < Number(cond.value);
        case "exists": return v !== undefined && v !== null && v !== "";
        default: return true;
      }
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !schema) return;

    // Validate required + visible
    const currentPage = schema.pages[page];
    for (const f of currentPage.fields) {
      if (!isFieldVisible(f)) continue;
      if (f.required && !["section", "divider", "page_break", "rich_text"].includes(f.type)) {
        const v = values[f.id];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
          toast.error(`${f.label || "This field"} is required.`);
          return;
        }
      }
    }

    // Multi-page: go to next page if not last
    if (schema.layout === "multi" && page < schema.pages.length - 1) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      // honeypot
      const payload: Record<string, any> = { ...values };
      if (settings.honeypotEnabled) {
        payload["_hp_"] = payload["_hp_"] || "";
      }

      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicToken: token,
          data: payload,
          fingerprint: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Submission failed");
        return;
      }

      setSubmitted(true);
      setSuccessMsg(data.successMessage || schema.successMessage || "Thank you!");
      setRedirectUrl(data.redirectUrl || schema.redirectUrl || null);

      if (data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1500);
      }
    } catch (e: any) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.backgroundColor || "#f4f4f5" }}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950 items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">Form unavailable</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: theme.backgroundColor || "#f4f4f5" }}>
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-xl">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Submitted!</h1>
          <p className="text-sm text-muted-foreground mb-2">{successMsg}</p>
          {redirectUrl && (
            <p className="text-xs text-muted-foreground">Redirecting...</p>
          )}
        </div>
      </div>
    );
  }

  if (!form || !schema) return null;

  const currentPageData = schema.pages[page];
  const totalPages = schema.pages.length;
  const progress = totalPages > 1 ? ((page + 1) / totalPages) * 100 : 100;

  return (
    <div
      className="min-h-screen py-8 sm:py-12 px-4"
      style={{
        background:
          theme.backgroundType === "gradient"
            ? `linear-gradient(135deg, ${theme.primaryColor || "#7c3aed"}22, ${theme.backgroundColor || "#fff"})`
            : theme.backgroundType === "image"
            ? `url(${theme.backgroundValue || ""}) center/cover no-repeat fixed, ${theme.backgroundColor || "#fff"}`
            : theme.backgroundColor || "#f4f4f5",
        color: theme.textColor || "#18181b",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-black/5 dark:border-white/5 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-border">
            {totalPages > 1 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Page {page + 1} of {totalPages}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progress}%`, background: theme.primaryColor || "#7c3aed" }}
                  />
                </div>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: theme.textColor }}>
              {form.name}
            </h1>
            {form.description && (
              <p className="mt-2 text-muted-foreground leading-relaxed">{form.description}</p>
            )}
          </div>

          {/* Body */}
          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Honeypot (hidden) */}
            {settings.honeypotEnabled && (
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values._hp_ || ""}
                onChange={(e) => updateValue("_hp_", e.target.value)}
                className="absolute left-[-9999px] opacity-0 pointer-events-none"
                aria-hidden
              />
            )}

            {currentPageData.fields.map((field) => {
              if (!isFieldVisible(field)) return null;
              return (
                <PublicField
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(v) => updateValue(field.id, v)}
                  theme={theme}
                />
              );
            })}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full h-12 text-white shadow-lg disabled:opacity-50"
                style={{
                  background: theme.primaryColor || "#7c3aed",
                  borderRadius:
                    theme.buttonStyle === "square" ? "0.375rem" :
                    theme.buttonStyle === "pill" ? "9999px" : "0.5rem",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : schema.layout === "multi" && page < totalPages - 1 ? (
                  "Next page →"
                ) : (
                  schema.submitButtonText || "Submit"
                )}
              </Button>
            </div>

            {totalPages > 1 && page > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Previous page
              </Button>
            )}
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-white/60 dark:text-white/40">
          Powered by{" "}
          <a href="/" className="font-semibold hover:underline" style={{ color: theme.primaryColor }}>
            YourBizz
          </a>
        </div>
      </div>
    </div>
  );
}

function PublicField({
  field, value, onChange, theme,
}: {
  field: FormField;
  value: any;
  onChange: (v: any) => void;
  theme: FormTheme;
}) {
  // Layout types
  if (field.type === "section") {
    return (
      <div className="pt-2">
        <h2 className="text-lg font-bold" style={{ color: theme.textColor }}>{field.label}</h2>
        <div className="h-px bg-border mt-1.5" />
      </div>
    );
  }
  if (field.type === "divider") {
    return <div className="h-px bg-border" />;
  }
  if (field.type === "rich_text") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
        {field.defaultValue}
      </div>
    );
  }
  if (field.type === "page_break") return null;

  const isLayout = ["section", "divider", "rich_text", "page_break"].includes(field.type);
  if (isLayout) return null;

  return (
    <div>
      <Label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: theme.textColor }}>
        {field.label}
        {field.required && <span className="text-rose-500">*</span>}
      </Label>
      {field.helpText && (
        <p className="text-xs text-muted-foreground mb-2">{field.helpText}</p>
      )}

      <FieldInput field={field} value={value} onChange={onChange} theme={theme} />
    </div>
  );
}

function FieldInput({
  field, value, onChange, theme,
}: {
  field: FormField;
  value: any;
  onChange: (v: any) => void;
  theme: FormTheme;
}) {
  switch (field.type) {
    case "short_text":
    case "url":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          maxLength={field.maxLength}
        />
      );
    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "you@example.com"}
          required={field.required}
        />
      );
    case "phone":
      return (
        <Input
          type="tel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "+1 (555) 000-0000"}
          required={field.required}
        />
      );
    case "number":
    case "decimal":
    case "currency":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={field.placeholder || "0"}
          min={field.min}
          max={field.max}
          step={field.step || (field.type === "decimal" ? "0.01" : "1")}
          required={field.required}
        />
      );
    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          maxLength={field.maxLength}
        />
      );
    case "date":
      return <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "time":
      return <Input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "datetime":
      return <Input type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "dropdown":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select...</option>
          {(field.options || []).map((o) => (
            <option key={o.id} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="space-y-2">
          {(field.options || []).map((o) => (
            <label key={o.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name={field.id}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                required={field.required}
                className="h-4 w-4"
                style={{ accentColor: theme.primaryColor }}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
    case "multi_select":
      return (
        <div className="space-y-2">
          {(field.options || []).map((o) => {
            const checked = Array.isArray(value) ? value.includes(o.value) : false;
            return (
              <label key={o.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) arr.push(o.value);
                    else arr.splice(arr.indexOf(o.value), 1);
                    onChange(arr);
                  }}
                  className="h-4 w-4"
                  style={{ accentColor: theme.primaryColor }}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: field.ratingMax || 5 }).map((_, i) => {
            const v = i + 1;
            const active = (value || 0) >= v;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(v)}
                className="p-1"
                aria-label={`${v} stars`}
              >
                <Star
                  className={`h-7 w-7 transition-all ${active ? "fill-amber-400 text-amber-400 scale-110" : "text-muted-foreground/30 hover:text-amber-300"}`}
                />
              </button>
            );
          })}
        </div>
      );
    case "scale":
      return (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: (field.scaleMax ?? 10) - (field.scaleMin ?? 1) + 1 }).map((_, i) => {
            const v = (field.scaleMin ?? 1) + i;
            const active = value === v;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(v)}
                className={`h-9 w-9 rounded-md border text-sm font-medium transition-all ${
                  active
                    ? "text-white shadow-md"
                    : "border-input bg-background hover:bg-muted"
                }`}
                style={active ? { background: theme.primaryColor, borderColor: theme.primaryColor } : {}}
              >
                {v}
              </button>
            );
          })}
        </div>
      );
    case "slider":
      return (
        <div className="pt-2">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={value ?? field.min ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: theme.primaryColor }}
          />
          <div className="text-sm text-muted-foreground text-center mt-1">{value ?? field.min ?? 0}</div>
        </div>
      );
    case "file":
    case "image":
      return (
        <div className="rounded-lg border-2 border-dashed border-border bg-background p-6 text-center cursor-pointer hover:border-violet-400 transition-colors">
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <div className="text-sm font-medium">Click to upload</div>
          <div className="text-xs text-muted-foreground mt-1">
            {field.multiple ? "Multiple files allowed" : "One file only"}
            {field.accept && ` · ${field.accept}`}
          </div>
          <input
            type="file"
            multiple={field.multiple}
            accept={field.accept}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onChange(Array.from(e.target.files || []).map((f) => f.name))}
          />
        </div>
      );
    case "signature":
      return (
        <div className="rounded-lg border border-input bg-background h-24 flex items-center justify-center text-sm text-muted-foreground">
          <PenTool className="h-4 w-4 mr-1.5 opacity-50" /> Sign here (signature pad)
        </div>
      );
    case "address":
      return (
        <div className="space-y-2">
          <Input placeholder="Street address" onChange={(e) => onChange({ ...value, street: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" onChange={(e) => onChange({ ...value, city: e.target.value })} />
            <Input placeholder="State / Province" onChange={(e) => onChange({ ...value, state: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="ZIP / Postal code" onChange={(e) => onChange({ ...value, zip: e.target.value })} />
            <Input placeholder="Country" onChange={(e) => onChange({ ...value, country: e.target.value })} />
          </div>
        </div>
      );
    case "country":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select country...</option>
          {["United States", "Canada", "United Kingdom", "Australia", "India", "Germany", "France", "Japan", "Brazil", "Other"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    case "matrix":
      return (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-2 text-left"></th>
                {(field.matrixCols || []).map((c) => (
                  <th key={c} className="p-2 text-center font-medium text-xs">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(field.matrixRows || []).map((r) => (
                <tr key={r} className="border-b border-border last:border-0">
                  <td className="p-2 text-left text-xs">{r}</td>
                  {(field.matrixCols || []).map((c) => (
                    <td key={c} className="p-2 text-center">
                      <input
                        type="radio"
                        name={`${field.id}-${r}`}
                        checked={value?.[r] === c}
                        onChange={() => onChange({ ...value, [r]: c })}
                        className="h-3.5 w-3.5"
                        style={{ accentColor: theme.primaryColor }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "calculator":
      return (
        <div className="h-10 rounded-md border border-input bg-muted/30 px-3 flex items-center font-semibold">
          ${value || "0.00"}
        </div>
      );
    case "captcha":
      return (
        <div className="rounded-md border border-input bg-muted/30 p-3 text-xs flex items-center gap-2">
          <input type="checkbox" required className="h-4 w-4" style={{ accentColor: theme.primaryColor }} />
          I'm not a robot
        </div>
      );
    default:
      return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />;
  }
}
