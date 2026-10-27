import Link from "next/link";
import { login } from "../actions";
import { ActionForm, Submit } from "@/components/forms";

export default function Giris() {
  return (
    <div className="narrow">
      <Link href="/" className="logo"><i>★</i>YorumKart</Link>
      <h1 style={{ marginTop: 24 }}>Giriş yapın</h1>
      <div className="card">
        <ActionForm action={login}>
          <div><label htmlFor="email">E-posta</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div><label htmlFor="password">Şifre</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <Submit>Giriş</Submit>
        </ActionForm>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>Hesabınız yok mu? <Link href="/kayit">Ücretsiz deneyin</Link></p>
    </div>
  );
}
