/**
 * Form schema types — used by builder, renderer, and API.
 */

import type { FieldType } from "@/lib/constants";

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldCondition {
  fieldId: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt" | "exists";
  value: string | number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | string[];
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: FormFieldOption[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean; // file
  accept?: string; // file
  currency?: string; // currency
  ratingMax?: number; // rating
  scaleMin?: number;
  scaleMax?: number;
  matrixRows?: string[];
  matrixCols?: string[];
  formula?: string; // calculator
  showIf?: FormFieldCondition[]; // conditional logic (AND)
  width?: "full" | "half" | "third";
}

export interface FormPage {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  version: number;
  pages: FormPage[];
  // For single-page forms, pages.length === 1
  layout: "single" | "multi";
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: "rounded" | "square" | "pill";
  fontFamily?: string;
  backgroundType?: "color" | "image" | "gradient";
  backgroundValue?: string;
}

export interface FormSettings {
  captchaEnabled?: boolean;
  honeypotEnabled?: boolean;
  requireLogin?: boolean;
  oneResponsePerUser?: boolean;
  saveAndResume?: boolean;
  notificationsEnabled?: boolean;
  notificationEmails?: string[];
  autoResponderEnabled?: boolean;
  autoResponderSubject?: string;
  autoResponderBody?: string;
  scheduleEnabled?: boolean;
  scheduleOpenAt?: string;
  scheduleCloseAt?: string;
  responseLimit?: number;
  passwordProtected?: boolean;
  password?: string;
}

export const EMPTY_FORM_SCHEMA: FormSchema = {
  version: 1,
  layout: "single",
  pages: [
    {
      id: "page_" + Math.random().toString(36).slice(2, 8),
      fields: [],
    },
  ],
  submitButtonText: "Submit",
  successMessage: "Thank you! Your response has been recorded.",
};

export const DEFAULT_THEME: FormTheme = {
  primaryColor: "#7c3aed",
  backgroundColor: "#ffffff",
  textColor: "#18181b",
  buttonStyle: "rounded",
  fontFamily: "Inter",
  backgroundType: "color",
};

export const DEFAULT_SETTINGS: FormSettings = {
  captchaEnabled: false,
  honeypotEnabled: true,
  requireLogin: false,
  oneResponsePerUser: false,
  saveAndResume: true,
  notificationsEnabled: true,
  autoResponderEnabled: false,
};

export function newField(type: FieldType, label?: string): FormField {
  const id = "f_" + Math.random().toString(36).slice(2, 10);
  const base: FormField = {
    id,
    type,
    label: label || "",
    width: "full",
    required: false,
  };

  switch (type) {
    case "dropdown":
    case "radio":
    case "checkbox":
    case "multi_select":
      return { ...base, options: [
        { id: "o1", label: "Option 1", value: "Option 1" },
        { id: "o2", label: "Option 2", value: "Option 2" },
        { id: "o3", label: "Option 3", value: "Option 3" },
      ] };
    case "rating":
      return { ...base, ratingMax: 5 };
    case "scale":
      return { ...base, scaleMin: 1, scaleMax: 10 };
    case "slider":
      return { ...base, min: 0, max: 100, step: 1 };
    case "currency":
      return { ...base, currency: "USD" };
    case "number":
      return { ...base, min: 0, step: 1 };
    case "section":
      return { ...base, label: "Section Title" };
    case "rich_text":
      return { ...base, label: "", defaultValue: "Add your rich text content here." };
    case "address":
      return { ...base, label: "Address" };
    case "country":
      return { ...base, label: "Country" };
    case "matrix":
      return { ...base, label: "Matrix Question", matrixRows: ["Row 1", "Row 2"], matrixCols: ["Col 1", "Col 2"] };
    case "calculator":
      return { ...base, label: "Total", formula: "0" };
    default:
      return base;
  }
}

export function parseSchema(raw: string): FormSchema {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.pages || !Array.isArray(parsed.pages)) return EMPTY_FORM_SCHEMA;
    return parsed as FormSchema;
  } catch {
    return EMPTY_FORM_SCHEMA;
  }
}

export function parseTheme(raw: string): FormTheme {
  try {
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME;
  }
}

export function parseSettings(raw: string): FormSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
