import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";

/**
 * POST /api/forms/[id]/publish — toggle form status between draft/published.
 */
export async function POST(
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
      include: { share: true },
    });
    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const next = form.status === "published" ? "draft" : "published";
    const updated = await db.form.update({
      where: { id: form.id },
      data: { status: next },
      include: { share: true },
    });

    await db.auditLog.create({
      data: {
        workspaceId: ctx.workspace.id,
        actorId: ctx.user.id,
        action: `form.${next === "published" ? "publish" : "unpublish"}`,
        targetType: "form",
        targetId: form.id,
        meta: JSON.stringify({ name: form.name }),
      },
    });

    return NextResponse.json({ form: updated });
  } catch (e: any) {
    console.error("[forms/publish] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
