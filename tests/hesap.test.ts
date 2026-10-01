import { describe, expect, test } from "bun:test";
import ExcelJS from "exceljs";
import { ciktiBasarilari } from "@/lib/hesap";
import { sinavExceliOku, sinavSablonuOlustur } from "@/lib/sinav-excel";

// Kutbay Hoca'nın örnek dosyasının anonim kopyası (puanlar ve ağırlıklar aynı).
const FIXTURE = `${import.meta.dir}/fixtures/ornek-sinav.xlsx`;
const fixture = () => Bun.file(FIXTURE).arrayBuffer();
// Fixture A2'deki ders kodu.
const DERS = { kod: "25627", ciktiSayisi: 5 };

async function degistir(hucreler: Record<string, ExcelJS.CellValue>) {
  const kitap = new ExcelJS.Workbook();
  await kitap.xlsx.load(await fixture());
  for (const [adres, deger] of Object.entries(hucreler))
    kitap.worksheets[0].getCell(adres).value = deger;
  return (await kitap.xlsx.writeBuffer()) as ArrayBuffer;
}

describe("sinavExceliOku", () => {
  test("örnek şablonu okur", async () => {
    const sonuc = await sinavExceliOku(await fixture(), DERS);
    if (!("sinav" in sonuc)) throw new Error(sonuc.hatalar.join("\n"));
    const { sinav } = sonuc;
    expect(sinav.tur).toBe("Final");
    expect(sinav.donem).toBe("2025-2026 bahar");
    expect(sinav.sorular).toHaveLength(10);
    expect(sinav.sorular[0]).toEqual({
      sira: 1,
      tamPuan: 5,
      agirliklar: { 1: 0.25, 4: 0.75 },
    });
    expect(sinav.ogrenciler).toHaveLength(47);
    // İkinci öğrenci sınava girmemiş; tüm puanları boş.
    expect(sinav.ogrenciler[1].puanlar).toBeNull();
  });

  test("ağırlık toplamı 1 olmayan soruyu bildirir", async () => {
    const sonuc = await sinavExceliOku(await degistir({ C5: 0.5 }), DERS);
    expect(sonuc).toEqual({
      hatalar: [
        "Soru 1: öğrenme çıktısı ağırlıklarının toplamı 1,25, 1 olmalı.",
      ],
    });
  });

  test("OBS'de olmayan öğrenme çıktısını bildirir", async () => {
    const sonuc = await sinavExceliOku(await fixture(), {
      ...DERS,
      ciktiSayisi: 4,
    });
    expect("hatalar" in sonuc && sonuc.hatalar[0]).toContain(
      "Öç5'e bağlı ama bu dersin OBS'de 4 öğrenme çıktısı var",
    );
  });

  test("tam puanı aşan puanı ve tekrar eden öğrenciyi bildirir", async () => {
    const sonuc = await sinavExceliOku(
      await degistir({ C18: 9, A20: "9000000001" }),
      DERS,
    );
    expect(sonuc).toEqual({
      hatalar: [
        "C18: puan 0 ile 5 arasında olmalı.",
        "A20: 9000000001 numaralı öğrenci birden fazla kez var.",
      ],
    });
  });

  test("başka dersin dosyasında yalnızca ders kodu hatası verir", async () => {
    const sonuc = await sinavExceliOku(await fixture(), {
      kod: "25532",
      ciktiSayisi: 5,
    });
    expect(sonuc).toEqual({
      hatalar: [
        "A2: Dosya 25627 kodlu dersin, bu ders 25532. Doğru derse yüklediğinizden emin olun.",
      ],
    });
  });

  test("OBS'de öğrenme çıktısı olmayan derste tek hata verir", async () => {
    const sonuc = await sinavExceliOku(await fixture(), {
      ...DERS,
      ciktiSayisi: 0,
    });
    expect("hatalar" in sonuc && sonuc.hatalar).toHaveLength(1);
  });

  test("xlsx olmayan dosyayı reddeder", async () => {
    const sonuc = await sinavExceliOku(
      new TextEncoder().encode("merhaba").buffer,
      DERS,
    );
    expect(sonuc).toEqual({
      hatalar: ["Dosya okunamadı. Şablondaki .xlsx dosyasını yükleyin."],
    });
  });
});

