import ExcelJS from "exceljs";

// Kutbay Hoca'nın mevcut şablonu (bkz. plan.md "Mevcut Excel şablonu"). Hücre yerleri sabit:
// A2 ders kodu, A4 dönem, A6 sınav türü, A8 şube; C..AA sütunları Soru 1..25;
// 5..14. satırlar Öç1..Öç10 ağırlık matrisi; 16. satır tam puanlar; 18. satırdan itibaren
// A okul no, B öğrenci adı, C..AA soru puanları.
// Okuyucu ve derse özel şablon üretici aynı yerleşimi kullanır.
const ILK_SORU_SUTUNU = 3; // C
const SORU_SAYISI = 25;
const ILK_CIKTI_SATIRI = 5;
const CIKTI_SAYISI = 10;
const TAM_PUAN_SATIRI = 16;
export const SABLON_CIKTI_SINIRI = CIKTI_SAYISI;
const ILK_OGRENCI_SATIRI = 18;

export type Soru = {
  sira: number;
  tamPuan: number;
  // Öç sıra no -> ağırlık. Sorunun ağırlıkları toplamı 1.
  agirliklar: Record<number, number>;
};

export type Ogrenci = {
  no: string;
  // Ad saklanmaya sonradan başlandı; önceki yüklemelerin kayıtlarında alan yok.
  ad?: string;
  // Sınava girmeyen öğrencinin tüm puanları boş; null olarak tutulur ve ortalamaya girmez.
  puanlar: (number | null)[] | null;
};

export type SinavExcel = {
  donem: string;
  tur: string;
  sube: string;
  sorular: Soru[];
  ogrenciler: Ogrenci[];
};

const sayi = (deger: ExcelJS.CellValue) => {
  // Formüllü hücrede değer { formula, result } olarak gelir.
  const v =
    deger && typeof deger === "object" && "result" in deger
      ? deger.result
      : deger;
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
};

const yazi = (deger: ExcelJS.CellValue) =>
  deger === null || deger === undefined ? "" : String(deger).trim();

