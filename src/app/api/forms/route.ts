import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";
import { slugify, generatePublicToken } from "@/lib/constants";
import { EMPTY_FORM_SCHEMA, DEFAULT_THEME, DEFAULT_SETTINGS } from "@/lib/form-schema";
import { z } from "zod";

const createFormSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().max(2000).optional(),
  schema: z.any().optional(),
});

// GET /api/forms — list current workspace's forms
export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forms = await db.form.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
        share: true,
      },
    });

    return NextResponse.json({
      forms: forms.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        description: f.description,
        status: f.status,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        submissionCount: f._count.submissions,
        publicToken: f.share?.publicToken,
        isClosed: f.share?.isClosed ?? false,
      })),
    });
  } catch (e: any) {
    console.error("[forms/list] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/forms — create a new form
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;
    const slug = slugify(parsed.data.slug || name);

    // ensure slug uniqueness within workspace
    const existing = await db.form.findUnique({
      where: { workspaceId_slug: { workspaceId: ctx.workspace.id, slug } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A form with that slug already exists in this workspace." },
        { status: 409 }
      );
    }

    const form = await db.form.create({
      data: {
        workspaceId: ctx.workspace.id,
        createdById: ctx.user.id,
        name,
        slug,
        description,
        schema: JSON.stringify(EMPTY_FORM_SCHEMA),
        theme: JSON.stringify(DEFAULT_THEME),
        settings: JSON.stringify(DEFAULT_SETTINGS),
        status: "draft",
        share: { create: { publicToken: generatePublicToken() } },
      },
      include: { share: true },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        workspaceId: ctx.workspace.id,
        actorId: ctx.user.id,
        action: "form.create",
        targetType: "form",
        targetId: form.id,
        meta: JSON.stringify({ name }),
      },
    });

    return NextResponse.json({ form });
  } catch (e: any) {
    console.error("[forms/create] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
