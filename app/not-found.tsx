import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-[30rem] items-center p-10 text-center shadow-2xl shadow-primary/20">
        <span className="text-7xl font-black text-primary/80">404</span>
        <h1 className="text-3xl font-bold text-primary">Böyle bir yer yok!</h1>
        <p className="text-base text-muted-foreground">
          Aradığınız sayfa yok ya da size ait değil.
        </p>
        <Link href="/panel" className={buttonVariants({ className: "mt-2" })}>
          Panele dön
        </Link>
      </Card>
    </main>
  );
}
