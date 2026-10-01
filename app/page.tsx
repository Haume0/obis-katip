import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-[30rem] p-10 shadow-2xl shadow-primary/20">
        <span className="text-center text-lg font-light text-muted-foreground">
          Hoş geldiniz,
        </span>
        <h1 className="-mt-2 text-center text-3xl font-bold text-primary">
          OBİS Katip
        </h1>
        <p className="mb-2 text-center text-muted-foreground">
          Sınav sonuçlarından öğrenme çıktısı başarı analizi.
        </p>
        <Link href="/giris" className={buttonVariants()}>
          Akademisyen Girişi
        </Link>
      </Card>
    </main>
  );
}
