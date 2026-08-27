import { cookies } from "next/headers";
import { BACKEND_API_URL } from "../env";
import { ACCESS_COOKIE } from "./cookies";
import type { User } from "../types";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const res = await fetch(`${BACKEND_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}`, "Accept-Language": "ar" },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
