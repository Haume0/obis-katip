import type { Ogrenci, Soru } from "./sinav-excel";

// Bu yüzdenin altındaki öğrenme çıktısı "karşılanmadı" sayılır. Kemal Hoca'yla
// netleşene kadar %50 (bkz. plan.md "Kemal Hoca'ya sorulacaklar").
export const KARSILANMA_ESIGI = 50;

// Bir öğrencinin bir öğrenme çıktısındaki başarısı:
//   Σ(sorudan aldığı puan × sorunun o çıktıdaki ağırlığı) / Σ(tam puan × ağırlık) × 100
// Sınıf başarısı, sınava giren öğrencilerin bu yüzdelerinin ortalamasıdır.
// Sınava giren öğrencinin boş bıraktığı soru 0 puan sayılır.
export function ciktiBasarilari(sorular: Soru[], ogrenciler: Ogrenci[]) {
  const ciktilar = [
    ...new Set(sorular.flatMap((s) => Object.keys(s.agirliklar).map(Number))),
  ].sort((a, b) => a - b);

  const payda = new Map(
    ciktilar.map((c) => [
      c,
      sorular.reduce((t, s) => t + s.tamPuan * (s.agirliklar[c] ?? 0), 0),
    ]),
  );

  const ogrenciSonuclari = ogrenciler.map(({ no, puanlar }) => {
    if (!puanlar) return { no, toplam: null, ciktilar: null };
    return {
      no,
      toplam: puanlar.reduce<number>((t, p) => t + (p ?? 0), 0),
      ciktilar: Object.fromEntries(
        ciktilar.map((c) => {
          const pay = sorular.reduce(
            (t, s, i) => t + (puanlar[i] ?? 0) * (s.agirliklar[c] ?? 0),
            0,
          );
          return [c, (pay / (payda.get(c) ?? 1)) * 100];
        }),
      ) as Record<number, number>,
    };
  });

  const girenler = ogrenciSonuclari.flatMap((o) => (o.ciktilar ? [o] : []));
  const sinif = Object.fromEntries(
    ciktilar.map((c) => [
      c,
      girenler.reduce((t, o) => t + o.ciktilar[c], 0) / (girenler.length || 1),
    ]),
  ) as Record<number, number>;

  return {
    ciktilar,
    sinif,
    ogrenciler: ogrenciSonuclari,
    girenSayisi: girenler.length,
    toplamPuanOrtalamasi:
      girenler.reduce((t, o) => t + o.toplam, 0) / (girenler.length || 1),
  };
}
