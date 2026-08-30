import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stationConfig } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configList = await db.select().from(stationConfig);
    const config = configList[0] || {
      stationName: "Radio 90 FM",
      tagline: "Voice of Amal Jyothi",
      streamUrl: "https://icecast.octosignals.com/radio90_final",
      streamEnabled: true,
      fallbackStreamUrl: "https://icecast.octosignals.com/radio90_final",
      defaultPhone: "9496345029",
      defaultWhatsapp: "9048389090",
      email: "radio90@amaljyothi.ac.in",
      website: "https://radio90.in",
      facebookUrl: "https://www.facebook.com/fm.radio90/",
      instagramUrl: "https://www.instagram.com/radio90.fm",
      youtubeUrl: "https://youtube.com/@radio90fm13",
      spotifyUrl: "https://open.spotify.com/show/68Ii81VKFBzRWKnEo2y1Oe",
      xUrl: "https://twitter.com/Radio90FM_AJCE",
      timezone: "Asia/Kolkata",
      configVersion: 1,
    };

    return NextResponse.json({
      success: true,
      data: {
        station: {
          name: config.stationName,
          tagline: config.tagline,
          timezone: config.timezone,
          email: config.email,
          website: config.website,
        },
        stream: {
          url: config.streamUrl,
          enabled: config.streamEnabled,
          fallbackUrl: config.fallbackStreamUrl,
        },
        contacts: {
          phone: config.defaultPhone,
          whatsapp: config.defaultWhatsapp,
        },
        socials: {
          facebook: config.facebookUrl,
          instagram: config.instagramUrl,
          youtube: config.youtubeUrl,
          spotify: config.spotifyUrl,
          x: config.xUrl,
        },
        configVersion: config.configVersion,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to fetch station configuration",
        },
      },
      { status: 500 }
    );
  }
}
