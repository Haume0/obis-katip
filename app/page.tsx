import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center p-4">
      <section className="flex w-full max-w-[30rem] flex-col rounded-2xl border border-primary/10 bg-white p-10 shadow-2xl shadow-primary/20">
        <span className="text-center text-lg font-light text-black/70">
          Hoş geldiniz,
        </span>
        <h1 className="mt-1 mb-2 text-center text-3xl font-bold text-primary">
          OBİS Katip
        </h1>
        <p className="mb-6 text-center text-black/70">
          Sınav sonuçlarından öğrenme çıktısı başarı analizi.
        </p>
        <Link href="/giris" className="MainButton">
          Akademisyen Girişi
        </Link>
      </section>
    </main>
  );
}
