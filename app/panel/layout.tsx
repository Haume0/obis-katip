import Link from "next/link";
import { oturumuDogrula } from "@/lib/auth";
import CikisButonu from "./cikis-butonu";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const { user } = await oturumuDogrula();
  const basHarfler = user.name
    .split(" ")
    .map((parca) => parca[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");

  // Tek bölüm (dersler) olduğu için staj-app'teki yan menü yerine ince bir üst çubuk;
  // gradyan yalnızca üstteki şeritte vurgu olarak kaldı.
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/80 backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-custom-purple to-custom-blue" />
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link
            href="/panel"
            className="rounded-md text-xl font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            OBİS Katip
          </Link>
          <span className="ml-auto hidden min-w-0 text-right sm:block">
            <span className="block truncate text-sm font-semibold">
              {user.name}
            </span>
            <span className="block truncate text-xs text-black/60">
              {user.email}
            </span>
          </span>
          <span
            title={user.name}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-custom-purple to-custom-blue font-medium text-white sm:ml-0"
          >
            {basHarfler}
          </span>
          <CikisButonu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4 lg:py-10">{children}</main>
    </>
  );
}
