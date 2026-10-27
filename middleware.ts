import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "./lib/session";

export async function middleware(req: NextRequest) {
  const bid = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!bid) {
    const url = req.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/panel/:path*"] };
