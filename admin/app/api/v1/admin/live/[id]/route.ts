import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveOverrides, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

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

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await db.delete(liveOverrides).where(eq(liveOverrides.id, id));

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: "LIVE_OVERRIDE_DELETED",
      entityType: "live_override",
      entityId: id,
      metadata: { id },
    });

    return NextResponse.json({ success: true, message: "Live Override deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
