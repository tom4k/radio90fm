import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs, auditLogs } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { seedScheduleIfNeeded } from "../../../../../scripts/seed-schedule";
import crypto from "crypto";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  presenter: z.string().optional().default(""),
  dayOfWeek: z.number().int().min(0).max(6),
  startMinutes: z.number().int().min(0).max(1439),
  endMinutes: z.number().int().min(0).max(1439),
  phoneNumber: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  enableCall: z.boolean().optional().default(true),
  enableWhatsapp: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
  imageUrl: z.string().nullable().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    await seedScheduleIfNeeded();

    const list = await db
      .select()
      .from(programs)
      .orderBy(asc(programs.dayOfWeek), asc(programs.startMinutes));
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
    const parsed = programSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_INPUT", message: "Invalid program data" },
        },
        { status: 400 }
      );
    }

    const programData = parsed.data;
    const newId = crypto.randomUUID();

    // Check overlap warning
    const existing = await db
      .select()
      .from(programs)
      .where(eq(programs.dayOfWeek, programData.dayOfWeek));

    const hasOverlap = existing.some(
      (p) =>
        p.isActive &&
        ((programData.startMinutes >= p.startMinutes && programData.startMinutes < p.endMinutes) ||
          (programData.endMinutes > p.startMinutes && programData.endMinutes <= p.endMinutes) ||
          (programData.startMinutes <= p.startMinutes && programData.endMinutes >= p.endMinutes))
    );

    const inserted = {
      id: newId,
      ...programData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(programs).values(inserted);

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminUserId: session.userId,
      action: "PROGRAM_CREATED",
      entityType: "program",
      entityId: newId,
      metadata: { title: programData.title, hasOverlap },
    });

    return NextResponse.json({
      success: true,
      data: inserted,
      warning: hasOverlap ? "Warning: Schedule overlap detected for this day" : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
