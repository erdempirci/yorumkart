# YorumKart — Google yorum toplama MVP'si

Küçük işletmeler için: masadaki QR/NFC kart ve WhatsApp mesajıyla müşteriden Google yorumu isteme, işletmeye özel geri bildirim toplama ve basit bir panel.

## Özellikler
- İşletme kaydı / girişi (e-posta + şifre, 30 günlük oturum)
- Herkese açık yorum sayfası `/r/<işletme>`: herkese aynı "Google'da yorum yaz" butonu + isteğe bağlı "işletmeye özel not"
- QR kod (PNG/SVG indir) ve NFC için adres; ziyaretler kaynağına göre (QR / NFC / WhatsApp / bağlantı) kaydedilir
- WhatsApp ile yorum isteme: numarayı yaz → hazır mesajla `wa.me` açılır (API maliyeti yok, mesaj işletmenin kendi WhatsApp'ından gider)
- İstek takibi: Gönderildi → Açtı → Google'a geçti
- Panel: son 30 gün sayfa açılma, Google'a yönlenme oranı, istek sayısı, özel notlar
- WhatsApp/Facebook bağlantı önizleme botları sayılmaz
- `/r/demo-kafe` satış görüşmeleri için hazır demo sayfası

## Kurallar (tasarıma gömülü)
- **Google İşletme Profili politikası:** Yorum karşılığında indirim/hediye yasak; yalnızca memnun müşteriyi Google'a yönlendirmek (review gating) yasak. Bu yüzden yıldız sorup mutsuzu ayıklayan bir akış YOK; herkes aynı Google butonunu görür.
- **KVKK:** Müşterinin tam telefon numarası saklanmaz (yalnızca son 4 hane). İşletme, mesaj göndermeden önce müşteriden iletişim izni almalı. Canlıya çıkmadan önce aydınlatma metni ve gizlilik politikası eklenmeli.

## Yerelde çalıştırma
```bash
npm install
cp .env.example .env.local   # SESSION_SECRET'ı değiştirin
npm run dev                  # http://localhost:3000
```
Veritabanı ilk istekte `data/local.db` olarak otomatik oluşur.

## Canlıya alma (önerilen: Vercel + Turso, ikisinin de ücretsiz katmanı var)
1. Turso'da veritabanı aç: `turso db create yorumkart` → URL ve token al.
2. Vercel'e bu repoyu bağla, ortam değişkenleri:
   - `DATABASE_URL=libsql://...turso.io`
   - `DATABASE_AUTH_TOKEN=...`
   - `SESSION_SECRET=` (en az 32 karakter, `openssl rand -base64 48`)
   - `BASE_URL=https://alanadiniz.com`
3. Alan adını bağla. QR kodlar `BASE_URL` ile üretilir; basılmadan önce alan adının kesinleştiğinden emin olun.

## Mimari
- Next.js 14 (App Router, server actions) · TypeScript
- `@libsql/client`: yerelde SQLite dosyası, canlıda Turso — aynı kod
- `jose` (oturum JWT çerezi), `bcryptjs` (şifre), `qrcode`
- Tablolar: `businesses`, `requests`, `feedback`, `events` (şema `lib/db.ts` içinde, açılışta kurulur)

## Yol haritası (sonraki adımlar)
1. Ödeme: iyzico abonelik (aylık/yıllık), 14 gün deneme bitince kilit
2. Şifre sıfırlama e-postası (Resend)
3. Google Business Profile API ile yorumları panele çekme + yapay zekâ ile Türkçe cevap taslağı (API erişimi Google onayı gerektirir)
4. Yeni olumsuz özel not gelince işletme sahibine WhatsApp/e-posta bildirimi
5. Çok şubeli işletme ve ajans (beyaz etiket) hesabı
6. WhatsApp Business Cloud API ile otomatik gönderim (POS/adisyon entegrasyonu)
