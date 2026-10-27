"use client";

import { useFormState } from "react-dom";
import { sendFeedback } from "@/app/actions";
import { Msg, Submit } from "./forms";

export function FeedbackForm({ slug, t }: { slug: string; t?: string }) {
  const [state, action] = useFormState(sendFeedback, undefined);
  if (state?.ok) return <Msg state={state} />;
  return (
    <form action={action} className="stack">
      <input type="hidden" name="slug" value={slug} />
      {t && <input type="hidden" name="t" value={t} />}
      <div><label htmlFor="message">Notunuz</label><textarea id="message" name="message" required placeholder="Ne iyi gitti, neyi daha iyi yapabiliriz?" /></div>
      <div><label htmlFor="contact">Size dönelim mi? (isteğe bağlı)</label><input id="contact" name="contact" placeholder="Telefon veya e-posta" /></div>
      <p className="hint">Bıraktığınız iletişim bilgisi yalnızca işletmenin size geri dönmesi için kullanılır.</p>
      <Submit className="btn ghost block">İşletmeye gönder</Submit>
      <Msg state={state} />
    </form>
  );
}
