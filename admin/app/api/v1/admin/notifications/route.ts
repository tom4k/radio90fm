import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { broadcastNotifications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const list = await db
      .select()
      .from(broadcastNotifications)
      .orderBy(desc(broadcastNotifications.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Title and message are required" } },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const newNotif = {
      id,
      title: String(title).trim(),
      message: String(message).trim(),
      sentBy: session.name || "Station Admin",
      createdAt: new Date(),
    };

    await db.insert(broadcastNotifications).values(newNotif);

    return NextResponse.json({
      success: true,
      data: newNotif,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
