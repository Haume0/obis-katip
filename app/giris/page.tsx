import { Icon } from "@iconify/react/offline";
import arrowBack from "@iconify-icons/material-symbols/arrow-back-rounded";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import GirisFormu from "./giris-formu";

export default async function GirisPage() {
  if (await auth.api.getSession({ headers: await headers() }))
    redirect("/panel");

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="relative w-full max-w-[30rem] p-10 shadow-2xl shadow-primary/20">
        <Link
          href="/"
          aria-label="Ana sayfa"
          className={buttonVariants({
            size: "icon-lg",
            className: "absolute top-4 left-4",
          })}
        >
          <Icon icon={arrowBack} className="size-5" />
        </Link>
        <h1 className="mt-1 text-center text-3xl font-bold text-primary">
          Akademisyen Girişi
        </h1>
        <p className="mb-4 text-center text-lg font-light text-muted-foreground">
          Yöneticiden aldığınız e-posta ve şifre ile giriş yapabilirsiniz.
        </p>
        <GirisFormu />
      </Card>
    </main>
  );
}
