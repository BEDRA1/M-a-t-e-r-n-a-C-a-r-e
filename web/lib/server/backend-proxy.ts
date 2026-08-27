import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "../env";
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "./cookies";

interface BackendCallResult {
  status: number;
  body: unknown;
}

async function callBackend(
  path: string,
  method: string,
  accessToken: string | undefined,
  acceptLanguage: string | null,
  jsonBody: unknown,
): Promise<BackendCallResult> {
  const headers: Record<string, string> = {};
  if (jsonBody !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (acceptLanguage) {
    headers["Accept-Language"] = acceptLanguage;
  }

  const res = await fetch(`${BACKEND_API_URL}/${path}`, {
    method,
    headers,
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function tryRefresh(
  refreshToken: string,
  acceptLanguage: string | null,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const result = await callBackend("auth/refresh", "POST", undefined, acceptLanguage, {
    refreshToken,
  });
  if (result.status !== 201 && result.status !== 200) {
    return null;
  }
  const body = result.body as { accessToken?: string; refreshToken?: string } | null;
  if (!body?.accessToken || !body?.refreshToken) {
    return null;
  }
  return { accessToken: body.accessToken, refreshToken: body.refreshToken };
}

/**
 * وسيط بين المتصفح والـ Backend الفعلي: يقرأ access token من httpOnly cookie،
 * وإن كان منتهي الصلاحية (401) يحاول تجديده تلقائيًا عبر refresh token قبل إعادة المحاولة مرة واحدة.
 */
export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  // الموقع عربي فقط حاليًا، لذا نفرض العربية بغض النظر عن إعدادات لغة المتصفح
  const acceptLanguage = "ar";

  let jsonBody: unknown = undefined;
  if (request.method !== "GET" && request.method !== "DELETE") {
    const text = await request.text();
    jsonBody = text ? JSON.parse(text) : undefined;
  }

  let result = await callBackend(
    backendPath,
    request.method,
    accessToken,
    acceptLanguage,
    jsonBody,
  );

  if (result.status === 401 && refreshToken) {
    const refreshed = await tryRefresh(refreshToken, acceptLanguage);
    if (refreshed) {
      result = await callBackend(
        backendPath,
        request.method,
        refreshed.accessToken,
        acceptLanguage,
        jsonBody,
      );
      const response = NextResponse.json(result.body, { status: result.status });
      setAuthCookies(response, refreshed);
      return response;
    }
    const response = NextResponse.json(result.body, { status: result.status });
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.json(result.body, { status: result.status });
}
