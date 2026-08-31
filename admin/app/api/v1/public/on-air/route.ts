import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stationConfig, programs, liveOverrides } from "@/db/schema";
import { eq, and, lte, gte, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Helper function to get current time components in Asia/Kolkata
function getKolkataTime() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  
  let weekdayStr = "";
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === "weekday") weekdayStr = part.value;
    if (part.type === "hour") hour = parseInt(part.value, 10);
    if (part.type === "minute") minute = parseInt(part.value, 10);
  }

  if (hour === 24) hour = 0;

  // Map Mon-Sun to 0-6
  const daysMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  const dayOfWeek = daysMap[weekdayStr] ?? 0;
  const currentMinutes = hour * 60 + minute;

  return { dayOfWeek, currentMinutes, now };
}

export async function GET() {
  try {
    const configList = await db.select().from(stationConfig);
    const config = configList[0] || {
      defaultPhone: "9496345029",
      defaultWhatsapp: "9048389090",
    };

    const { dayOfWeek, currentMinutes, now } = getKolkataTime();

    // 1. Check for Active Live Override
    const activeOverrides = await db
      .select()
      .from(liveOverrides)
      .where(
        and(
          eq(liveOverrides.enabled, true),
          lte(liveOverrides.startsAt, now),
          gte(liveOverrides.expiresAt, now)
        )
      );

    if (activeOverrides.length > 0) {
      const override = activeOverrides[0];
      const resolvedPhone = override.phoneNumber || config.defaultPhone;
      const resolvedWhatsapp = override.whatsappNumber || config.defaultWhatsapp;

      return NextResponse.json({
        success: true,
        data: {
          isLiveOverride: true,
          currentProgram: {
            id: override.id,
            title: override.title,
            description: override.description,
            presenter: override.presenter,
            startTime: override.startsAt.toISOString(),
            endTime: override.expiresAt.toISOString(),
          },
          nextProgram: null,
          contacts: {
            phone: resolvedPhone,
            whatsapp: resolvedWhatsapp,
            enableCall: override.enableCall && Boolean(resolvedPhone),
            enableWhatsapp: override.enableWhatsapp && Boolean(resolvedWhatsapp),
          },
        },
      });
    }

    // 2. Query all active programs
    const allActivePrograms = await db
      .select()
      .from(programs)
      .where(eq(programs.isActive, true))
      .orderBy(asc(programs.dayOfWeek), asc(programs.startMinutes));

    // 3. Find currently scheduled program for current day
    const todaysPrograms = allActivePrograms.filter((p) => p.dayOfWeek === dayOfWeek);

    let current = todaysPrograms
      .filter((p) => p.startMinutes <= currentMinutes)
      .pop();

    if (!current && allActivePrograms.length > 0) {
      // Fallback to last program of previous day if before first program today
      const prevDay = (dayOfWeek + 6) % 7;
      const prevDayPrograms = allActivePrograms.filter((p) => p.dayOfWeek === prevDay);
      current = prevDayPrograms.length > 0 ? prevDayPrograms[prevDayPrograms.length - 1] : allActivePrograms[0];
    }

    // 3. Find next program
    let next: any = null;
    if (current) {
      const curIndex = allActivePrograms.findIndex((p) => p.id === current.id);
      if (curIndex >= 0 && curIndex < allActivePrograms.length - 1) {
        next = allActivePrograms[curIndex + 1];
      } else if (allActivePrograms.length > 0) {
        next = allActivePrograms[0]; // Wrap to week start
      }
    }

    const resolvedPhone = current?.phoneNumber || config.defaultPhone;
    const resolvedWhatsapp = current?.whatsappNumber || config.defaultWhatsapp;

    return NextResponse.json({
      success: true,
      data: {
        isLiveOverride: false,
        currentProgram: current
          ? {
              id: current.id,
              title: current.title,
              description: current.description,
              presenter: current.presenter,
              dayOfWeek: current.dayOfWeek,
              startMinutes: current.startMinutes,
              endMinutes: current.endMinutes,
              enableCall: current.enableCall,
              enableWhatsapp: current.enableWhatsapp,
              phoneNumber: current.phoneNumber,
              whatsappNumber: current.whatsappNumber,
              imageUrl: current.imageUrl,
            }
          : {
              id: "station_default",
              title: "Radio 90 FM Live",
              description: "Voice of Amal Jyothi",
              presenter: "Voice of Amal Jyothi",
              dayOfWeek,
              startMinutes: 0,
              endMinutes: 1440,
              enableCall: true,
              enableWhatsapp: true,
            },
        nextProgram: next
          ? {
              id: next.id,
              title: next.title,
              presenter: next.presenter,
              dayOfWeek: next.dayOfWeek,
              startMinutes: next.startMinutes,
              endMinutes: next.endMinutes,
            }
          : null,
        contacts: {
          phone: resolvedPhone,
          whatsapp: resolvedWhatsapp,
          enableCall: (current ? current.enableCall : true) && Boolean(resolvedPhone),
          enableWhatsapp: (current ? current.enableWhatsapp : true) && Boolean(resolvedWhatsapp),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to fetch on-air program",
        },
      },
      { status: 500 }
    );
  }
}
