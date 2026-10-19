import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSchema, parseSettings } from "@/lib/form-schema";
import { sendEmail, submissionAlertHtml } from "@/lib/email";

/**
 * POST /api/public/submit
 * Public form submission endpoint. Auth bypassed via publicToken.
 *
 * Body: { publicToken: string, data: Record<string, any>, fingerprint?: string }
 *
 * In production with Supabase, replace this with a SECURITY DEFINER RPC
 * `submit_form(p_public_token, p_data)` (see /supabase/migrations/0001_initial.sql).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicToken, data, fingerprint } = body as {
      publicToken?: string;
      data?: Record<string, any>;
      fingerprint?: string;
    };

    if (!publicToken || !data) {
      return NextResponse.json(
        { error: "Missing publicToken or data" },
        { status: 400 }
      );
    }

    const share = await db.formShare.findUnique({
      where: { publicToken },
      include: { form: true },
    });
    if (!share || !share.form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (share.isClosed) {
      return NextResponse.json({ error: "This form is no longer accepting responses." }, { status: 410 });
    }
    if (share.expiresAt && share.expiresAt < new Date()) {
      return NextResponse.json({ error: "This form has expired." }, { status: 410 });
    }
    if (share.form.status !== "published") {
      return NextResponse.json({ error: "This form is not published." }, { status: 403 });
    }

    const settings = parseSettings(share.form.settings);
    const schema = parseSchema(share.form.schema);

    // Honeypot check
    if (settings.honeypotEnabled) {
      const honeypot = data["_hp_"];
      if (honeypot) {
        // Pretend success to bots
        return NextResponse.json({ ok: true, id: "spam" });
      }
      delete data["_hp_"];
    }

    // Password protection
    if (settings.passwordProtected && settings.password) {
      const supplied = body.password;
      if (supplied !== settings.password) {
        return NextResponse.json({ error: "Incorrect form password." }, { status: 403 });
      }
    }

    // Response limit
    if (settings.responseLimit && settings.responseLimit > 0) {
      const count = await db.submission.count({
        where: { formId: share.form.id },
      });
      if (count >= settings.responseLimit) {
        return NextResponse.json({ error: "Response limit reached." }, { status: 410 });
      }
    }

    // Schedule window
    if (settings.scheduleEnabled) {
      const now = new Date();
      if (settings.scheduleOpenAt && new Date(settings.scheduleOpenAt) > now) {
        return NextResponse.json({ error: "Form not yet open." }, { status: 410 });
      }
      if (settings.scheduleCloseAt && new Date(settings.scheduleCloseAt) < now) {
        return NextResponse.json({ error: "Form closed." }, { status: 410 });
      }
    }

    // Required field validation
    const allFields = schema.pages.flatMap((p) => p.fields);
    for (const field of allFields) {
      if (field.required && field.type !== "section" && field.type !== "divider" && field.type !== "rich_text" && field.type !== "page_break") {
        const v = data[field.id];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
          return NextResponse.json(
            { error: "Validation failed", fieldId: field.id, message: `${field.label || "This field"} is required.` },
            { status: 400 }
          );
        }
      }
    }

    // Capture IP + UA
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    const submission = await db.submission.create({
      data: {
        formId: share.form.id,
        workspaceId: share.form.workspaceId,
        data: JSON.stringify(data),
        ip,
        userAgent,
        fingerprint: fingerprint || null,
        isCompleted: true,
      },
    });

    // Log analytics
    await db.analyticsEvent.create({
      data: {
        formId: share.form.id,
        eventType: "submit",
        payload: JSON.stringify({ submissionId: submission.id }),
        ip,
        fingerprint: fingerprint || null,
      },
    });

    // Send notification emails
    if (settings.notificationsEnabled && settings.notificationEmails?.length) {
      const summary = allFields
        .filter((f) => data[f.id] !== undefined && f.type !== "section" && f.type !== "divider" && f.type !== "page_break" && f.type !== "rich_text")
        .slice(0, 5)
        .map((f) => ({
          field: f.label || f.id,
          value: typeof data[f.id] === "object" ? JSON.stringify(data[f.id]) : String(data[f.id]),
        }));
      const submissionUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app/forms/${share.form.id}/submissions/${submission.id}`;
      await sendEmail({
        to: settings.notificationEmails,
        subject: `New submission on "${share.form.name}"`,
        html: submissionAlertHtml(share.form.name, submissionUrl, summary),
        text: `New submission on ${share.form.name}. View at ${submissionUrl}`,
      });
    }

    return NextResponse.json({
      ok: true,
      submissionId: submission.id,
      successMessage: schema.successMessage || "Thank you! Your response has been recorded.",
      redirectUrl: schema.redirectUrl,
    });
  } catch (e: any) {
    console.error("[public/submit] error:", e);
    return NextResponse.json(
      { error: "Internal error", details: e?.message },
      { status: 500 }
    );
  }
}
