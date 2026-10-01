"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";

export default function GirisFormu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: String(new FormData(event.currentTarget).get("otp")),
    });
    if (error) {
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı, biraz bekleyip tekrar deneyin."
          : "Kod hatalı veya süresi dolmuş.",
      );
      setBekliyor(false);
      return;
    }
    router.push("/panel");
  }

  if (!kodGonderildi) {
    return (
      <form onSubmit={kodGonder} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          E-posta
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="MainInput font-normal"
          />
        </label>
        {hata && (
          <p role="alert" className="text-sm text-ret">
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
    <form onSubmit={girisYap} className="flex flex-col gap-3">
      {/* Kayıtlı olmayan adrese kod gitmez ama mesaj aynı kalır; kayıtlı e-postalar sızmasın. */}
      <p className="text-center text-sm text-black/70">
        <span className="font-semibold">{email}</span> kayıtlıysa bu adrese 6
        haneli bir giriş kodu gönderildi.
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Giriş kodu
        <input
          name="otp"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          className="MainInput text-center font-normal tracking-[0.5em]"
        />
      </label>
      {hata && (
        <p role="alert" className="text-sm text-ret">
          {hata}
        </p>
      )}
      <Button type="submit" disabled={bekliyor} className="mt-2">
        {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setKodGonderildi(false);
          setHata("");
        }}
        className="cursor-pointer text-sm font-medium text-prime underline hover:text-primary"
      >
        Farklı e-posta kullan
      </button>
    </form>
  );
}
