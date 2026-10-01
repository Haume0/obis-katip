"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function GirisFormu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [kodGonderildi, setKodGonderildi] = useState(false);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  // Form `action` yerine onSubmit: React 19 action bitince formu sıfırlıyor ve
  // hatalı denemeden sonra girilen değerler siliniyordu.
  async function kodGonder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setBekliyor(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setBekliyor(false);
    if (error) {
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı, biraz bekleyip tekrar deneyin."
          : "Kod gönderilemedi, lütfen tekrar deneyin.",
      );
      return;
    }
    setKodGonderildi(true);
  }

  async function girisYap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setBekliyor(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    if (error) {
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı, biraz bekleyip tekrar deneyin."
          : "Kod hatalı veya süresi dolmuş.",
      );
      setOtp("");
      setBekliyor(false);
      return;
    }
    router.push("/panel");
  }

  if (!kodGonderildi) {
    return (
      <form onSubmit={kodGonder} className="flex flex-col gap-3">
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
        {hata && (
          <p role="alert" className="text-sm text-destructive">
            {hata}
          </p>
        )}
        <Button type="submit" disabled={bekliyor} className="mt-2">
          {bekliyor ? "Gönderiliyor..." : "Giriş Kodu Gönder"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={girisYap} className="flex flex-col items-center gap-3">
      {/* Kayıtlı olmayan adrese kod gitmez ama mesaj aynı kalır; kayıtlı e-postalar sızmasın. */}
      <p className="text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{email}</span>{" "}
        kayıtlıysa bu adrese 6 haneli bir giriş kodu gönderildi.
      </p>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={otp}
        onChange={setOtp}
        autoFocus
        aria-label="Giriş kodu"
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {hata && (
        <p role="alert" className="text-sm text-destructive">
          {hata}
        </p>
      )}
      <Button
        type="submit"
        disabled={bekliyor || otp.length < 6}
        className="mt-2 w-full"
      >
        {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
      <Button
        variant="link"
        onClick={() => {
          setKodGonderildi(false);
          setOtp("");
          setHata("");
        }}
      >
        Farklı e-posta kullan
      </Button>
    </form>
  );
}
