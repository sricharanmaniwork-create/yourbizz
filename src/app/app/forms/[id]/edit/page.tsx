"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable,
  useSensor, useSensors, closestCenter, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft, Plus, Save, Eye, Sparkles, Loader2, Trash2, Copy,
  GripVertical, Settings2, Type, Mail, Hash, Calendar, List, CheckSquare,
  Star, Upload, Image as ImageIcon, PenTool, Calculator, Grid3x3,
  Minus, Heading, FileText, ChevronDown, Phone, DollarSign, Clock,
  Globe, MapPin, Flag, Link2, Sliders, AlertCircle, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  FORM_FIELD_TYPES, FIELD_LABELS, type FieldType,
} from "@/lib/constants";
import {
  type FormSchema, type FormField, type FormTheme, type FormSettings,
  parseSchema, parseTheme, parseSettings, newField, EMPTY_FORM_SCHEMA,
} from "@/lib/form-schema";

const FIELD_ICONS: Record<FieldType, any> = {
  short_text: Type,
  long_text: FileText,
  email: Mail,
  phone: Phone,
  number: Hash,
  currency: DollarSign,
  decimal: Hash,
  date: Calendar,
  time: Clock,
  datetime: Calendar,
  dropdown: ChevronDown,
  radio: List,
  checkbox: CheckSquare,
  multi_select: List,
  rating: Star,
  scale: Sliders,
  slider: Sliders,
  file: Upload,
  image: ImageIcon,
  signature: PenTool,
  calculator: Calculator,
  matrix: Grid3x3,
  section: Heading,
  page_break: FileText,
  rich_text: FileText,
  divider: Minus,
  captcha: AlertCircle,
  address: MapPin,
  country: Flag,
  url: Link2,
};

