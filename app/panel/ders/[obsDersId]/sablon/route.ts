import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { hocaDers } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { obsDersDetayi, obsProgramDersleri } from "@/lib/obs";
import { sinavSablonuOlustur } from "@/lib/sinav-excel";

export async function GET(
  _istek: Request,
  ctx: RouteContext<"/panel/ders/[obsDersId]/sablon">,
) {
  const { user } = await oturumuDogrula();
  const { obsDersId } = await ctx.params;
  const [kayit] = await db
    .select()
    .from(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  if (!kayit) notFound();

  const [ders, program] = await Promise.all([
    obsDersDetayi(obsDersId),
    obsProgramDersleri(kayit.obsBirimId),
  ]);
  const dosya = await sinavSablonuOlustur({
    kod: ders.kod,
    ad: ders.ad,
    programAdi: program.programAdi,
    ogretimElemani: user.name,
    ogrenmeCiktilari: ders.ogrenmeCiktilari,
  });

  const ad = `${ders.kod} ${ders.ad} sınav şablonu.xlsx`;
  return new Response(dosya, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Türkçe karakterli dosya adı için RFC 5987; eski istemciler ASCII adı alır.
      "Content-Disposition": `attachment; filename="${ders.kod}-sinav-sablonu.xlsx"; filename*=UTF-8''${encodeURIComponent(ad)}`,
    },
  });
}
