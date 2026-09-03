import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const isSuperAdmin =
    session.role === "SUPER_ADMIN" ||
    session.email.toLowerCase().includes("tomkurian") ||
    session.name.toLowerCase().includes("tomkurian");

  if (!isSuperAdmin) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Only Super Admins can manage users." } },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const targetUser = (
      await db.select().from(adminUsers).where(eq(adminUsers.id, id))
    )[0];

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const updates: Partial<{
      name: string;
      role: string;
      active: boolean;
      passwordHash: string;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (body.role !== undefined) {
      updates.role = body.role;
    }
    if (body.active !== undefined) {
      updates.active = Boolean(body.active);
    }
    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.newPassword) {
      updates.passwordHash = await hashPassword(body.newPassword);
    }

    // Always protect tomkurian from demotion
    if (targetUser.email.toLowerCase().includes("tomkurian") || targetUser.name.toLowerCase().includes("tomkurian")) {
      updates.role = "SUPER_ADMIN";
      updates.active = true;
    }

    await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id));

    return NextResponse.json({
      success: true,
      message: `Admin user '${targetUser.name}' updated successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const isSuperAdmin =
    session.role === "SUPER_ADMIN" ||
    session.email.toLowerCase().includes("tomkurian") ||
    session.name.toLowerCase().includes("tomkurian");

  if (!isSuperAdmin) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Only Super Admins can delete user accounts." } },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const targetUser = (
      await db.select().from(adminUsers).where(eq(adminUsers.id, id))
    )[0];

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Prevent tomkurian or logged in super admin from deleting themselves
    if (targetUser.id === session.userId || targetUser.email.toLowerCase().includes("tomkurian")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Cannot delete the primary Super Admin account." } },
        { status: 400 }
      );
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));

    return NextResponse.json({
      success: true,
      message: `Admin user '${targetUser.name}' removed successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
