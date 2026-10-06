"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function GirisFormu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  // Form `action` yerine onSubmit: React 19 action bitince formu sıfırlıyor ve
  // hatalı denemeden sonra girilen değerler siliniyordu.
  async function girisYap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setBekliyor(true);
    const { error } = await authClient.signIn.email({
      email,
      password: sifre,
    });
    if (error) {
      // Kayıtsız e-posta ile yanlış şifre aynı mesajı alır; kayıtlı e-postalar sızmasın.
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı, biraz bekleyip tekrar deneyin."
          : "E-posta veya şifre hatalı.",
      );
      setSifre("");
      setBekliyor(false);
      return;
    }
    router.push("/panel");
  }

  return (
    <form onSubmit={girisYap} className="flex flex-col gap-3">
      <Label htmlFor="email">E-posta</Label>
      <Input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label htmlFor="sifre" className="mt-2">
        Şifre
      </Label>
      <Input
        id="sifre"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
      />
      {hata && (
        <p role="alert" className="text-sm text-destructive">
          {hata}
        </p>
      )}
      <Button type="submit" disabled={bekliyor} className="mt-2">
        {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
