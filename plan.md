OBİS Entegrasyonlu Web Projesi

Proje Detayları:
Kemal Hoca'nın talep ettiği OBİS entegrasyonlu web projesi.

Önemli Linkler:
OBİS Linki: https://obs.mehmetakif.edu.tr/oibs/bologna/index.aspx?lang=tr&curOp=showPac&curUnit=47&curSunit=40812
Kutbay Hoca'nın Örnek Projesi: https://rapor.mehmetkutbay.com/panel/sinav-yukle.html
(Panel şifresi Kemal Hoca'da. Repoya veya dokümana yazılmayacak.)


## Amaç

Her dersin Bologna bilgi paketinde, öğrencinin kazanması gereken öğrenme çıktıları
tanımlıdır. Sınavlar bu çıktıları ölçmek için yapılır. Örnek:

- Vize: HTML ve CSS öğrenilmiş mi?
- Final: HTML, CSS ve JavaScript öğrenilmiş mi?

Hoca, sınıfın sınav notlarını soru bazında formatlı bir Excel ile sisteme yükler.
Sistem bu notlardan şunu hesaplar:

- **Sınıf bazında:** Her öğrenme çıktısı sınıfta yüzde kaç karşılandı?
- **Öğrenci bazında:** Her öğrenci hangi çıktıyı yüzde kaç kazandı?

Hoca, sonuçları web'de görüntüler ve raporlar.


## Mevcut durum (Kutbay Hoca'nın denemesi)

- rapor.mehmetkutbay.com adresinde çalışıyor. Yapay zekâ ile (muhtemelen Gemini) yazılmış.
- Ders bilgilerini OBS Bologna sayfasından çekiyor. Hoca, bilgiler güncellendiğinde
  panele yeni ders linkini yapıştırıyor ve sistem yeni ders bilgilerine erişiyor.
- Örnek Excel şablonu var. Doldurulup yüklenince analiz web'de görüntüleniyor.
- Hesaplamalar büyük ihtimalle doğru ve araç işlevsel olarak güçlü.
- Sorunlar:
  - Arayüzü kullanmak oldukça zor.
  - Güvenlik incelenmedi. AI ile yazılmış kodda veri sızıntısı ve yetkilendirme açıkları
    olabilir. Öğrenci notları kişisel veri olduğu için bu kritik.
- Konu, Kemal Hoca için prestij meselesi. Sonuç, mevcut araçtan belirgin şekilde iyi olmalı.


## Veri kaynakları

1. **OBS Bologna sayfası (kamuya açık):** ders adı, kodu, AKTS, dersin öğrenme
   çıktıları, program çıktıları ve ders–program çıktısı ilişki matrisi. Giriş gerektirmez;
   HTML'den okunur (scraping).
2. **Hocanın yüklediği Excel:** öğrenci listesi, soru bazlı puanlar ve her sorunun hangi
   öğrenme çıktısını ölçtüğü (soru–çıktı eşlemesi hoca tarafından Excel'de girilir).


## Mevcut Excel şablonu (ornek-sinav-sablonu.xlsx)

Tek sayfa ("Final Geçenler+Bütünleme giren"), sabit hücre düzeni:

| Alan | Hücre |
|---|---|
| Ders kodu, dönem, sınav türü, şube, öğretim elemanı, program | A sütunu, etiket/değer çiftleri (A1–A12) |
| Soru başlıkları (Soru 1 … Soru 25) | C4:AA4 |
| **Soru–çıktı ağırlık matrisi** (satırlar Öç1 … Öç10) | B5:AA14 (Excel'de `oc` adıyla tanımlı) |
| Soruların tam puanları | C16:AA16 |
| Öğrenciler: okul no, ad soyad, soru puanları | A18 ve aşağısı, puanlar C:AA |
| Öğrenci toplam notu (formül), harf notu (elle) | AB, AC sütunları |
| Soru başına başarı yüzdesi ve ortalaması (formül) | satır 2 ve 3 |

Gözlemler:
- Sınır: en fazla 25 soru ve 10 öğrenme çıktısı.
- Soru–çıktı eşlemesi düz bir gruplama değil, ağırlık matrisi. Bir soru birden fazla
  çıktıyı ölçebiliyor ve puanı ağırlıklara bölünüyor. Her sorunun sütun toplamı 1
  (ör. Soru 1: Öç1 0,25 + Öç4 0,75).
- Çıktı başarısı Excel'de hesaplanmıyor, uygulama hesaplıyor.
- Sınava girmeyen öğrencinin satırı boş kalıyor (toplam formülü "" döner, ortalamaya girmez).
- Formül aralıkları tutarsız: soru ortalamaları satır 18–64'ü, sınıf ortalaması 18–104'ü
  kapsıyor. Öğrenci sayısı artınca hesap kayar. Yeni şablonda bu tür sabit aralıklara
  güvenilmeyecek.
- Excel'de `pc` (program çıktıları) adlı bozuk (#REF!) bir tanım var; program çıktısı
  eşlemesi bir dönem şablonda olup kaldırılmış olabilir.
- Örnek dosyada gerçek öğrenci adları ve numaraları var. Repoya konmayacak; test için
  anonim veri üretilecek.


## Hesaplama (taslak — hocayla doğrulanacak)

Hoca Excel'de her soru için hangi öğrenme çıktısını hangi oranla ölçtüğünü girer
(w = soru–çıktı ağırlığı, her sorunun ağırlıkları toplamı 1).

- Öğrencinin çıktı başarısı = Σ(aldığı puan × w) / Σ(tam puan × w) × 100
- Sınıfın çıktı başarısı = sınava giren öğrencilerin çıktı başarılarının ortalaması
  (alternatif olarak tüm puanların toplamı / tüm tam puanların toplamı)
- Örnek dosyadan bu formülle çıkan sınıf sonuçları (46 öğrenci): Öç1 %51,3, Öç2 %83,4,
  Öç3 %43,8, Öç4 %68,1, Öç5 %56,2. Mevcut sistemin aynı dosya için verdiği sonuçlarla
  karşılaştırılıp formül doğrulanacak.
- Vize ve final ayrı ayrı ve birlikte hesaplanabilir (ör. vize %40 + final %60).
- Çıktı başarıları, ders–program çıktısı matrisi üzerinden program çıktılarına
  yansıtılabilir.
- Belirli bir eşiğin (ör. %50) altındaki çıktılar "karşılanmadı" olarak işaretlenir.


## Teknoloji

- Next.js (App Router, TypeScript), paket yöneticisi bun
- Drizzle ORM + SQLite
- Better Auth (hoca girişi)
- Excel okuma/yazma: SheetJS veya exceljs
- SQLite dosyası kalıcı disk gerektirir. Bu yüzden Vercel gibi serverless ortamlar
  uygun değil; tek bir Node sunucusu (VPS veya okul sunucusu) hedefleniyor.


## Hedeflenen kullanım akışı

1. Hoca, OBS ders linkini yapıştırır. Ders bilgileri ve öğrenme çıktıları otomatik gelir.
2. Sınavı (vize/final) seçer ve soruları ile her sorunun hangi çıktıyı ölçtüğünü girer.
3. Bu ders ve sınava özel Excel şablonunu indirir, notları doldurup yükler.
4. Sınıf özetini, çıktı bazlı grafikleri ve öğrenci bazlı tabloyu görür.
5. Raporu PDF veya Excel olarak dışa aktarır.


## Çalışma adımları

1. Mevcut sistemi incelemek: Excel şablonu, ekranlar ve hesaplama sonuçları.
   Kodlara (GitHub/Drive) erişim istenecek.
2. Hesaplama kurallarını Kemal Hoca ile netleştirmek (aşağıdaki sorular).
3. Arayüz taslağı (UI) hazırlayıp hocaya göstermek.
4. OBS Bologna sayfasından veri çekme.
5. Excel şablonu ve yükleme, hesaplama ve rapor ekranları.
6. Mevcut kodu güvenlik açısından incelemek; sonra düzeltmeye mi yoksa sıfırdan
   yazmaya mı karar vermek.


## Kemal Hoca'ya sorulacaklar

- Ağırlıklı formül (yukarıda) mevcut sistemin kullandığıyla aynı mı?
- Harf notu neden elle giriliyor? Sistem hesaplamalı mı, yoksa sadece gösterilmeli mi?
- 25 soru / 10 çıktı sınırı yeterli mi?
- Sınıf başarısında öğrenci ortalaması mı, toplam puan oranı mı kullanılmalı?
- "Kazanıldı" eşiği kaç olmalı? Ders veya bölüm bazında değişiyor mu?
- Vize/final ağırlıkları dersin Bologna'daki değerlendirme oranlarından mı alınmalı?
- Program çıktısı raporu da isteniyor mu, yoksa ders öğrenme çıktıları yeterli mi?
- Sınava girmeyen öğrenciler hesaba katılacak mı?
- Sistemi kimler kullanacak (tek hoca, bölüm, tüm MYO)? Giriş/yetki nasıl olmalı?
- Öğrenci verileri sunucuda saklanacak mı, yoksa sadece analiz edilip silinecek mi (KVKK)?
- Mevcut sistemin kodlarına erişebilir miyiz?
