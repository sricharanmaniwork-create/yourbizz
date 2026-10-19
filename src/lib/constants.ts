/**
 * YourBizz shared utilities.
 */

export const APP_NAME = "YourBizz";
export const APP_TAGLINE =
  "Forms, Bookings & CRM — the modern way to run your business online.";

export const FREE_PLAN_LIMITS = {
  forms: 3,
  submissionsPerMonth: 200,
  storageBytes: 50 * 1024 * 1024, // 50 MB
  users: 1,
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

export const FORM_FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "currency",
  "decimal",
  "date",
  "time",
  "datetime",
  "dropdown",
  "radio",
  "checkbox",
  "multi_select",
  "rating",
  "scale",
  "slider",
  "file",
  "image",
  "signature",
  "calculator",
  "matrix",
  "section",
  "page_break",
  "rich_text",
  "divider",
  "captcha",
  "address",
  "country",
  "url",
] as const;

export type FieldType = (typeof FORM_FIELD_TYPES)[number];

export const FIELD_LABELS: Record<FieldType, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  currency: "Currency",
  decimal: "Decimal",
  date: "Date",
  time: "Time",
  datetime: "Date & Time",
  dropdown: "Dropdown",
  radio: "Radio",
  checkbox: "Checkbox",
  multi_select: "Multi-Select",
  rating: "Star Rating",
  scale: "Scale (1-10)",
  slider: "Slider",
  file: "File Upload",
  image: "Image",
  signature: "Signature",
  calculator: "Calculator",
  matrix: "Matrix",
  section: "Section Break",
  page_break: "Page Break",
  rich_text: "Rich Text",
  divider: "Divider",
  captcha: "Captcha",
  address: "Address",
  country: "Country",
  url: "URL",
};

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `form-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function generatePublicToken(): string {
  return (
    Math.random().toString(36).slice(2, 12) +
    Math.random().toString(36).slice(2, 12)
  );
}

export function generateApiKey(): { prefix: string; plain: string } {
  const prefix = "yb_live_";
  const body = Array.from({ length: 32 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 36)
    )
  ).join("");
  return { prefix: prefix + body.slice(0, 8), plain: prefix + body };
}

export async function hashApiKey(plain: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(plain).digest("hex");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(d);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
