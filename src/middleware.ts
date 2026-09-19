import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const skipPaths = ["/api/health", "/health"];

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/predict"],
};
