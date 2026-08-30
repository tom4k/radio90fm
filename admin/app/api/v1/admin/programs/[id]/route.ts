import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

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

  const { id } = await params;

  try {
    const body = await request.json();
    await db
      .update(programs)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(programs.id, id));

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: "PROGRAM_UPDATED",
      entityType: "program",
      entityId: id,
      metadata: body,
    });

    return NextResponse.json({ success: true, data: { id, ...body } });
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

  const { id } = await params;

  try {
    await db.delete(programs).where(eq(programs.id, id));

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: "PROGRAM_DELETED",
      entityType: "program",
      entityId: id,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
