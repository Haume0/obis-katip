import { Icon } from "@iconify/react/offline";
import arrowBack from "@iconify-icons/material-symbols/arrow-back-rounded";
import cancel from "@iconify-icons/material-symbols/cancel-rounded";
import checkCircle from "@iconify-icons/material-symbols/check-circle-rounded";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import OnayliSilme from "@/components/onayli-silme";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { hocaDers, sinav } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { ciktiBasarilari, KARSILANMA_ESIGI } from "@/lib/hesap";
import { obsDersDetayi } from "@/lib/obs";
import { sinavSil } from "../../../../actions";

const yuzde = (n: number) =>
  `%${n.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

export default async function SinavRaporuPage({
  params,
}: PageProps<"/panel/ders/[obsDersId]/sinav/[sinavId]">) {
  const { user } = await oturumuDogrula();
  const { obsDersId, sinavId } = await params;
  // Sınav yalnızca hocanın kendi dersine aitse gösterilir.
  const [kayit] = await db
    .select({ sinav })
    .from(sinav)
    .innerJoin(hocaDers, eq(sinav.hocaDersId, hocaDers.id))
    .where(
      and(
        eq(sinav.id, Number(sinavId)),
        eq(hocaDers.userId, user.id),
        eq(hocaDers.obsDersId, obsDersId),
      ),
    );
  if (!kayit) notFound();

  const s = kayit.sinav;
  const ders = await obsDersDetayi(obsDersId);
  const b = ciktiBasarilari(s.sorular, s.ogrenciler);
  const tamPuan = s.sorular.reduce((t, soru) => t + soru.tamPuan, 0);
  const karsilanan = b.ciktilar.filter((c) => b.sinif[c] >= KARSILANMA_ESIGI);

  return (
    <>
      <Link
        href={`/panel/ders/${obsDersId}`}
        className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon icon={arrowBack} className="size-4" />
        {ders.kod} {ders.ad}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary">
            {s.tur} Analizi
          </h1>
          <p className="text-muted-foreground">
            {[s.donem, s.sube && `${s.sube} şubesi`, `${s.sorular.length} soru`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <OnayliSilme
          etiket="Sınavı Sil"
          baslik="Sınav silinsin mi?"
          aciklama="Bu sınavın puanları ve analizi silinecek. Bu işlem geri alınamaz."
          eylem={sinavSil.bind(null, obsDersId, s.id)}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Sınava giren", `${b.girenSayisi} / ${s.ogrenciler.length}`],
          [
            "Sınıf ortalaması",
            `${b.toplamPuanOrtalamasi.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} / ${tamPuan}`,
          ],
          ["Karşılanan çıktı", `${karsilanan.length} / ${b.ciktilar.length}`],
        ].map(([etiket, deger]) => (
          <Card key={etiket} className="gap-1 p-5">
            <span className="text-sm text-muted-foreground">{etiket}</span>
            <span className="text-3xl font-semibold tabular-nums">{deger}</span>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Öğrenme çıktısı başarısı</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Sınava giren öğrencilerin ortalaması. %{KARSILANMA_ESIGI} altındaki
        çıktılar karşılanmadı sayılır.
      </p>
      <Card className="gap-0 py-2">
        <ul>
          {ders.ogrenmeCiktilari.map((cikti) => {
            const deger = b.sinif[cikti.sira];
            const olculdu = deger !== undefined;
            const tamam = olculdu && deger >= KARSILANMA_ESIGI;
            return (
              <li
                key={cikti.sira}
                title={`Öç${cikti.sira}: ${cikti.aciklama}`}
                className="grid grid-cols-[3rem_1fr] items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-accent/60 md:grid-cols-[3rem_minmax(0,2fr)_minmax(0,3fr)_9rem]"
              >
                <span className="font-semibold text-primary">
                  Öç{cikti.sira}
                </span>
                <span className="line-clamp-2 text-sm">{cikti.aciklama}</span>
                {olculdu ? (
                  <>
                    {/* Eşik çizgisi %50'de; çubuk taban çizgisinden başlar. */}
                    <div className="relative col-start-2 h-3 rounded-full bg-muted md:col-start-auto">
                      <div
                        className={`h-full rounded-full ${tamam ? "bg-karsilandi" : "bg-karsilanmadi"}`}
                        style={{ width: `${Math.min(deger, 100)}%` }}
                      />
                      <div
                        className="absolute -inset-y-1 w-0.5 bg-foreground/50"
                        style={{ left: `${KARSILANMA_ESIGI}%` }}
                      />
                    </div>
                    <span className="col-start-2 flex items-center gap-1.5 text-sm md:col-start-auto">
                      <Icon
                        icon={tamam ? checkCircle : cancel}
                        className={`size-5 shrink-0 ${tamam ? "text-karsilandi" : "text-karsilanmadi"}`}
                      />
                      <span className="font-semibold tabular-nums">
                        {yuzde(deger)}
                      </span>
                      <span className="text-muted-foreground">
                        {tamam ? "karşılandı" : "karşılanmadı"}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="col-start-2 text-sm text-muted-foreground md:col-span-2 md:col-start-auto">
                    Bu sınavda ölçülmedi
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t px-5 pt-3 pb-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-karsilandi" /> Karşılandı
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-karsilanmadi" /> Karşılanmadı
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-foreground/50" /> %{KARSILANMA_ESIGI}{" "}
            eşik
          </span>
        </div>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">Öğrenci bazında</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Her öğrencinin çıktı başarısı. Kırmızı zeminli hücreler %
        {KARSILANMA_ESIGI} altında.
      </p>
      <Card className="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Okul No</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead className="text-right">Puan</TableHead>
              {b.ciktilar.map((c) => (
                <TableHead key={c} className="text-right">
                  Öç{c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {b.ogrenciler.map((o) => (
              <TableRow key={o.no}>
                <TableCell className="px-4 tabular-nums">{o.no}</TableCell>
                <TableCell>{o.ad}</TableCell>
                {o.ciktilar ? (
                  <>
                    <TableCell className="text-right tabular-nums">
                      {o.toplam}
                    </TableCell>
                    {b.ciktilar.map((c) => {
                      const deger = o.ciktilar[c];
                      const altinda = deger < KARSILANMA_ESIGI;
                      return (
                        <TableCell
                          key={c}
                          className={`text-right tabular-nums ${altinda ? "bg-karsilanmadi/10" : ""}`}
                        >
                          {yuzde(deger)}
                          {altinda && (
                            <span className="sr-only"> (karşılanmadı)</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </>
                ) : (
                  <TableCell
                    colSpan={b.ciktilar.length + 1}
                    className="text-muted-foreground"
                  >
                    Sınava girmedi
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-6">
        <Link
          href={`/panel/ders/${obsDersId}`}
          className={buttonVariants({ size: "lg" })}
        >
          <Icon icon={arrowBack} className="size-5" />
          Derse dön
        </Link>
      </div>
    </>
  );
}
