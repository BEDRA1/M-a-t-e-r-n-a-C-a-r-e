import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/env";
import { setAuthCookies } from "@/lib/server/cookies";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const backendRes = await fetch(`${BACKEND_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "ar",
    },
    body,
    cache: "no-store",
  });

  const data = await backendRes.json().catch(() => null);

  if (backendRes.status >= 300) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const response = NextResponse.json({ user: data.user }, { status: backendRes.status });
  setAuthCookies(response, { accessToken: data.accessToken, refreshToken: data.refreshToken });
  return response;
}
