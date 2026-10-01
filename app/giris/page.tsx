import { Icon } from "@iconify/react/offline";
import arrowBack from "@iconify-icons/material-symbols/arrow-back-rounded";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import GirisFormu from "./giris-formu";

export default async function GirisPage() {
  if (await auth.api.getSession({ headers: await headers() }))
    redirect("/panel");

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <section className="relative flex w-full max-w-[30rem] flex-col rounded-2xl border border-primary/10 bg-white p-10 shadow-2xl shadow-primary/20">
        <Link
          href="/"
          aria-label="Ana sayfa"
          className="MainButton absolute top-4 left-4 size-10! p-0!"
        >
          <Icon icon={arrowBack} className="size-5" />
        </Link>
        <h1 className="mt-1 mb-2 text-center text-3xl font-bold text-primary">
          Akademisyen Girişi
        </h1>
        <p className="mb-6 text-center text-lg font-light text-black/70">
          Kayıtlı e-posta adresinize gelen kod ile giriş yapabilirsiniz.
        </p>
        <GirisFormu />
      </section>
    </main>
  );
}
