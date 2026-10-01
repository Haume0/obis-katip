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
          subject: `Giriş kodunuz: ${otp}`,
          text: `OBİS Katip giriş kodunuz: ${otp}\n\nKod 5 dakika geçerlidir. Giriş yapmaya çalışmıyorsanız bu e-postayı görmezden gelin. Bu kodu kimseyle paylaşmayın.`,
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
