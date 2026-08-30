import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stationConfig, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const configList = await db.select().from(stationConfig);
    const config = configList[0];
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const existingList = await db.select().from(stationConfig);
    const existing = existingList[0];

    const currentVersion = existing ? existing.configVersion : 1;
    const newVersion = currentVersion + 1;

    const updated = {
      ...body,
      configVersion: newVersion,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(stationConfig).set(updated).where(eq(stationConfig.id, existing.id));
    } else {
      await db.insert(stationConfig).values({ id: 1, ...updated });
    }

    // Audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: body.streamUrl !== existing?.streamUrl ? "STREAM_CHANGED" : "STATION_SETTINGS_CHANGED",
      entityType: "station_config",
      entityId: "1",
      metadata: { changes: Object.keys(body) },
    });

    return NextResponse.json({
      success: true,
      data: { ...existing, ...updated },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
