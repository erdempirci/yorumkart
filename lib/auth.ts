import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, type Business } from "./db";
import { COOKIE, signSession, verifySession } from "./session";

export async function currentBusiness(): Promise<Business | null> {
  const bid = await verifySession(cookies().get(COOKIE)?.value);
  if (!bid) return null;
  return one<Business>("SELECT * FROM businesses WHERE id = ?", [bid]);
}

export async function requireBusiness(): Promise<Business> {
  const b = await currentBusiness();
  if (!b) redirect("/giris");
  return b;
}

export async function startSession(businessId: number) {
  cookies().set(COOKIE, await signSession(businessId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function endSession() {
  cookies().delete(COOKIE);
}
