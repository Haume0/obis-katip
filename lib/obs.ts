import { type HTMLElement, parse } from "node-html-parser";

// OBS Bologna sayfaları kamuya açık; veri veritabanına aktarılmaz, istek anında çekilip
// Next fetch cache'inde tutulur. Hocalar Bologna'yı nadiren güncellediği için 1 gün yeterli;
// gerekirse "OBS'den yenile" ilgili tag'i temizler.
const OBS = "https://obs.mehmetakif.edu.tr/oibs/bologna";
const BIR_GUN = 60 * 60 * 24;

export const birimTag = (birimId: string) => `obs-birim-${birimId}`;
export const dersTag = (dersId: string) => `obs-ders-${dersId}`;

async function obsSayfasi(yol: string, tag: string) {
  const yanit = await fetch(`${OBS}/${yol}`, {
    next: { revalidate: BIR_GUN, tags: [tag] },
  });
  if (!yanit.ok) throw new Error(`OBS yanıt vermedi (${yanit.status}): ${yol}`);
  return parse(await yanit.text());
}

const metin = (el: HTMLElement | null | undefined) =>
  el?.textContent.replace(/\s+/g, " ").trim() ?? "";

// Hocanın yapıştırdığı program linkinden birim (program) id'si. Sadece OBS adresi kabul
// edilir; sunucu kullanıcı verdiği rastgele adreslere istek atmasın.
export function birimIdBul(link: string) {
  try {
    const url = new URL(link.trim());
    const birimId = url.searchParams.get("curSunit");
    if (url.hostname !== "obs.mehmetakif.edu.tr" || !birimId?.match(/^\d+$/))
      return null;
    return birimId;
  } catch {
    return null;
  }
}

export type ObsDersOzeti = {
  id: string;
  kod: string;
  ad: string;
  yariyil: number;
  tur: string;
  akts: string;
};

export async function obsProgramDersleri(birimId: string) {
  const sayfa = await obsSayfasi(
    `progCourses.aspx?lang=tr&curSunit=${birimId}`,
    birimTag(birimId),
  );
  // "Fakülte / Program - Dersler" biçiminde; sondaki " - Dersler" atılır.
  const programAdi = metin(sayfa.querySelector("#lblProgInfoDers")).replace(
    / - Dersler$/,
    "",
  );
  const dersler: ObsDersOzeti[] = [];
  let yariyil = 0;
  for (const satir of sayfa.querySelectorAll("tr")) {
    const yariyilBasligi = metin(satir).match(/^(\d+)\.Yarıyıl Ders Planı/);
    if (yariyilBasligi) {
      yariyil = Number(yariyilBasligi[1]);
      continue;
    }
    // Seçmeli grup satırlarında ("SEÇ", "Seç-3") detay linki yok; sadece gerçek dersler alınır.
    const id = satir.innerHTML.match(/prolizOpenCourseDetails\((\d+)\)/)?.[1];
    if (!id) continue;
    const alan = (ad: string) => metin(satir.querySelector(`[id*="_${ad}_"]`));
    dersler.push({
      id,
      // Gerçek derslerde kod link (btnDersKod), seçmeli grup satırlarında label.
      kod: alan("btnDersKod"),
      ad: alan("lblDersAd"),
      yariyil,
      tur: alan("Label5"),
      akts: alan("lblAKTS"),
    });
  }
  return { programAdi, dersler };
}

export async function obsDersDetayi(dersId: string) {
  const sayfa = await obsSayfasi(
    `progCourseDetails.aspx?curCourse=${dersId}&lang=tr`,
    dersTag(dersId),
  );
  // grdDers: başlık satırı + tek veri satırı (yarıyıl, kod, ad, T+U+L, kredi, AKTS, güncelleme).
  const [yariyil, kod, ad, , , akts, guncelleme] = sayfa
    .querySelectorAll("#grdDers tr")[1]
    .querySelectorAll("td")
    .map(metin);

  // Bazı derslerde çıktılar tek tabloda (#grdOgrenmeCiktilari), bazılarında Bilgi/Beceri/
  // Yetkinlik başlıklı ayrı tablolarda (#grdOgrenmeCiktilari1, 2, …). Sıra no OBS'den gelir.
  const ogrenmeCiktilari = sayfa
    .querySelectorAll('table[id^="grdOgrenmeCiktilari"] tr')
    .map((satir) => satir.querySelectorAll("td").map(metin))
    .filter((hucreler) => hucreler.length >= 2 && /^\d+$/.test(hucreler[0]))
    .map(([sira, aciklama]) => ({ sira: Number(sira), aciklama }))
    .sort((a, b) => a.sira - b.sira);

  const degerlendirme = sayfa
    .querySelectorAll('[id^="grd_degerlendirme_lblCalismaTip_"]')
    .map((el) => {
      const i = el.id.split("_").at(-1);
      return {
        calisma: metin(el),
        sayi: Number(
          metin(sayfa.querySelector(`#grd_degerlendirme_lblDS_Sayi_${i}`)),
        ),
        katki: Number(
          metin(sayfa.querySelector(`#grd_degerlendirme_lblDS_Katki_${i}`)),
        ),
      };
    });

  return {
    id: dersId,
    yariyil,
    kod,
    ad,
    akts,
    guncelleme,
    ogrenmeCiktilari,
    degerlendirme,
  };
}
