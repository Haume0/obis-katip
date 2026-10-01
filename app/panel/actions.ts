"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { hocaDers, sinav } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { dersTag, obsDersDetayi, obsProgramDersleri } from "@/lib/obs";
import { sinavExceliOku } from "@/lib/sinav-excel";

export async function dersEkle(obsBirimId: string, obsDersId: string) {
  const { user } = await oturumuDogrula();
  // İstemciden gelen id'ye güvenilmez; ders gerçekten o OBS programında olmalı.
  const { dersler } = await obsProgramDersleri(obsBirimId);
  if (!dersler.some((d) => d.id === obsDersId))
    throw new Error("Ders bu programda bulunamadı.");

  await db
    .insert(hocaDers)
    .values({ userId: user.id, obsDersId, obsBirimId })
    .onConflictDoNothing();
  redirect(`/panel/ders/${obsDersId}`);
}

// Dersin tüm sınavları da silinir (hoca_ders -> sinav cascade); arayüz onay sorar.
export async function dersKaldir(obsDersId: string) {
  const { user } = await oturumuDogrula();
  await db
    .delete(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  redirect("/panel");
}

export async function obsYenile(obsDersId: string) {
  await oturumuDogrula();
  updateTag(dersTag(obsDersId));
}

// Server action gövde sınırı 1MB; şablon dosyası ~30KB.
const EN_BUYUK_DOSYA = 900 * 1024;

export async function sinavYukle(
  obsDersId: string,
  _onceki: { hatalar: string[] },
  formData: FormData,
) {
  const { user } = await oturumuDogrula();
  const [kayit] = await db
    .select()
    .from(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  if (!kayit) notFound();

  const dosya = formData.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0)
    return { hatalar: ["Bir Excel dosyası seçin."] };
  if (!dosya.name.toLowerCase().endsWith(".xlsx"))
    return { hatalar: ["Yalnızca .xlsx dosyası yüklenebilir."] };
  if (dosya.size > EN_BUYUK_DOSYA)
    return { hatalar: ["Dosya çok büyük (en fazla 900 KB)."] };

  const ders = await obsDersDetayi(obsDersId);
  const sonuc = await sinavExceliOku(await dosya.arrayBuffer(), {
    kod: ders.kod,
    ciktiSayisi: ders.ogrenmeCiktilari.length,
  });
  if ("hatalar" in sonuc) return { hatalar: sonuc.hatalar };

  const [yeni] = await db
    .insert(sinav)
    .values({
      hocaDersId: kayit.id,
      tur: sonuc.sinav.tur || "Sınav",
      donem: sonuc.sinav.donem,
      sube: sonuc.sinav.sube,
      sorular: sonuc.sinav.sorular,
      ogrenciler: sonuc.sinav.ogrenciler,
    })
    .returning({ id: sinav.id });
  redirect(`/panel/ders/${obsDersId}/sinav/${yeni.id}`);
}

export async function sinavSil(obsDersId: string, sinavId: number) {
  const { user } = await oturumuDogrula();
  // Sınav yalnızca hocanın kendi dersine aitse silinir.
  const [kayit] = await db
    .select({ id: hocaDers.id })
    .from(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  if (!kayit) notFound();
  await db
    .delete(sinav)
    .where(and(eq(sinav.id, sinavId), eq(sinav.hocaDersId, kayit.id)));
  redirect(`/panel/ders/${obsDersId}`);
}