describe("ciktiBasarilari", () => {
  test("örnek sınavda sınıfın çıktı başarıları", async () => {
    const sonuc = await sinavExceliOku(await fixture(), DERS);
    if (!("sinav" in sonuc)) throw new Error("okunamadı");
    const b = ciktiBasarilari(sonuc.sinav.sorular, sonuc.sinav.ogrenciler);

    expect(b.girenSayisi).toBe(46);
    // Excel'in kendi hesapladığı sınıf ortalaması (AB16) ile aynı.
    expect(b.toplamPuanOrtalamasi).toBeCloseTo(60.9348, 3);
    expect(b.ciktilar).toEqual([1, 2, 3, 4, 5]);
    expect(b.sinif[1]).toBeCloseTo(51.3, 1);
    expect(b.sinif[2]).toBeCloseTo(83.4, 1);
    expect(b.sinif[3]).toBeCloseTo(43.8, 1);
    expect(b.sinif[4]).toBeCloseTo(68.1, 1);
    expect(b.sinif[5]).toBeCloseTo(56.2, 1);
    // İlk öğrenci: Öç1 = (1×0,25 + 2×0,25 + 2×0,5) / (5×0,25 + 10×0,25 + 20×0,5)
    expect(b.ogrenciler[0].ciktilar?.[1]).toBeCloseTo((1.75 / 13.75) * 100, 6);
    expect(b.ogrenciler[1].ciktilar).toBeNull();
  });
});

describe("sinavSablonuOlustur", () => {
  test("üretilen şablon doldurulunca okunur", async () => {
    const sablon = await sinavSablonuOlustur({
      kod: "25110",
      ad: "Web Tasarımı ve Kodlama",
      programAdi: "Web Tasarımı ve Kodlama",
      ogretimElemani: "Öğr.Gör. Örnek",
      ogrenmeCiktilari: [
        { sira: 1, aciklama: "CSS" },
        { sira: 2, aciklama: "Kutu modeli" },
      ],
    });
    const kitap = new ExcelJS.Workbook();
    await kitap.xlsx.load(sablon as ArrayBuffer);
    const s = kitap.worksheets[0];
    expect(s.getCell("A2").value).toBe("25110");
    expect(s.getCell("B6").value).toBe("Öç2");
    // Hocanın dolduracağı alanlar
    Object.entries({
      A4: "2025-2026 güz",
      A6: "Vize",
      C16: 40,
      D16: 60,
      C5: 1,
      D5: 0.5,
      D6: 0.5,
      A18: "1001",
      B18: "Ad Soyad",
      C18: 30,
      D18: 60,
      A19: "1002",
    }).forEach(([adres, deger]) => {
      s.getCell(adres).value = deger;
    });
    const sonuc = await sinavExceliOku(
      (await kitap.xlsx.writeBuffer()) as ArrayBuffer,
      { kod: "25110", ciktiSayisi: 2 },
    );
    if (!("sinav" in sonuc)) throw new Error(sonuc.hatalar.join("\n"));
    expect(sonuc.sinav.tur).toBe("Vize");
    expect(sonuc.sinav.sorular).toEqual([
      { sira: 1, tamPuan: 40, agirliklar: { 1: 1 } },
      { sira: 2, tamPuan: 60, agirliklar: { 1: 0.5, 2: 0.5 } },
    ]);
    expect(sonuc.sinav.ogrenciler).toEqual([
      { no: "1001", puanlar: [30, 60] },
      { no: "1002", puanlar: null },
    ]);
    const b = ciktiBasarilari(sonuc.sinav.sorular, sonuc.sinav.ogrenciler);
    // Öç1: (30×1 + 60×0,5) / (40×1 + 60×0,5) = 60/70
    expect(b.sinif[1]).toBeCloseTo((60 / 70) * 100, 6);
    expect(b.sinif[2]).toBe(100);
  });

  test("10'dan fazla çıktıda yalnızca ilk 10'u yazar, tam puan satırını bozmaz", async () => {
    const sablon = await sinavSablonuOlustur({
      kod: "25160",
      ad: "Atatürk İlkeleri",
      programAdi: "Program",
      ogretimElemani: "Örnek",
      ogrenmeCiktilari: Array.from({ length: 14 }, (_, i) => ({
        sira: i + 1,
        aciklama: `Çıktı ${i + 1}`,
      })),
    });
    const kitap = new ExcelJS.Workbook();
    await kitap.xlsx.load(sablon as ArrayBuffer);
    const s = kitap.worksheets[0];
    expect(s.getCell("B14").value).toBe("Öç10");
    expect(s.getCell("B15").value).toBe("Ağırlık toplamı (1 olmalı)");
    expect(s.getCell("B16").value).toBe("Soruların Tam Puanları");
  });
});
