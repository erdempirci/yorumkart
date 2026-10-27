"use client";

import { useRef, useState, useTransition } from "react";
import { createRequest } from "@/app/actions";

export function RequestForm({ disabled }: { disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [last, setLast] = useState<{ waUrl: string; link: string }>();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Pencereyi kullanıcı tıklamasıyla senkron açıyoruz; aksi halde mobil tarayıcılar engeller.
    const win = window.open("about:blank", "_blank");
    start(async () => {
      const r = await createRequest(fd);
      if (r.error || !r.waUrl) {
        win?.close();
        setError(r.error || "Bir sorun oluştu.");
        return;
      }
      setError(undefined);
      setLast({ waUrl: r.waUrl, link: r.link! });
      if (win) win.location.href = r.waUrl;
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="stack">
      <div className="row">
        <div><label htmlFor="customer_name">Müşteri adı (isteğe bağlı)</label><input id="customer_name" name="customer_name" placeholder="Ayşe" /></div>
        <div><label htmlFor="phone">Cep numarası</label><input id="phone" name="phone" inputMode="tel" placeholder="05xx xxx xx xx" required /></div>
      </div>
      <button className="btn block" disabled={pending || disabled} type="submit">
        {pending ? "Hazırlanıyor…" : "WhatsApp ile yorum iste"}
      </button>
      {disabled && <div className="msg err">Önce Ayarlar&apos;dan Google yorum bağlantınızı ekleyin.</div>}
      {error && <div className="msg err" role="alert">{error}</div>}
      {last && (
        <div className="msg ok" role="status">
          WhatsApp açıldı. Açılmadıysa <a href={last.waUrl} target="_blank" rel="noreferrer">buraya dokunun</a>.
        </div>
      )}
      <p className="hint">Mesaj kendi WhatsApp&apos;ınızdan gider. Numaranın yalnızca son 4 hanesi saklanır. Müşteriye bu mesajı göndermeden önce iletişim izni aldığınızdan emin olun.</p>
    </form>
  );
}
