import { Icon } from "@iconify/react/offline";
import chevronRight from "@iconify-icons/material-symbols/chevron-right-rounded";
import download from "@iconify-icons/material-symbols/download-rounded";
import openInNew from "@iconify-icons/material-symbols/open-in-new-rounded";
import refresh from "@iconify-icons/material-symbols/refresh-rounded";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import OnayliSilme from "@/components/onayli-silme";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { hocaDers, sinav } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { obsDersDetayi } from "@/lib/obs";
import { SABLON_CIKTI_SINIRI } from "@/lib/sinav-excel";
import { dersKaldir, obsYenile } from "../../actions";
import SinavYukleFormu from "./sinav-yukle-formu";

export default async function DersPage({
  params,
}: PageProps<"/panel/ders/[obsDersId]">) {
  const { user } = await oturumuDogrula();
  const { obsDersId } = await params;
  // Hoca yalnızca kendi eklediği dersi görür.
  const [kayit] = await db
    .select()
    .from(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  if (!kayit) notFound();

  const [ders, sinavlar] = await Promise.all([
    obsDersDetayi(obsDersId),
    db
      .select()
      .from(sinav)
      .where(eq(sinav.hocaDersId, kayit.id))
      .orderBy(desc(sinav.yuklenme)),
  ]);

  return (
    <>
      <span className="text-sm text-muted-foreground">
        {ders.kod} · {ders.yariyil}. yarıyıl · {ders.akts} AKTS · OBS'de son
        güncelleme {ders.guncelleme}
      </span>
      <h1 className="text-3xl font-semibold text-primary">{ders.ad}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        {ders.degerlendirme.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Değerlendirme oranları OBS'de girilmemiş.
          </span>
        )}
        {ders.degerlendirme.map((d) => (
          <Badge key={d.calisma} variant="secondary">
            {d.calisma} %{d.katki}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={obsYenile.bind(null, obsDersId)}>
          <Button type="submit" size="lg">
            <Icon icon={refresh} className="size-5" />
            OBS'den Yenile
          </Button>
        </form>
        <a
          href={`https://obs.mehmetakif.edu.tr/oibs/bologna/progCourseDetails.aspx?curCourse=${obsDersId}&lang=tr`}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: "lg" })}
        >
          <Icon icon={openInNew} className="size-5" />
          OBS'de Aç
        </a>
        <div className="ml-auto">
          <OnayliSilme
            etiket="Dersi Kaldır"
            baslik="Ders kaldırılsın mı?"
            aciklama={`${ders.ad} panelinizden kaldırılacak ve bu derse yüklediğiniz ${sinavlar.length} sınav da silinecek. Bu işlem geri alınamaz.`}
            eylem={dersKaldir.bind(null, obsDersId)}
          />
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Sınavlar</h2>
      <Card className="gap-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-muted-foreground">
            1. Bu derse özel şablonu indirin; ders kodu ve OBS'deki öğrenme
            çıktıları hazır gelir. 2. Soru–çıktı ağırlıklarını ve puanları
            doldurup yükleyin. Öğrenci adları saklanmaz.
          </p>
          {/* Link değil düz <a>: route handler dosya döndürüyor, prefetch edilmemeli. */}
          <a
            href={`/panel/ders/${obsDersId}/sablon`}
            download
            className={buttonVariants({ size: "lg" })}
          >
            <Icon icon={download} className="size-5" />
            Şablonu İndir
          </a>
        </div>
        {ders.ogrenmeCiktilari.length > SABLON_CIKTI_SINIRI && (
          <p className="rounded-lg border border-bekleme/50 bg-bekleme/10 p-3 text-sm">
            Bu dersin OBS'de {ders.ogrenmeCiktilari.length} öğrenme çıktısı var;
            sınav şablonu en fazla {SABLON_CIKTI_SINIRI} çıktı alır. Yalnızca
            Öç1–Öç{SABLON_CIKTI_SINIRI} değerlendirilebilir.
          </p>
        )}
        <SinavYukleFormu obsDersId={obsDersId} />
        {sinavlar.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {sinavlar.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/panel/ders/${obsDersId}/sinav/${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-accent focus-visible:bg-accent"
                >
                  <span className="font-medium">{s.tur}</span>
                  <span className="text-sm text-muted-foreground">
                    {[s.donem, s.sube && `${s.sube} şubesi`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {s.ogrenciler.filter((o) => o.puanlar).length} öğrenci ·{" "}
                    {s.yuklenme.toLocaleDateString("tr-TR")}
                  </span>
                  <Icon icon={chevronRight} className="size-5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Öğrenme Çıktıları</h2>
      <Card className="gap-0 py-0">
        <ol className="divide-y">
          {ders.ogrenmeCiktilari.map((c) => (
            <li key={c.sira} className="flex gap-3 px-4 py-3">
              <Badge variant="secondary" className="shrink-0">
                Öç{c.sira}
              </Badge>
              <span>{c.aciklama}</span>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
