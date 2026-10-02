import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createTransport } from "nodemailer";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  plugins: [
    emailOTP({
      // Hesapları yalnızca yönetici açar (scripts/hoca-ekle.ts). Kayıtlı olmayan
      // adrese kod gönderilmez ama yanıt aynıdır; hangi e-postanın kayıtlı olduğu sızmaz.
      disableSignUp: true,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp }) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[giriş kodu] ${email}: ${otp}`);
          return;
        }
        await createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === "true",
          // SMTP_STARTTLS=false: sunucu STARTTLS sunsa bile bağlantı şifrelenmeden kalır.
          ignoreTLS: process.env.SMTP_STARTTLS === "false",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        }).sendMail({
          from: `OBİS Katip <${process.env.SMTP_FROM}>`,
          to: email,
          // Okulun mail filtresi konuda kod geçen, yalnızca düz metin olan e-postaları
          // siliyor. staj-app'te çözüm: sabit konu + HTML gövde (kod yalnızca gövdede).
          subject: "Giriş Kodu",
          text: `OBİS Katip giriş kodunuz: ${otp}\n\nKod 5 dakika geçerlidir. Giriş yapmaya çalışmıyorsanız bu e-postayı görmezden gelin. Bu kodu kimseyle paylaşmayın.`,
          html: `<!DOCTYPE html>
<html lang="tr">
<head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /></head>
<body style="background-color:#ffffff">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:37.5em;padding:0 12px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif">
<tbody><tr><td>
<h1 style="color:#333;font-size:24px;font-weight:bold;margin:40px 0">Giriş Yap</h1>
<p style="font-size:14px;line-height:24px;color:#333;margin:24px 0 14px">Bu geçici giriş kodunu OBİS Katip'e gir:</p>
<code style="display:inline-block;padding:16px 4.5%;width:90.5%;background-color:#f4f4f4;border-radius:5px;border:1px solid #eee;color:#333;font-size:20px;letter-spacing:4px">${otp}</code>
<p style="font-size:14px;line-height:24px;color:#ababab;margin:14px 0 16px">Kod 5 dakika geçerlidir. Giriş yapmaya çalışmıyorsan bu e-postayı görmezden gel.</p>
<p style="font-size:14px;line-height:24px;color:#ababab;margin:12px 0 38px">Dikkat! Bu kodu kimseyle paylaşma!</p>
<p style="font-size:12px;line-height:22px;color:#898989;margin:12px 0 24px">OBİS Katip</p>
</td></tr></tbody>
</table>
</body>
</html>`,
        });
      },
    }),
    nextCookies(),
  ],
});

// Panel sayfaları ve server action'lar oturumu burada doğrular. Layout'taki kontrol
// sayfa geçişlerinde yeniden çalışmadığı için tek başına yeterli değil.
export const oturumuDogrula = cache(async () => {
  const oturum = await auth.api.getSession({ headers: await headers() });
  if (!oturum) redirect("/giris");
  return oturum;
});
