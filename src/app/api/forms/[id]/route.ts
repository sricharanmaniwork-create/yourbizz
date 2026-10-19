import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";
import { z } from "zod";

const updateFormSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  schema: z.any().optional(),
  theme: z.any().optional(),
  settings: z.any().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// GET /api/forms/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const form = await db.form.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
      include: { share: true, _count: { select: { submissions: true } } },
    });
    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (e: any) {
    console.error("[forms/get] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH /api/forms/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const form = await db.form.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.schema !== undefined) data.schema = JSON.stringify(parsed.data.schema);
    if (parsed.data.theme !== undefined) data.theme = JSON.stringify(parsed.data.theme);
    if (parsed.data.settings !== undefined) data.settings = JSON.stringify(parsed.data.settings);
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    const updated = await db.form.update({
      where: { id: form.id },
      data,
      include: { share: true },
    });

    // Bump version when schema changes
    if (parsed.data.schema !== undefined) {
      const lastVersion = await db.formVersion.findFirst({
        where: { formId: form.id },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      await db.formVersion.create({
        data: {
          formId: form.id,
          version: (lastVersion?.version ?? 0) + 1,
          schema: data.schema,
          createdById: ctx.user.id,
        },
      });
    }

    await db.auditLog.create({
      data: {
        workspaceId: ctx.workspace.id,
        actorId: ctx.user.id,
        action: "form.update",
        targetType: "form",
        targetId: form.id,
        meta: JSON.stringify({ fields: Object.keys(data) }),
      },
    });

    return NextResponse.json({ form: updated });
  } catch (e: any) {
    console.error("[forms/update] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/forms/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const form = await db.form.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.form.delete({ where: { id: form.id } });

    await db.auditLog.create({
      data: {
        workspaceId: ctx.workspace.id,
        actorId: ctx.user.id,
        action: "form.delete",
        targetType: "form",
        targetId: form.id,
        meta: JSON.stringify({ name: form.name }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[forms/delete] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
