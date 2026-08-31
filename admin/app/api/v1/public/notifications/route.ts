import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { broadcastNotifications } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(broadcastNotifications)
      .orderBy(desc(broadcastNotifications.createdAt))
      .limit(10);

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