export async function sinavExceliOku(
  dosya: ArrayBuffer,
  ders: { kod: string; ciktiSayisi: number },
): Promise<{ sinav: SinavExcel } | { hatalar: string[] }> {
  if (ders.ciktiSayisi === 0)
    return {
      hatalar: [
        "Bu dersin OBS'de tanımlı öğrenme çıktısı yok; analiz için önce OBS Bologna'da çıktılar girilmeli.",
      ],
    };

  const kitap = new ExcelJS.Workbook();
  try {
    await kitap.xlsx.load(dosya);
  } catch {
    return {
      hatalar: ["Dosya okunamadı. Şablondaki .xlsx dosyasını yükleyin."],
    };
  }
  const sayfa = kitap.worksheets[0];
  if (!sayfa) return { hatalar: ["Dosyada sayfa bulunamadı."] };

  const hucre = (satir: number, sutun: number) =>
    sayfa.getCell(satir, sutun).value;
  const adres = (satir: number, sutun: number) =>
    sayfa.getCell(satir, sutun).address;

  // Ders kodu ilk bakılan şey: başka dersin dosyası yüklendiyse diğer tüm hatalar
  // (çıktı sayısı, ağırlıklar) yanıltıcı olur. Boş bırakılmışsa kontrol edilmez.
  const dosyaDersKodu = yazi(hucre(2, 1));
  if (dosyaDersKodu && dosyaDersKodu !== ders.kod)
    return {
      hatalar: [
        `A2: Dosya ${dosyaDersKodu} kodlu dersin, bu ders ${ders.kod}. Doğru derse yüklediğinizden emin olun.`,
      ],
    };

  const hatalar: string[] = [];
  const sorular: Soru[] = [];
  for (let i = 0; i < SORU_SAYISI; i++) {
    const sutun = ILK_SORU_SUTUNU + i;
    const tamPuan = sayi(hucre(TAM_PUAN_SATIRI, sutun));
    // Tam puanı boş olan sütun kullanılmayan soru sayılır.
    if (tamPuan === null) continue;
    if (Number.isNaN(tamPuan) || tamPuan <= 0) {
      hatalar.push(
        `${adres(TAM_PUAN_SATIRI, sutun)}: Soru ${i + 1} tam puanı geçersiz.`,
      );
      continue;
    }
    const agirliklar: Record<number, number> = {};
    // Toplam, OBS'de olmayan çıktıya yazılmış ağırlıkları da içerir; o hücre zaten
    // ayrıca bildirildiği için toplam hatası ikinci kez çıkmasın.
    let toplam = 0;
    for (let c = 0; c < CIKTI_SAYISI; c++) {
      const satir = ILK_CIKTI_SATIRI + c;
      const w = sayi(hucre(satir, sutun));
      if (w === null || w === 0) continue;
      if (Number.isNaN(w) || w < 0 || w > 1) {
        hatalar.push(
          `${adres(satir, sutun)}: Öç${c + 1} ağırlığı 0 ile 1 arasında olmalı.`,
        );
        continue;
      }
      toplam += w;
      if (c + 1 > ders.ciktiSayisi) {
        hatalar.push(
          `${adres(satir, sutun)}: Soru ${i + 1} Öç${c + 1}'e bağlı ama bu dersin OBS'de ${ders.ciktiSayisi} öğrenme çıktısı var.`,
        );
        continue;
      }
      agirliklar[c + 1] = w;
    }
    // Excel'de 0,25 / 0,75 gibi değerler; kayan nokta hatası için küçük tolerans.
    if (Math.abs(toplam - 1) > 0.001)
      hatalar.push(
        `Soru ${i + 1}: öğrenme çıktısı ağırlıklarının toplamı ${toplam.toLocaleString("tr-TR")}, 1 olmalı.`,
      );
    sorular.push({ sira: i + 1, tamPuan, agirliklar });
  }
  if (sorular.length === 0)
    hatalar.push(`${TAM_PUAN_SATIRI}. satırda hiçbir sorunun tam puanı yok.`);

  const ogrenciler: Ogrenci[] = [];
  const gorulenNolar = new Set<string>();
  for (let satir = ILK_OGRENCI_SATIRI; satir <= sayfa.rowCount; satir++) {
    const no = yazi(hucre(satir, 1));
    if (!no) continue;
    if (gorulenNolar.has(no)) {
      hatalar.push(`A${satir}: ${no} numaralı öğrenci birden fazla kez var.`);
      continue;
    }
    gorulenNolar.add(no);
    const puanlar = sorular.map((soru) => {
      const sutun = ILK_SORU_SUTUNU + soru.sira - 1;
      const puan = sayi(hucre(satir, sutun));
      if (
        puan !== null &&
        (Number.isNaN(puan) || puan < 0 || puan > soru.tamPuan)
      )
        hatalar.push(
          `${adres(satir, sutun)}: puan 0 ile ${soru.tamPuan} arasında olmalı.`,
        );
      return puan;
    });
    ogrenciler.push({
      no,
      ad: yazi(hucre(satir, 2)),
      puanlar: puanlar.every((p) => p === null) ? null : puanlar,
    });
  }
  if (ogrenciler.length === 0)
    hatalar.push(
      `${ILK_OGRENCI_SATIRI}. satırdan itibaren öğrenci bulunamadı.`,
    );

  if (hatalar.length > 0) return { hatalar };
  return {
    sinav: {
      donem: yazi(hucre(4, 1)),
      tur: yazi(hucre(6, 1)),
      sube: yazi(hucre(8, 1)),
      sorular,
      ogrenciler,
    },
  };
}

// Şablonda formüllerin kapsadığı öğrenci satırı sayısı (orijinal şablonda aralıklar
// 64 ve 104'te tutarsızdı; burada hepsi aynı aralığı kullanır).
const SON_OGRENCI_SATIRI = ILK_OGRENCI_SATIRI + 199;

