import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";

/**
 * GET /api/forms/[id]/submissions
 * List submissions for a form (auth required, workspace member only).
 *
 * Query params: ?page=1&pageSize=20&search=&tag=&sort=desc
 */
export async function GET(
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

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20")));
    const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
    const search = url.searchParams.get("search") || "";

    const where = { formId: form.id };
    const [submissions, total] = await Promise.all([
      db.submission.findMany({
        where,
        orderBy: { submittedAt: sort },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tags: true },
      }),
      db.submission.count({ where }),
    ]);

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        data: s.data,
        submittedAt: s.submittedAt,
        ip: s.ip,
        isCompleted: s.isCompleted,
        completionTimeMs: s.completionTimeMs,
        tags: s.tags.map((t) => t.tag),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (e: any) {
    console.error("[submissions/list] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
