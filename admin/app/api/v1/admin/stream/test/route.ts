import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const testStreamSchema = z.object({
  streamUrl: z.string().url(),
});

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
    const parsed = testStreamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_INPUT", message: "Invalid stream URL" },
        },
        { status: 400 }
      );
    }

    const { streamUrl } = parsed.data;

    // Validate HTTPS protocol recommendation
    const urlObj = new URL(streamUrl);

    // Abort controller for quick timeout (4 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(streamUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Radio90FM-StreamChecker/1.0",
        },
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "unknown";

      return NextResponse.json({
        success: true,
        data: {
          reachable: res.ok,
          status: res.status,
          contentType: contentType,
          isHttps: urlObj.protocol === "https:",
        },
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      // Fallback: try GET with stream abort to handle servers that don't support HEAD
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 4000);

      try {
        const getRes = await fetch(streamUrl, {
          method: "GET",
          signal: getController.signal,
          headers: {
            "User-Agent": "Radio90FM-StreamChecker/1.0",
            Range: "bytes=0-100",
          },
        });
        clearTimeout(getTimeoutId);

        return NextResponse.json({
          success: true,
          data: {
            reachable: getRes.ok || getRes.status === 206,
            status: getRes.status,
            contentType: getRes.headers.get("content-type") || "unknown",
            isHttps: urlObj.protocol === "https:",
          },
        });
      } catch (getErr: any) {
        clearTimeout(getTimeoutId);
        return NextResponse.json({
          success: true,
          data: {
            reachable: false,
            status: 0,
            error: fetchErr.message || "Failed to reach audio stream",
            isHttps: urlObj.protocol === "https:",
          },
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Stream test error" },
      },
      { status: 500 }
    );
  }
}
