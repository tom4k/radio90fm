import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid admin email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: parsed.error.issues[0]?.message || "Invalid email",
          },
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()));

    const user = users[0];
    if (!user || !user.active) {
      // For security, return friendly response
      return NextResponse.json({
        success: true,
        message: "If an active admin account exists for this email, password reset instructions have been processed.",
      });
    }

    // In a full SMTP setup, an email token would be sent.
    // For direct station administration, we provide a secure reset token instruction.
    return NextResponse.json({
      success: true,
      message: `Password reset request verified for ${user.name}. Please contact Super Admin (tomkurian) or use the reset form to update your password.`,
      email: user.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to process request",
        },
      },
      { status: 500 }
    );
  }
}
