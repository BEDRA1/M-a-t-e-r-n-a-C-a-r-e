import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const search = request.nextUrl.search;
  return proxyToBackend(request, path.join("/") + search);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const PUT = handle;
