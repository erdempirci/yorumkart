"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { one, run, type Business } from "@/lib/db";
import { endSession, requireBusiness, startSession } from "@/lib/auth";
import { baseUrl, DEFAULT_TEMPLATE, fillTemplate, googleReviewUrl, normalizeTrPhone, slugify, token } from "@/lib/util";

export type FormState = { error?: string; ok?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function signup(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  const password = str(f, "password");
  if (name.length < 2) return { error: "İşletme adını yazın." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Geçerli bir e-posta yazın." };
  if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı." };
  if (await one("SELECT id FROM businesses WHERE email = ?", [email])) return { error: "Bu e-posta zaten kayıtlı." };

  let slug = slugify(name);
  if (await one("SELECT id FROM businesses WHERE slug = ?", [slug])) slug = `${slug}-${token(3).toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const hash = await bcrypt.hash(password, 10);
  const { lastId } = await run(
    "INSERT INTO businesses (slug, name, email, password_hash, wa_template) VALUES (?, ?, ?, ?, ?)",
    [slug, name, email, hash, DEFAULT_TEMPLATE],
  );
  await startSession(lastId!);
  redirect("/panel/ayarlar?ilk=1");
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email").toLowerCase();
  const b = await one<Business>("SELECT * FROM businesses WHERE email = ?", [email]);
  if (!b || !(await bcrypt.compare(str(f, "password"), b.password_hash))) return { error: "E-posta veya şifre hatalı." };
  await startSession(b.id);
  redirect("/panel");
}

export async function logout() {
  endSession();
  redirect("/");
}

export async function saveSettings(_: FormState, f: FormData): Promise<FormState> {
  const b = await requireBusiness();
  const name = str(f, "name");
  const googleInput = str(f, "google_url");
  const template = str(f, "wa_template") || DEFAULT_TEMPLATE;
  const color = /^#[0-9a-fA-F]{6}$/.test(str(f, "color")) ? str(f, "color") : b.color;
  if (name.length < 2) return { error: "İşletme adını yazın." };
  const g = googleReviewUrl(googleInput);
  if (googleInput && !g) return { error: "Google bağlantısı tam bir URL (https://...) ya da Place ID olmalı." };
  if (!template.includes("{link}")) return { error: "Mesaj şablonunda {link} geçmeli, yoksa müşteri sayfaya ulaşamaz." };
  await run("UPDATE businesses SET name = ?, google_url = ?, wa_template = ?, color = ? WHERE id = ?", [name, g, template, color, b.id]);
  revalidatePath("/panel", "layout");
  return { ok: "Kaydedildi." };
}

export type RequestResult = { error?: string; waUrl?: string; link?: string };

export async function createRequest(f: FormData): Promise<RequestResult> {
  const b = await requireBusiness();
  const name = str(f, "customer_name").slice(0, 60);
  const phone = normalizeTrPhone(str(f, "phone"));
  if (!phone) return { error: "Numara 05xx xxx xx xx biçiminde olmalı." };
  const t = token(6);
  // KVKK: tam numara saklanmaz; WhatsApp bağlantısı tarayıcıda açılır, biz yalnızca son 4 haneyi tutarız.
  await run("INSERT INTO requests (business_id, token, customer_name, phone_last4) VALUES (?, ?, ?, ?)", [b.id, t, name || null, phone.slice(-4)]);
  await run("INSERT INTO events (business_id, type, source) VALUES (?, 'request_sent', 'whatsapp')", [b.id]);
  const link = `${baseUrl()}/r/${b.slug}?t=${t}`;
  const text = fillTemplate(b.wa_template || DEFAULT_TEMPLATE, { ad: name || "", isletme: b.name, link }).replace(/\s+,/g, ",").replace(/ {2,}/g, " ");
  revalidatePath("/panel", "layout");
  return { waUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`, link };
}

export async function sendFeedback(_: FormState, f: FormData): Promise<FormState> {
  const slug = str(f, "slug");
  const message = str(f, "message").slice(0, 2000);
  const contact = str(f, "contact").slice(0, 120);
  const t = str(f, "t");
  if (message.length < 3) return { error: "Lütfen birkaç kelime yazın." };
  const b = await one<{ id: number }>("SELECT id FROM businesses WHERE slug = ?", [slug]);
  if (!b) return { error: "İşletme bulunamadı." };
  const r = t ? await one<{ id: number }>("SELECT id FROM requests WHERE token = ? AND business_id = ?", [t, b.id]) : null;
  await run("INSERT INTO feedback (business_id, request_id, message, contact) VALUES (?, ?, ?, ?)", [b.id, r?.id ?? null, message, contact || null]);
  await run("INSERT INTO events (business_id, type) VALUES (?, 'feedback')", [b.id]);
  return { ok: "Teşekkürler! Mesajınız doğrudan işletme sahibine iletildi." };
}
