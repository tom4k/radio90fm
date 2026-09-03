import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).default("ADMIN"),
});

export async function GET() {
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
      { success: false, error: { code: "FORBIDDEN", message: "Only Super Admins can access user management." } },
      { status: 403 }
    );
  }

  try {
    const users = await db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        active: adminUsers.active,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt,
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));

    // Ensure tomkurian is always marked as SUPER_ADMIN
    const processedUsers = users.map((u) => {
      if (u.email.toLowerCase().includes("tomkurian") || u.name.toLowerCase().includes("tomkurian")) {
        return { ...u, role: "SUPER_ADMIN" };
      }
      return u;
    });

    return NextResponse.json({
      success: true,
      data: { users: processedUsers },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      { success: false, error: { code: "FORBIDDEN", message: "Only Super Admins can create new admin accounts." } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: parsed.error.issues[0]?.message || "Invalid user data",
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check if email already exists
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()));

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: `An admin account with email '${email}' already exists.`,
          },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    const assignedRole = (email.toLowerCase().includes("tomkurian") || name.toLowerCase().includes("tomkurian"))
      ? "SUPER_ADMIN"
      : role;

    await db.insert(adminUsers).values({
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      role: assignedRole,
      active: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          name,
          email: email.toLowerCase(),
          role: assignedRole,
          active: true,
        },
      },
      message: `Admin user '${name}' (${assignedRole}) created successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
