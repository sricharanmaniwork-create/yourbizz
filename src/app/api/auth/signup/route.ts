import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { slugify } from "@/lib/constants";

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  workspaceName: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        emailVerified: new Date(),
      },
    });

    // Create personal workspace + owner membership
    const wsSlug = slugify(workspaceName || `${name}'s Workspace`);
    const workspace = await db.workspace.create({
      data: {
        slug: wsSlug,
        name: workspaceName || `${name}'s Workspace`,
        ownerId: user.id,
        plan: "free",
        members: {
          create: {
            userId: user.id,
            role: "owner",
            acceptedAt: new Date(),
          },
        },
      },
    });

    // Send welcome email (stub in sandbox)
    await sendEmail({
      to: normalizedEmail,
      subject: "Welcome to YourBizz 🎉",
      html: welcomeEmailHtml(name),
      text: `Hi ${name}, welcome to YourBizz! Your workspace is ready.`,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, slug: workspace.slug, name: workspace.name },
    });
  } catch (e: any) {
    console.error("[signup] error:", e);
    return NextResponse.json(
      { error: "Internal server error", details: e?.message },
      { status: 500 }
    );
  }
}
