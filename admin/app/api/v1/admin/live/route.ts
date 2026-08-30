import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveOverrides, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
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
      .from(liveOverrides)
      .orderBy(desc(liveOverrides.createdAt));
    return NextResponse.json({ success: true, data: list });
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

  try {
    const body = await request.json();
    const newId = crypto.randomUUID();

    const inserted = {
      id: newId,
      title: body.title,
      description: body.description || "",
      presenter: body.presenter || "",
      phoneNumber: body.phoneNumber || null,
      whatsappNumber: body.whatsappNumber || null,
      enableCall: body.enableCall ?? true,
      enableWhatsapp: body.enableWhatsapp ?? true,
      enabled: body.enabled ?? true,
      startsAt: new Date(body.startsAt),
      expiresAt: new Date(body.expiresAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(liveOverrides).values(inserted);

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: "LIVE_OVERRIDE_STARTED",
      entityType: "live_override",
      entityId: newId,
      metadata: { title: body.title },
    });

    return NextResponse.json({ success: true, data: inserted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
