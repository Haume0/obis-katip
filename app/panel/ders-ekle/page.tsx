import { Icon } from "@iconify/react/offline";
import openInNew from "@iconify-icons/material-symbols/open-in-new-rounded";
import { and, eq } from "drizzle-orm";
import Form from "next/form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { hocaDers } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { birimIdBul, obsProgramDersleri } from "@/lib/obs";
import { dersEkle } from "../actions";

const OBS_PROGRAM_LISTESI =
  "https://obs.mehmetakif.edu.tr/oibs/bologna/unitSelection.aspx";

export default async function DersEklePage({
  searchParams,
}: PageProps<"/panel/ders-ekle">) {
  const { user } = await oturumuDogrula();
  const { link } = await searchParams;
  const birimId = typeof link === "string" ? birimIdBul(link) : null;
  const program = birimId ? await obsProgramDersleri(birimId) : null;
  const ekliDersler = birimId
    ? new Set(
        (
          await db
            .select({ id: hocaDers.obsDersId })
            .from(hocaDers)
            .where(
              and(
                eq(hocaDers.userId, user.id),
                eq(hocaDers.obsBirimId, birimId),
              ),
            )
        ).map((d) => d.id),
      )
    : new Set<string>();
  const yariyillar = Map.groupBy(program?.dersler ?? [], (d) => d.yariyil);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-primary">Ders Ekle</h1>
          <p className="text-muted-foreground">
            OBS Bologna'da programınıza tıklayın, adres çubuğundaki linki
            kopyalayıp aşağıya yapıştırın, ardından dersinizi seçin. Lisans
            programları için{" "}
            <a
              href={`${OBS_PROGRAM_LISTESI}?type=lis&lang=tr`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-prime underline hover:text-primary"
            >
              buraya
            </a>{" "}
            bakın.
          </p>
        </div>
        {/* Program listesi sayfası; programa tıklanınca açılan adres (index.aspx?…curSunit=…)
            bu formun beklediği link. Bologna ana sayfası program listesini göstermiyor. */}
        <a
          href={`${OBS_PROGRAM_LISTESI}?type=myo&lang=tr`}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({
            size: "lg",
            className: "self-start sm:self-auto",
          })}
        >
          <Icon icon={openInNew} className="size-5" />
          OBS'de Programını Bul
        </a>
      </div>

      <Form action="/panel/ders-ekle" className="mt-6 flex flex-col gap-2">
        <Label htmlFor="link">OBS program linki</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* key: form gönderilince link değişir; Base UI kontrolsüz input'un defaultValue'su
              sonradan değişirse uyarı veriyor, input yeniden oluşturulur. */}
          <Input
            key={typeof link === "string" ? link : ""}
            id="link"
            name="link"
            type="url"
            required
            defaultValue={typeof link === "string" ? link : ""}
            placeholder="https://obs.mehmetakif.edu.tr/oibs/bologna/index.aspx?...&curSunit=..."
          />
          <Button type="submit">Dersleri Getir</Button>
        </div>
        {link && !birimId && (
          <p role="alert" className="text-sm text-destructive">
            Bu bir OBS Bologna program linki değil. Link obs.mehmetakif.edu.tr
            adresinde olmalı ve "curSunit" içermeli.
          </p>
        )}
      </Form>

      {program && birimId && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">{program.programAdi}</h2>
          {[...yariyillar].map(([yariyil, dersler]) => (
            <div key={yariyil} className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {yariyil}. Yarıyıl
              </h3>
              <Card className="gap-0 py-0">
                <ul className="divide-y">
                  {dersler.map((ders) => (
                    <li
                      key={ders.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
                    >
                      <span className="w-14 text-xs text-muted-foreground">
                        {ders.kod}
                      </span>
                      <span className="min-w-0 flex-1 font-medium">
                        {ders.ad}
                      </span>
                      <Badge variant="outline">{ders.tur}</Badge>
                      <span className="w-14 text-xs text-muted-foreground">
                        {ders.akts} AKTS
                      </span>
                      {ekliDersler.has(ders.id) ? (
                        <Badge variant="secondary">Eklendi</Badge>
                      ) : (
                        <form action={dersEkle.bind(null, birimId, ders.id)}>
                          <Button type="submit" size="lg">
                            Ekle
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
