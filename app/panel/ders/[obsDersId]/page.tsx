import { Icon } from "@iconify/react/offline";
import openInNew from "@iconify-icons/material-symbols/open-in-new-rounded";
import refresh from "@iconify-icons/material-symbols/refresh-rounded";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { hocaDers } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { obsDersDetayi } from "@/lib/obs";
import { dersKaldir, obsYenile } from "../../actions";

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

  const ders = await obsDersDetayi(obsDersId);

  return (
    <>
      <span className="text-sm text-muted-foreground">
        {ders.kod} · {ders.yariyil}. yarıyıl · {ders.akts} AKTS · OBS'de son
        güncelleme {ders.guncelleme}
      </span>
      <h1 className="text-3xl font-semibold text-primary">{ders.ad}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
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
        <form action={dersKaldir.bind(null, obsDersId)} className="ml-auto">
          <Button type="submit" size="lg" variant="destructive">
            Dersi Kaldır
          </Button>
        </form>
      </div>

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
