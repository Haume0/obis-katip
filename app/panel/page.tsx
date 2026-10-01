import { Icon } from "@iconify/react/offline";
import addRounded from "@iconify-icons/material-symbols/add-rounded";
import menuBook from "@iconify-icons/material-symbols/menu-book-rounded";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { hocaDers } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { obsDersDetayi } from "@/lib/obs";

export default async function PanelPage() {
  const { user } = await oturumuDogrula();
  const kayitlar = await db
    .select()
    .from(hocaDers)
    .where(eq(hocaDers.userId, user.id))
    .orderBy(hocaDers.eklenme);
  // OBS'ye ulaşılamayan ders tüm sayfayı düşürmesin; kartında hata gösterilir.
  const dersler = await Promise.allSettled(
    kayitlar.map((k) => obsDersDetayi(k.obsDersId)),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Dersler</h1>
          <p>OBS'den eklediğiniz dersler ve sınav analizleri.</p>
          <p className="text-muted-foreground">
            Bugün, {new Date().toLocaleDateString("tr-TR")}
          </p>
        </div>
        <Link href="/panel/ders-ekle" className={buttonVariants()}>
          <Icon icon={addRounded} className="size-5" />
          Ders Ekle
        </Link>
      </div>

      {kayitlar.length === 0 ? (
        <div className="mt-8 flex flex-col items-center p-8 text-center">
          <Icon
            icon={menuBook}
            className="mb-3 text-6xl text-muted-foreground/60"
          />
          <h2 className="text-lg font-medium">Henüz ders yok</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            "Ders Ekle" ile OBS program linkinizden dersinizi seçin.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kayitlar.map((kayit, i) => {
            const sonuc = dersler[i];
            return (
              <li key={kayit.id}>
                <Link
                  href={`/panel/ders/${kayit.obsDersId}`}
                  className="block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Card className="h-full gap-2 p-5 duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/15">
                    {sonuc.status === "fulfilled" ? (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {sonuc.value.kod} · {sonuc.value.yariyil}. yarıyıl ·{" "}
                          {sonuc.value.akts} AKTS
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {sonuc.value.ad}
                        </span>
                        <Badge variant="secondary">
                          {sonuc.value.ogrenmeCiktilari.length} öğrenme çıktısı
                        </Badge>
                      </>
                    ) : (
                      <span className="text-sm text-destructive">
                        OBS'ye ulaşılamadı (ders {kayit.obsDersId}).
                      </span>
                    )}
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
