/**
 * Server-side auth helpers.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Workspace, WorkspaceMember, User } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export type AuthContext = {
  user: SessionUser;
  workspace: Workspace & {
    members: (WorkspaceMember & { user: User })[];
  };
  role: "owner" | "admin" | "builder" | "reviewer" | "viewer";
};

/**
 * Get the current authenticated user + their primary workspace.
 * Returns null if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true },
  });
  if (!user) return null;

  // Find the user's primary workspace (first membership, owner first).
  const membership = await db.workspaceMember.findFirst({
    where: { userId: user.id, acceptedAt: { not: null } },
    include: {
      workspace: { include: { members: { include: { user: true } } } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  if (!membership) return { user, workspace: null, role: null } as any;

  return {
    user,
    workspace: membership.workspace,
    role: membership.role as AuthContext["role"],
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error("UNAUTHORIZED");
  }
  return ctx;
}

export async function requireWorkspaceRole(
  workspaceId: string,
  roles: AuthContext["role"][]
): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;

  const membership = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: session.user.id },
    },
    select: { role: true, acceptedAt: true },
  });

  if (!membership || !membership.acceptedAt) return false;
  return roles.includes(membership.role as AuthContext["role"]);
}
