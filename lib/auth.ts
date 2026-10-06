import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
    // Hesapları ve şifreleri yalnızca yönetici belirler (scripts/hoca-ekle.ts). Okulun
    // mail sistemi kod e-postalarını engellediği için e-posta ile giriş/sıfırlama yok.
    disableSignUp: true,
  },
  plugins: [nextCookies()],
});

// Panel sayfaları ve server action'lar oturumu burada doğrular. Layout'taki kontrol
// sayfa geçişlerinde yeniden çalışmadığı için tek başına yeterli değil.
export const oturumuDogrula = cache(async () => {
  const oturum = await auth.api.getSession({ headers: await headers() });
  if (!oturum) redirect("/giris");
  return oturum;
});
