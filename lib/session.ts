import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "yk_session";

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET en az 32 karakter olmalı");
  return new TextEncoder().encode(s);
}

export async function signSession(businessId: number) {
  return new SignJWT({ bid: businessId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.bid === "number" ? payload.bid : null;
  } catch {
    return null;
  }
}
