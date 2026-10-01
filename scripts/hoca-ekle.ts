// Kullanım: bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>"
// Dışarıdan kayıt kapalı olduğu için hoca hesapları bu script ile açılır.
// Şifre yok; hoca e-postasına gelen kodla giriş yapar.
import { auth } from "@/lib/auth";

const [email, name] = process.argv.slice(2);
if (!email || !name) {
  console.error('Kullanım: bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>"');
  process.exit(1);
}

const ctx = await auth.$context;
if (await ctx.internalAdapter.findUserByEmail(email.toLowerCase())) {
  console.error(`${email} zaten kayıtlı.`);
  process.exit(1);
}

// Adresi yönetici verdiği için doğrulanmış sayılır; aksi halde better-auth ilk kod
// girişinde hesabı "doğrulanmamış" kabul edip ek işlem yapıyor.
const user = await ctx.internalAdapter.createUser(
  { email: email.toLowerCase(), name, emailVerified: true },
  { method: "email-otp" },
);
console.log(`Hesap açıldı: ${user.email}`);