const PALETTE_GROUPS: { name: string; types: FieldType[] }[] = [
  { name: "Basic", types: ["short_text", "long_text", "email", "phone", "url", "number", "decimal", "currency"] },
  { name: "Choice", types: ["dropdown", "radio", "checkbox", "multi_select"] },
  { name: "Rating", types: ["rating", "scale", "slider"] },
  { name: "Date & Time", types: ["date", "time", "datetime"] },
  { name: "Files", types: ["file", "image", "signature"] },
  { name: "Special", types: ["address", "country", "calculator", "matrix", "captcha"] },
  { name: "Layout", types: ["section", "page_break", "rich_text", "divider"] },
];

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [schema, setSchema] = useState<FormSchema>(EMPTY_FORM_SCHEMA);
  const [theme, setTheme] = useState<FormTheme>({ primaryColor: "#7c3aed" });
  const [settings, setSettings] = useState<FormSettings>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [publicToken, setPublicToken] = useState<string | undefined>();
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${params.id}`, { cache: "no-store" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        toast.error("Form not found");
        router.push("/app/dashboard");
        return;
      }
      const { form } = await res.json();
      setForm(form);
      setName(form.name);
      setDescription(form.description || "");
      setStatus(form.status);
      setPublicToken(form.share?.publicToken);
      setSchema(parseSchema(form.schema));
      setTheme({ ...parseTheme(form.theme) });
      setSettings({ ...parseSettings(form.settings) });
      // Select first field if any
      const firstField = parseSchema(form.schema).pages[0]?.fields[0];
      if (firstField) setSelectedFieldId(firstField.id);
    } catch (e) {
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  // Listen for palette-click events (from PaletteItem)
  useEffect(() => {
    function onPaletteClick(e: Event) {
      const type = (e as CustomEvent<FieldType>).detail;
      addField(type);
    }
    window.addEventListener("palette-click", onPaletteClick);
    return () => window.removeEventListener("palette-click", onPaletteClick);
  }, []);

  // auto-save (debounced)
  const saveTimer = useRef<any>(null);
  useEffect(() => {
    if (!dirty || !form) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(false), 1500);
    return () => clearTimeout(saveTimer.current);
  }, [schema, name, description, dirty]);

  async function save(showToast = true) {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          schema,
          theme,
          settings,
        }),
      });
      if (!res.ok) {
        toast.error("Save failed");
        return;
      }
      setDirty(false);
      if (showToast) toast.success("Saved");
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!form) return;
    const res = await fetch(`/api/forms/${form.id}/publish`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    const { form: updated } = await res.json();
    setStatus(updated.status);
    toast.success(updated.status === "published" ? "Published 🎉" : "Unpublished");
  }

  // ---- Field operations ----
  function addField(type: FieldType) {
    const f = newField(type);
    setSchema((s) => {
      const next = { ...s, pages: [...s.pages] };
      next.pages[0] = { ...next.pages[0], fields: [...next.pages[0].fields, f] };
      return next;
    });
    setSelectedFieldId(f.id);
    setDirty(true);
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setSchema((s) => {
      const next = { ...s, pages: s.pages.map((p) => ({
        ...p,
        fields: p.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      })) };
      return next;
    });
    setDirty(true);
  }

  function deleteField(id: string) {
    setSchema((s) => ({
      ...s,
      pages: s.pages.map((p) => ({ ...p, fields: p.fields.filter((f) => f.id !== id) })),
    }));
    if (selectedFieldId === id) setSelectedFieldId(null);
    setDirty(true);
  }

  function duplicateField(id: string) {
    setSchema((s) => {
      const next = { ...s, pages: [...s.pages] };
      const page = next.pages[0];
      const idx = page.fields.findIndex((f) => f.id === id);
      if (idx < 0) return s;
      const copy = { ...page.fields[idx], id: "f_" + Math.random().toString(36).slice(2, 10) };
      page.fields = [...page.fields.slice(0, idx + 1), copy, ...page.fields.slice(idx + 1)];
      return next;
    });
    setDirty(true);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // Palette drag → canvas (id starts with "palette:")
    const activeId = String(active.id);
    if (activeId.startsWith("palette:")) {
      const type = activeId.split(":")[1] as FieldType;
      addField(type);
      return;
    }

    // Reorder
    setSchema((s) => {
      const next = { ...s, pages: [...s.pages] };
      const page = next.pages[0];
      const oldIdx = page.fields.findIndex((f) => f.id === activeId);
      const newIdx = page.fields.findIndex((f) => f.id === String(over.id));
      if (oldIdx < 0 || newIdx < 0) return s;
      page.fields = arrayMove(page.fields, oldIdx, newIdx);
      return next;
    });
    setDirty(true);
  }

  const [draggingType, setDraggingType] = useState<FieldType | null>(null);

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    if (id.startsWith("palette:")) {
      setDraggingType(id.split(":")[1] as FieldType);
    } else {
      setDraggingType(null);
    }
  }

  const allFields = schema.pages.flatMap((p) => p.fields);
  const selectedField = allFields.find((f) => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-20 h-14 border-b border-border bg-card/95 backdrop-blur px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/app/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setDirty(true); }}
            className="h-8 max-w-xs border-transparent hover:border-border focus-visible:border-border"
          />
          <Badge
            variant="outline"
            className={
              status === "published"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
            }
          >
            {status === "published" ? "Live" : status === "archived" ? "Archived" : "Draft"}
          </Badge>
          {saving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {dirty && !saving && (
            <span className="text-xs text-muted-foreground">Unsaved</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {publicToken && status === "published" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/f/${publicToken}`, "_blank")}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View live
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => save(true)} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save
          </Button>
          <Button
            size="sm"
            onClick={togglePublish}
            className={
              status === "published"
                ? ""
                : "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
            }
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 grid grid-cols-[260px_1fr_320px] overflow-hidden">
          {/* Field palette */}
          <aside className="border-r border-border bg-card overflow-y-auto scrollbar-thin">
            <div className="p-4 sticky top-0 bg-card border-b border-border z-10">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Field
              </h2>
            </div>
            <div className="p-3 space-y-4">
              {PALETTE_GROUPS.map((group) => (
                <div key={group.name}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    {group.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.types.map((type) => {
                      const Icon = FIELD_ICONS[type];
                      return (
                        <PaletteItem key={type} type={type}>
                          <Icon className="h-3.5 w-3.5 mb-1" />
                          <span className="text-[10px] font-medium leading-tight">{FIELD_LABELS[type]}</span>
                        </PaletteItem>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Canvas */}
          <main className="overflow-y-auto scrollbar-thin bg-muted/20">
            <div className="max-w-2xl mx-auto p-6 sm:p-10">
              {/* Form header (canvas) */}
              <div className="mb-6">
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setDirty(true); }}
                  className="text-2xl font-bold border-transparent px-0 h-auto focus-visible:px-2"
                  placeholder="Untitled Form"
                />
                <Textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
                  placeholder="Add a description..."
                  className="mt-2 border-transparent px-0 focus-visible:px-2 resize-none text-muted-foreground"
                  rows={2}
                />
              </div>

              {/* Fields */}
              <DroppableCanvas>
                <SortableContext items={allFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {allFields.length === 0 && (
                      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
                        <div className="inline-flex h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-950 items-center justify-center mb-3">
                          <Plus className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="font-semibold mb-1">Add your first field</h3>
                        <p className="text-sm text-muted-foreground">
                          Drag a field from the left, or click one to add it to the form.
                        </p>
                      </div>
                    )}
                    {allFields.map((f) => (
                      <SortableField
                        key={f.id}
                        field={f}
                        selected={selectedFieldId === f.id}
                        onSelect={() => setSelectedFieldId(f.id)}
                        onDelete={() => deleteField(f.id)}
                        onDuplicate={() => duplicateField(f.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableCanvas>

              {/* Submit button preview */}
              <div className="mt-6">
                <Button
                  type="button"
                  style={{ background: theme.primaryColor || "#7c3aed" }}
                  className="text-white"
                  disabled
                >
                  {schema.submitButtonText || "Submit"}
                </Button>
              </div>
            </div>
          </main>

          {/* Properties panel */}
          <aside className="border-l border-border bg-card overflow-y-auto scrollbar-thin">
            <Tabs defaultValue="field" className="w-full">
              <div className="p-3 border-b border-border">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="field">Field</TabsTrigger>
                  <TabsTrigger value="theme">Theme</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="field" className="p-4 m-0">
                {selectedField ? (
                  <FieldProperties
                    field={selectedField}
                    onChange={(patch) => updateField(selectedField.id, patch)}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Select a field to edit its properties.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="theme" className="p-4 m-0 space-y-4">
                <ThemeProperties theme={theme} onChange={(t) => { setTheme(t); setDirty(true); }} />
              </TabsContent>
              <TabsContent value="settings" className="p-4 m-0 space-y-4">
                <SettingsProperties
                  settings={settings}
                  schema={schema}
                  onChange={(s) => { setSettings(s); setDirty(true); }}
                  onSchemaChange={(s) => { setSchema(s); setDirty(true); }}
                />
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </DndContext>

      <DragOverlay>
        {draggingType ? (
          <div className="rounded-md border border-violet-300 bg-card p-2 shadow-xl flex flex-col items-center min-w-[80px]">
            {(() => {
              const Icon = FIELD_ICONS[draggingType];
              return <Icon className="h-3.5 w-3.5 mb-1" />;
            })()}
            <span className="text-[10px] font-medium">{FIELD_LABELS[draggingType]}</span>
          </div>
        ) : null}
      </DragOverlay>
    </div>
  );
}

function PaletteItem({ type, children }: { type: FieldType; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        // Click adds to canvas — we dispatch via context
        const ev = new CustomEvent("palette-click", { detail: type });
        window.dispatchEvent(ev);
      }}
      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border border-border bg-card hover:border-violet-300 dark:hover:border-violet-800 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-all text-center min-h-[60px] cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      {children}
    </button>
  );
}

function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });
  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${isOver ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-background rounded-xl" : ""}`}
    >
      {children}
    </div>
  );
}

function SortableField({
  field, selected, onSelect, onDelete, onDuplicate,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative rounded-xl border bg-card p-4 cursor-pointer transition-all ${
        selected
          ? "border-violet-400 dark:border-violet-700 ring-1 ring-violet-300 dark:ring-violet-800"
          : "border-border hover:border-violet-300 dark:hover:border-violet-800"
      } ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Hover actions */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 rounded hover:bg-muted"
          aria-label="Duplicate"
        >
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
        </button>
      </div>

      <div className="pl-5">
        <FieldPreview field={field} />
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  const isLayout = ["section", "page_break", "rich_text", "divider"].includes(field.type);

  if (field.type === "section") {
    return (
      <div>
        <h3 className="text-base font-bold">{field.label || "Section Title"}</h3>
        <div className="h-px bg-border mt-1" />
      </div>
    );
  }
  if (field.type === "divider") {
    return <div className="h-px bg-border" />;
  }
  if (field.type === "rich_text") {
    return (
      <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
        {field.defaultValue || "Rich text content..."}
      </div>
    );
  }
  if (field.type === "page_break") {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-3 text-center text-xs font-medium text-muted-foreground">
        Page Break — respondents will see a "Next" button here
      </div>
    );
  }

  return (
    <div>
      <Label className="text-sm font-medium flex items-center gap-1">
        {field.label || <span className="text-muted-foreground italic">Untitled field</span>}
        {field.required && <span className="text-rose-500">*</span>}
      </Label>
      {field.helpText && (
        <p className="text-xs text-muted-foreground mt-0.5">{field.helpText}</p>
      )}
      <div className="mt-2">
        <FieldInputPreview field={field} />
      </div>
    </div>
  );
}

function FieldInputPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
    case "number":
    case "decimal":
    case "currency":
      return <Input placeholder={field.placeholder || "Type here..."} disabled className="bg-background" />;
    case "long_text":
      return <Textarea placeholder={field.placeholder || "Type here..."} disabled rows={3} className="bg-background" />;
    case "dropdown":
      return (
        <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>Select...</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      );
    case "radio":
      return (
        <div className="space-y-1.5">
          {(field.options || []).map((o) => (
            <div key={o.id} className="flex items-center gap-2 text-sm">
              <div className="h-3.5 w-3.5 rounded-full border border-input" />
              {o.label}
            </div>
          ))}
        </div>
      );
    case "checkbox":
    case "multi_select":
      return (
        <div className="space-y-1.5">
          {(field.options || []).map((o) => (
            <div key={o.id} className="flex items-center gap-2 text-sm">
              <div className="h-3.5 w-3.5 rounded border border-input" />
              {o.label}
            </div>
          ))}
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: field.ratingMax || 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-amber-400" />
          ))}
        </div>
      );
    case "scale":
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{field.scaleMin ?? 1}</span>
          <div className="flex gap-1">
            {Array.from({ length: (field.scaleMax ?? 10) - (field.scaleMin ?? 1) + 1 }).map((_, i) => (
              <div key={i} className="h-7 w-7 rounded border border-input bg-background text-xs flex items-center justify-center text-muted-foreground">
                {(field.scaleMin ?? 1) + i}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{field.scaleMax ?? 10}</span>
        </div>
      );
    case "slider":
      return (
        <div className="h-9 flex items-center">
          <div className="flex-1 h-1.5 rounded-full bg-muted relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 h-4 w-4 rounded-full bg-violet-600 border-2 border-card" />
          </div>
        </div>
      );
    case "date":
      return <Input type="date" disabled className="bg-background" />;
    case "time":
      return <Input type="time" disabled className="bg-background" />;
    case "datetime":
      return <Input type="datetime-local" disabled className="bg-background" />;
    case "file":
    case "image":
      return (
        <div className="rounded-lg border-2 border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
          <Upload className="h-5 w-5 mx-auto mb-1 opacity-50" />
          Click to upload or drag a file
        </div>
      );
    case "signature":
      return (
        <div className="rounded-lg border border-border bg-background h-16 flex items-center justify-center text-xs text-muted-foreground">
          <PenTool className="h-4 w-4 mr-1.5 opacity-50" /> Sign here
        </div>
      );
    case "address":
      return (
        <div className="space-y-1.5">
          <Input placeholder="Street address" disabled className="bg-background h-8" />
          <div className="grid grid-cols-2 gap-1.5">
            <Input placeholder="City" disabled className="bg-background h-8" />
            <Input placeholder="State / Province" disabled className="bg-background h-8" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Input placeholder="ZIP / Postal code" disabled className="bg-background h-8" />
            <Input placeholder="Country" disabled className="bg-background h-8" />
          </div>
        </div>
      );
    case "country":
      return (
        <div className="h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">
          Select country... <ChevronDown className="ml-auto h-3.5 w-3.5" />
        </div>
      );
    case "calculator":
      return (
        <div className="h-9 rounded-md border border-input bg-muted/30 px-3 flex items-center text-sm font-semibold">
          $0.00
        </div>
      );
    case "matrix":
      return (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-2 text-left"></th>
                {(field.matrixCols || []).map((c) => (
                  <th key={c} className="p-2 text-center font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(field.matrixRows || []).map((r) => (
                <tr key={r} className="border-b border-border last:border-0">
                  <td className="p-2 text-left">{r}</td>
                  {(field.matrixCols || []).map((c) => (
                    <td key={c} className="p-2 text-center">
                      <div className="h-3 w-3 rounded-full border border-input mx-auto" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "captcha":
      return (
        <div className="rounded-md border border-input bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Captcha will appear here
        </div>
      );
    default:
      return <Input placeholder="Type here..." disabled className="bg-background" />;
  }
}

function FieldProperties({ field, onChange }: { field: FormField; onChange: (p: Partial<FormField>) => void }) {
  const hasOptions = ["dropdown", "radio", "checkbox", "multi_select"].includes(field.type);
  const hasNumericRange = ["number", "decimal", "slider", "scale"].includes(field.type);
  const isLayout = ["section", "page_break", "rich_text", "divider"].includes(field.type);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Field type</Label>
        <div className="mt-1 text-sm font-medium">{FIELD_LABELS[field.type]}</div>
      </div>

      {!isLayout && (
        <>
          <div>
            <Label htmlFor="label" className="text-xs">Label</Label>
            <Input
              id="label"
              value={field.label || ""}
              onChange={(e) => onChange({ label: e.target.value })}
              className="mt-1 h-9"
            />
          </div>

          {!["rating", "scale", "slider", "matrix", "captcha", "address", "country", "signature"].includes(field.type) && (
            <div>
              <Label htmlFor="placeholder" className="text-xs">Placeholder</Label>
              <Input
                id="placeholder"
                value={field.placeholder || ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                className="mt-1 h-9"
              />
            </div>
          )}

          <div>
            <Label htmlFor="helpText" className="text-xs">Help text</Label>
            <Input
              id="helpText"
              value={field.helpText || ""}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Optional guidance for the respondent"
              className="mt-1 h-9"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="required" className="text-xs">Required</Label>
            <Switch
              id="required"
              checked={!!field.required}
              onCheckedChange={(v) => onChange({ required: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hidden" className="text-xs">Hidden by default</Label>
            <Switch
              id="hidden"
              checked={!!field.hidden}
              onCheckedChange={(v) => onChange({ hidden: v })}
            />
          </div>

          {hasOptions && (
            <div>
              <Label className="text-xs">Options</Label>
              <div className="mt-1 space-y-1.5">
                {(field.options || []).map((o, i) => (
                  <div key={o.id} className="flex items-center gap-1">
                    <Input
                      value={o.label}
                      onChange={(e) => {
                        const opts = [...(field.options || [])];
                        opts[i] = { ...o, label: e.target.value, value: e.target.value };
                        onChange({ options: opts });
                      }}
                      className="h-8 text-sm"
                    />
                    <button
                      onClick={() => onChange({ options: (field.options || []).filter((x) => x.id !== o.id) })}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-8 mt-1"
                  onClick={() => onChange({
                    options: [
                      ...(field.options || []),
                      { id: "o" + Math.random().toString(36).slice(2, 6), label: `Option ${(field.options?.length || 0) + 1}`, value: `Option ${(field.options?.length || 0) + 1}` },
                    ],
                  })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add option
                </Button>
              </div>
            </div>
          )}

          {hasNumericRange && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={field.min ?? ""}
                  onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={field.max ?? ""}
                  onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 h-9"
                />
              </div>
            </div>
          )}

          {field.type === "rating" && (
            <div>
              <Label className="text-xs">Max stars</Label>
              <Input
                type="number"
                min={3}
                max={10}
                value={field.ratingMax ?? 5}
                onChange={(e) => onChange({ ratingMax: Number(e.target.value) || 5 })}
                className="mt-1 h-9"
              />
            </div>
          )}

          {field.type === "currency" && (
            <div>
              <Label className="text-xs">Currency</Label>
              <Input
                value={field.currency || "USD"}
                onChange={(e) => onChange({ currency: e.target.value })}
                className="mt-1 h-9"
              />
            </div>
          )}

          {field.type === "file" && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow multiple files</Label>
                <Switch
                  checked={!!field.multiple}
                  onCheckedChange={(v) => onChange({ multiple: v })}
                />
              </div>
              <div>
                <Label className="text-xs">Accepted file types</Label>
                <Input
                  value={field.accept || ""}
                  onChange={(e) => onChange({ accept: e.target.value })}
                  placeholder="image/*,application/pdf"
                  className="mt-1 h-9"
                />
              </div>
            </>
          )}
        </>
      )}

      {field.type === "rich_text" && (
        <div>
          <Label htmlFor="rt" className="text-xs">Content</Label>
          <Textarea
            id="rt"
            value={field.defaultValue || ""}
            onChange={(e) => onChange({ defaultValue: e.target.value })}
            rows={6}
            className="mt-1 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function ThemeProperties({ theme, onChange }: { theme: FormTheme; onChange: (t: FormTheme) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Primary color</Label>
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={theme.primaryColor || "#7c3aed"}
            onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
            className="h-9 w-12 rounded border border-input cursor-pointer"
          />
          <Input
            value={theme.primaryColor || "#7c3aed"}
            onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1.5">
          {["#7c3aed", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#3b82f6", "#84cc16", "#a855f7"].map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...theme, primaryColor: c })}
              className="h-7 rounded-md border border-border"
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Background type</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {(["color", "gradient", "image"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={theme.backgroundType === t ? "default" : "outline"}
              className="h-8 capitalize text-xs"
              onClick={() => onChange({ ...theme, backgroundType: t })}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {(theme.backgroundType === "color" || !theme.backgroundType) && (
        <div>
          <Label className="text-xs">Background color</Label>
          <div className="mt-1 flex gap-2">
            <input
              type="color"
              value={theme.backgroundColor || "#ffffff"}
              onChange={(e) => onChange({ ...theme, backgroundColor: e.target.value })}
              className="h-9 w-12 rounded border border-input cursor-pointer"
            />
            <Input
              value={theme.backgroundColor || "#ffffff"}
              onChange={(e) => onChange({ ...theme, backgroundColor: e.target.value })}
              className="h-9"
            />
          </div>
        </div>
      )}

      <div>
        <Label className="text-xs">Text color</Label>
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={theme.textColor || "#18181b"}
            onChange={(e) => onChange({ ...theme, textColor: e.target.value })}
            className="h-9 w-12 rounded border border-input cursor-pointer"
          />
          <Input
            value={theme.textColor || "#18181b"}
            onChange={(e) => onChange({ ...theme, textColor: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Button style</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {(["rounded", "square", "pill"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={theme.buttonStyle === s ? "default" : "outline"}
              className="h-8 capitalize text-xs"
              onClick={() => onChange({ ...theme, buttonStyle: s })}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsProperties({
  settings, schema, onChange, onSchemaChange,
}: {
  settings: FormSettings;
  schema: FormSchema;
  onChange: (s: FormSettings) => void;
  onSchemaChange: (s: FormSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Submit button text</Label>
        <Input
          value={schema.submitButtonText || ""}
          onChange={(e) => onSchemaChange({ ...schema, submitButtonText: e.target.value })}
          className="mt-1 h-9"
          placeholder="Submit"
        />
      </div>

      <div>
        <Label className="text-xs">Success message</Label>
        <Textarea
          value={schema.successMessage || ""}
          onChange={(e) => onSchemaChange({ ...schema, successMessage: e.target.value })}
          className="mt-1 text-sm"
          rows={3}
          placeholder="Thank you! Your response has been recorded."
        />
      </div>

      <div>
        <Label className="text-xs">Redirect URL (optional)</Label>
        <Input
          value={schema.redirectUrl || ""}
          onChange={(e) => onSchemaChange({ ...schema, redirectUrl: e.target.value })}
          className="mt-1 h-9"
          placeholder="https://yoursite.com/thanks"
        />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <Label className="text-xs">Captcha protection</Label>
        <Switch
          checked={!!settings.captchaEnabled}
          onCheckedChange={(v) => onChange({ ...settings, captchaEnabled: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Honeypot (spam trap)</Label>
        <Switch
          checked={!!settings.honeypotEnabled}
          onCheckedChange={(v) => onChange({ ...settings, honeypotEnabled: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">One response per user</Label>
        <Switch
          checked={!!settings.oneResponsePerUser}
          onCheckedChange={(v) => onChange({ ...settings, oneResponsePerUser: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Save & resume later</Label>
        <Switch
          checked={!!settings.saveAndResume}
          onCheckedChange={(v) => onChange({ ...settings, saveAndResume: v })}
        />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <Label className="text-xs">Email notifications</Label>
        <Switch
          checked={!!settings.notificationsEnabled}
          onCheckedChange={(v) => onChange({ ...settings, notificationsEnabled: v })}
        />
      </div>

      {settings.notificationsEnabled && (
        <div>
          <Label className="text-xs">Notify these emails (comma-separated)</Label>
          <Input
            value={(settings.notificationEmails || []).join(", ")}
            onChange={(e) => onChange({
              ...settings,
              notificationEmails: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })}
            className="mt-1 h-9"
            placeholder="you@company.com, sales@company.com"
          />
        </div>
      )}

      <div className="h-px bg-border" />

      <div>
        <Label className="text-xs">Response limit</Label>
        <Input
          type="number"
          value={settings.responseLimit ?? ""}
          onChange={(e) => onChange({ ...settings, responseLimit: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1 h-9"
          placeholder="No limit"
        />
      </div>
    </div>
  );
}
