import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { seedScheduleIfNeeded } from "../../../../../scripts/seed-schedule";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedScheduleIfNeeded();

    const list = await db
      .select()
      .from(programs)
      .where(eq(programs.isActive, true))
      .orderBy(asc(programs.dayOfWeek), asc(programs.startMinutes));

    return NextResponse.json({
      success: true,
      data: list.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        presenter: p.presenter,
        dayOfWeek: p.dayOfWeek,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
        phoneNumber: p.phoneNumber,
        whatsappNumber: p.whatsappNumber,
        enableCall: p.enableCall,
        enableWhatsapp: p.enableWhatsapp,
        displayOrder: p.displayOrder,
        imageUrl: p.imageUrl,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to fetch weekly schedule",
        },
      },
      { status: 500 }
    );
  }
}
