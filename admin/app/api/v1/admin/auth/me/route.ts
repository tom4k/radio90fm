import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
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
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.userId));

    const user = users[0];

    // Check if tomkurian should be super admin
    let role = user ? user.role : session.role;
    if (session.email.toLowerCase().includes("tomkurian") || session.name.toLowerCase().includes("tomkurian")) {
      role = "SUPER_ADMIN";
    }

    return NextResponse.json({
      success: true,
      data: {
        user: user ? { ...user, role } : { id: session.userId, name: session.name, email: session.email, role },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
