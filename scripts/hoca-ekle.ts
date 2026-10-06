// Kullanım: bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>" <şifre>
// Dışarıdan kayıt kapalı olduğu için hoca hesapları bu script ile açılır.
// Hoca şifresini değiştiremez ve e-posta ile sıfırlama yok; kayıtlı e-posta verilirse
// şifre yenisiyle değiştirilir (unutulan şifre ve OTP döneminden kalan hesaplar için).
import { auth } from "@/lib/auth";

const [email, name, sifre] = process.argv.slice(2);
if (!email || !name || !sifre) {
  console.error(
    'Kullanım: bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>" <şifre>',
  );
  process.exit(1);
}

const ctx = await auth.$context;
// Giriş endpoint'i bu sınırların dışındaki şifreyi reddettiği için burada da uygulanır.
const { minPasswordLength, maxPasswordLength } = ctx.password.config;
if (sifre.length < minPasswordLength || sifre.length > maxPasswordLength) {
  console.error(
    `Şifre ${minPasswordLength}-${maxPasswordLength} karakter olmalı.`,
  );
  process.exit(1);
}
const hash = await ctx.password.hash(sifre);

const mevcut = await ctx.internalAdapter.findUserByEmail(email.toLowerCase());
if (mevcut) {
  const { user } = mevcut;
  if (await ctx.internalAdapter.findCredentialAccount(user.id))
    await ctx.internalAdapter.updatePassword(user.id, hash);
  else
    await ctx.internalAdapter.createAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
  console.log(`Şifre güncellendi: ${user.email}`);
  process.exit(0);
}

// Adresi yönetici verdiği için doğrulanmış sayılır.
const user = await ctx.internalAdapter.createUser(
  { email: email.toLowerCase(), name, emailVerified: true },
  { method: "email-password" },
);
await ctx.internalAdapter.linkAccount({
  userId: user.id,
  providerId: "credential",
  accountId: user.id,
  password: hash,
});
console.log(`Hesap açıldı: ${user.email}`);