// Derse özel boş şablon: Kutbay Hoca'nın şablonuyla aynı yerleşim; ders kodu, program,
// öğretim elemanı ve OBS'deki öğrenme çıktıları önceden dolu.
export async function sinavSablonuOlustur(ders: {
  kod: string;
  ad: string;
  programAdi: string;
  ogretimElemani: string;
  ogrenmeCiktilari: { sira: number; aciklama: string }[];
}) {
  // Şablonda Öç için 10 satır var (5..14); fazlası tam puan satırlarının üzerine yazılırdı.
  // OBS'de 10'dan fazla çıktısı olan derste (ör. Atatürk İlkeleri, 14) ilk 10 alınır.
  const ciktilar = ders.ogrenmeCiktilari.slice(0, CIKTI_SAYISI);
  const kitap = new ExcelJS.Workbook();
  const s = kitap.addWorksheet("Sınav");
  const sonSoru = ILK_SORU_SUTUNU + SORU_SAYISI - 1; // AA
  const harf = (sutun: number) => s.getColumn(sutun).letter;
  const baslik = { bold: true };
  const dolgu = (renk: string): ExcelJS.Fill => ({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: renk },
  });
  const MOR = "FFEFEAF8";
  const GIRIS = "FFFFF8E1";

  // A sütunu: etiket / değer çiftleri.
  const bilgiler: [string, string][] = [
    ["Ders Kodu", ders.kod],
    ["Dönem", ""],
    ["Sınav Türü", ""],
    ["Şube", ""],
    ["Öğretim Elemanı", ders.ogretimElemani],
    ["Program", ders.programAdi],
  ];
  bilgiler.forEach(([etiket, deger], i) => {
    s.getCell(1 + i * 2, 1).value = etiket;
    s.getCell(1 + i * 2, 1).font = baslik;
    s.getCell(2 + i * 2, 1).value = deger;
    s.getCell(2 + i * 2, 1).fill = dolgu(GIRIS);
  });
  s.getCell("A4").note = "Örn. 2025-2026 güz";
  s.getCell("A6").dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: ['"Vize,Final,Bütünleme"'],
  };

  s.getCell("B1").value = ders.ad;
  s.getCell("B1").font = { bold: true, size: 12 };
  s.getCell("B2").value = "Doğru Cevapların Yüzdesi";
  s.getCell("B3").value = "Doğru Cevapların Ortalaması";
  s.getCell("B4").value = "Sorular";
  s.getCell(TAM_PUAN_SATIRI - 1, 2).value = "Ağırlık toplamı (1 olmalı)";
  s.getCell(TAM_PUAN_SATIRI, 2).value = "Soruların Tam Puanları";
  s.getCell(ILK_OGRENCI_SATIRI - 1, 1).value = "Okul No";
  s.getCell(ILK_OGRENCI_SATIRI - 1, 2).value = "Öğrenci Adı Soyadı";
  for (const adres of ["B2", "B3", "B4", "B15", "B16", "A17", "B17"])
    s.getCell(adres).font = baslik;

  for (let sutun = ILK_SORU_SUTUNU; sutun <= sonSoru; sutun++) {
    const h = harf(sutun);
    const no = sutun - ILK_SORU_SUTUNU + 1;
    for (const satir of [4, ILK_OGRENCI_SATIRI - 1]) {
      s.getCell(satir, sutun).value = `Soru ${no}`;
      s.getCell(satir, sutun).font = baslik;
      s.getCell(satir, sutun).fill = dolgu(MOR);
    }
    const ogrenciAraligi = `${h}${ILK_OGRENCI_SATIRI}:${h}${SON_OGRENCI_SATIRI}`;
    s.getCell(2, sutun).value = {
      formula: `IFERROR(${h}3/${h}${TAM_PUAN_SATIRI},"")`,
    };
    s.getCell(2, sutun).numFmt = "0%";
    s.getCell(3, sutun).value = {
      formula: `IFERROR(AVERAGE(${ogrenciAraligi}),"")`,
    };
    s.getCell(3, sutun).numFmt = "0.0";
    s.getCell(TAM_PUAN_SATIRI - 1, sutun).value = {
      formula: `IF(${h}${TAM_PUAN_SATIRI}="","",SUM(${h}${ILK_CIKTI_SATIRI}:${h}${ILK_CIKTI_SATIRI + CIKTI_SAYISI - 1}))`,
    };
    s.getCell(TAM_PUAN_SATIRI, sutun).fill = dolgu(GIRIS);
    for (let c = 0; c < ciktilar.length; c++)
      s.getCell(ILK_CIKTI_SATIRI + c, sutun).fill = dolgu(GIRIS);
    s.getColumn(sutun).width = 8;
  }

  // Yalnızca OBS'deki çıktı satırları etiketlenir; açıklama hücre notunda.
  ciktilar.forEach((cikti, i) => {
    const etiket = s.getCell(ILK_CIKTI_SATIRI + i, 2);
    etiket.value = `Öç${cikti.sira}`;
    etiket.font = baslik;
    etiket.note = cikti.aciklama;
  });

  // Ağırlık toplamı 1 değilse kırmızı.
  s.addConditionalFormatting({
    ref: `C${TAM_PUAN_SATIRI - 1}:${harf(sonSoru)}${TAM_PUAN_SATIRI - 1}`,
    rules: [
      {
        type: "expression",
        priority: 1,
        formulae: [
          `AND(C${TAM_PUAN_SATIRI - 1}<>"",ABS(C${TAM_PUAN_SATIRI - 1}-1)>0.001)`,
        ],
        style: { fill: dolgu("FFFFC7CE") },
      },
    ],
  });

  const notSutunu = harf(sonSoru + 1); // AB
  s.getCell(4, sonSoru + 1).value = "Ortalama";
  s.getCell(TAM_PUAN_SATIRI - 1, sonSoru + 1).value = "Sınıf Ortalaması";
  s.getCell(TAM_PUAN_SATIRI, sonSoru + 1).value = {
    formula: `IFERROR(AVERAGE(${notSutunu}${ILK_OGRENCI_SATIRI}:${notSutunu}${SON_OGRENCI_SATIRI}),"")`,
  };
  s.getCell(ILK_OGRENCI_SATIRI - 1, sonSoru + 1).value = "Öğrenci Notu";
  for (let satir = ILK_OGRENCI_SATIRI; satir <= SON_OGRENCI_SATIRI; satir++) {
    const aralik = `C${satir}:${harf(sonSoru)}${satir}`;
    s.getCell(satir, sonSoru + 1).value = {
      formula: `IF(SUM(${aralik})=0,"",SUM(${aralik}))`,
    };
  }

  s.getColumn(1).width = 18;
  s.getColumn(2).width = 26;
  s.getColumn(sonSoru + 1).width = 14;

  // İkinci sayfa yalnızca bilgi içindir; okuyucu ilk sayfaya bakar.
  const cs = kitap.addWorksheet("Öğrenme Çıktıları");
  cs.columns = [
    { header: "Öç", key: "oc", width: 8 },
    { header: "Açıklama", key: "aciklama", width: 100 },
  ];
  cs.getRow(1).font = baslik;
  for (const c of ders.ogrenmeCiktilari)
    cs.addRow({ oc: `Öç${c.sira}`, aciklama: c.aciklama });
  cs.addRow({});
  if (ders.ogrenmeCiktilari.length > CIKTI_SAYISI)
    cs.addRow({
      aciklama: `Bu dersin OBS'de ${ders.ogrenmeCiktilari.length} öğrenme çıktısı var; şablon en fazla ${CIKTI_SAYISI} çıktı alır, yalnızca Öç1–Öç${CIKTI_SAYISI} değerlendirilebilir.`,
    });
  cs.addRow({
    aciklama:
      "Sınav sayfasında her soru için Öç satırlarına ağırlık girin (ör. 0,25 ve 0,75); her sorunun ağırlık toplamı 1 olmalı.",
  });

  return kitap.xlsx.writeBuffer();
}
