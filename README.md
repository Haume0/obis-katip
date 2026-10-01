# OBİS Katip

Sınav sonuçlarından öğrenme çıktısı başarı analizi. Hoca dersini OBS Bologna'dan seçer,
derse özel Excel şablonunu indirip doldurur ve yükler; sistem sınıfın ve her öğrencinin
hangi öğrenme çıktısını yüzde kaç karşıladığını gösterir.

Ayrıntılı ihtiyaç ve kararlar: [plan.md](plan.md) · Tasarım dili: [design.md](design.md)

## Nasıl çalışır

1. **Giriş:** E-postaya gelen 6 haneli kodla (şifre yok). Hesapları yönetici açar,
   dışarıdan kayıt kapalı.
2. **Ders ekleme:** OBS Bologna program linki yapıştırılır, ders seçilir. Ders bilgisi,
   değerlendirme oranları ve öğrenme çıktıları veritabanına kopyalanmaz; OBS'den istek
   anında çekilip 1 gün cache'lenir ("OBS'den Yenile" cache'i temizler).
3. **Sınav:** Derse özel şablon indirilir; soru tam puanları, soru–öğrenme çıktısı
   ağırlıkları (her sorunun toplamı 1) ve öğrenci puanları girilip yüklenir.
   Öğrenci adları saklanmaz, yalnızca okul numarası ve puanlar.
4. **Rapor:** Öğrencinin çıktı başarısı `Σ(puan × ağırlık) / Σ(tam puan × ağırlık)`;
   sınıf başarısı sınava girenlerin ortalaması. %50 altı "karşılanmadı".

## Geliştirme

Gereksinim: [Bun](https://bun.sh).

```bash
bun install
cp .env.example .env            # BETTER_AUTH_SECRET: openssl rand -base64 32
mkdir -p data && bun run db:migrate
bun scripts/hoca-ekle.ts ornek@mehmetakif.edu.tr "Ad Soyad"
bun dev
```

Development'ta giriş kodu e-posta yerine sunucu loguna yazılır:
`[giriş kodu] ornek@mehmetakif.edu.tr: 123456`.

| Komut | |
|---|---|
| `bun dev` | Geliştirme sunucusu |
| `bun test` | Excel okuma ve hesaplama testleri |
| `bun run lint` | Biome (lint + format kontrolü) |
| `bun run db:generate` | Şema değişince migration üretir |
| `bun run db:migrate` | Migration'ları uygular |

## Deploy

SQLite dosyası kalıcı disk ister; Vercel gibi serverless ortamlar uygun değil, tek bir
Node/Bun sunucusu (VPS, okul sunucusu) hedeflenir.

**Docker (önerilen):**

```bash
docker build -t obis-katip .
docker run -d --name obis-katip -p 3000:3000 \
  --env-file .env -v obis-data:/app/data obis-katip
docker exec obis-katip bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>"
```

Container her açılışta migration'ları uygular. Veritabanı `obis-data` volume'ünde kalır;
volume bağlanmazsa container silinince veri gider. `.env` image'a girmez
(`.dockerignore`), çalışırken `--env-file` ile verilir.

**Docker'sız:**

```bash
bun install
mkdir -p data && bun run db:migrate
bun run build
cp -r .next/static .next/standalone/.next/
bun .next/standalone/server.js    # PORT ile port seçilir, varsayılan 3000
```

`server.js` çalışma klasörünü `.next/standalone`'a çevirir; bu yüzden Docker'sız kurulumda
`DATABASE_URL` mutlak yol olmalı (ör. `file:/srv/obis-katip/data/obis.db`), yoksa uygulama
boş bir veritabanı açar.

`.env`:

- `BETTER_AUTH_URL` uygulamanın dışarıdan erişilen adresiyle birebir aynı olmalı
  (ör. `https://obis.ornek.edu.tr`); farklıysa giriş istekleri "Invalid origin" ile reddedilir.
- `BETTER_AUTH_SECRET` production için yeni üretilmeli.
- `SMTP_*` giriş kodu e-postası için zorunlu. `SMTP_SECURE=true` 465 portu (SSL),
  `SMTP_STARTTLS=true` 587 portu içindir; ikisi de `false` ise bağlantı şifresiz kurulur.

Hoca hesabı (Docker'sız): `bun scripts/hoca-ekle.ts <e-posta> "<Ad Soyad>"`.

## Yapı

```
app/giris              e-posta kodu ile giriş
app/panel              dersler, ders ekleme, ders sayfası, sınav raporu
app/panel/actions.ts   server action'lar (her biri oturumu ve sahipliği doğrular)
lib/obs.ts             OBS Bologna sayfalarını okuma + cache
lib/sinav-excel.ts     sınav Excel'i okuma ve derse özel şablon üretme
lib/hesap.ts           öğrenme çıktısı başarı hesabı, %50 eşik
db/schema.ts           Drizzle şeması (auth, hoca_ders, sinav)
tests/                 hesap ve Excel testleri (anonim örnek dosya ile)
```
