import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/public/forms/[token]
 * Fetch a published form by its public token (no auth).
 * Returns the form schema, theme, settings (sanitized).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await db.formShare.findUnique({
      where: { publicToken: token },
      include: { form: true },
    });
    if (!share || !share.form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (share.form.status !== "published") {
      return NextResponse.json({ error: "Form not published" }, { status: 403 });
    }
    if (share.isClosed) {
      return NextResponse.json({ error: "Form closed" }, { status: 410 });
    }
    if (share.expiresAt && share.expiresAt < new Date()) {
      return NextResponse.json({ error: "Form expired" }, { status: 410 });
    }

    // Log a view event (best effort)
    await db.analyticsEvent
      .create({ data: { formId: share.form.id, eventType: "view" } })
      .catch(() => null);

    const settings = (() => {
      try { return JSON.parse(share.form.settings); } catch { return {}; }
    })();

    return NextResponse.json({
      form: {
        id: share.form.id,
        name: share.form.name,
        slug: share.form.slug,
        description: share.form.description,
        schema: share.form.schema,
        theme: share.form.theme,
        settings: share.form.settings,
      },
      passwordProtected: !!settings?.passwordProtected,
    });
  } catch (e: any) {
    console.error("[public/form] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
