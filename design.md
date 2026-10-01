# Tasarım Rehberi

Kaynak: [Haume0/staj-app](https://github.com/Haume0/staj-app) (`site/`). Bu projede aynı görsel
dil kullanılır; iki uygulama aynı ailenin parçası gibi görünmelidir. Aşağıdaki değerler
staj-app'in `site/src/styles.css` dosyasından ve ekranlarından alınmıştır.

Genel karakter: açık, ferah, mor tonlu. Beyaz kartlar, ince mor kenarlıklar, mor gölgeler,
yumuşak yay (spring) animasyonları. Yalnızca açık tema var.


## Teknoloji

- Tailwind CSS v4 (`@theme` ile token tanımı, `@plugin '@tailwindcss/typography'`)
- İkonlar: `@iconify/react` + Material Symbols (`material-symbols:*-rounded` varyantları)
- Animasyon: `motion` (`motion/react`)
- Font: Red Hat Display (Google Fonts, 300–900). Next.js'te `next/font/google` ile yüklenir.


## Renkler

```css
@theme {
  --color-prime: #9236ff;         /* canlı mor: vurgu, seçili durum, rozet, link */
  --color-accent: #2756ff;        /* mavi: ikincil vurgu */
  --color-primary: #39188f;       /* koyu mor: başlıklar, kenarlık ve gölge tabanı */
  --color-body: #fafafa;          /* sayfa arka planı */
  --color-custom-purple: #703a8f; /* yan menü gradyanı başlangıcı */
  --color-custom-blue: #2756ff;   /* yan menü gradyanı bitişi */
  --color-onay: #4adf4f;          /* olumlu / başarılı */
  --color-ret: #ff5858;           /* olumsuz / hata / silme */
  --color-bekleme: #659bff;       /* bilgi / beklemede */
  --color-hic: #a790f0;           /* nötr mor yüzey (filtre çubuğu, grup arka planı) */
}
```

Kullanım kalıpları (renkler hep opaklıkla katmanlanır):

| Amaç | Sınıflar |
|---|---|
| Kenarlık | `border-primary/10`, hover'da `border-primary/30` |
| Gölge | `shadow-sm shadow-primary/5`, hover'da `shadow-md shadow-primary/15` |
| Seçili buton/sekme | `bg-prime/12 border-prime/48 text-prime` |
| Tehlikeli eylem hover | `hover:bg-ret/12 hover:border-ret/48 hover:text-ret` |
| Rozet (sayaç) | `bg-prime/10 text-prime px-2 py-0.5 rounded-full text-xs font-medium` |
| Filtre/araç çubuğu | `bg-hic/24 outline outline-hic/48 rounded-xl p-1.5` |
| Grup kutusu | `bg-primary/6 outline-primary/24 rounded-xl p-2` |
| İkincil metin | `text-black/60`, `text-black/70` |

### Bu projeye uyarlama: başarı durumları

Çıktı ve öğrenci başarıları için mevcut durum renkleri kullanılır, yeni renk eklenmez:

| Durum | Renk | Örnek |
|---|---|---|
| Karşılandı (eşik üstü) | `onay` | `bg-onay/12 border-onay/48`, çubuk `bg-onay` |
| Sınırda | `bekleme` | `bg-bekleme/12 border-bekleme/48` |
| Karşılanmadı (eşik altı) | `ret` | `bg-ret/12 border-ret/48 text-ret` |

Durum yalnızca renkle anlatılmaz; yanında yüzde değeri ve ikon/etiket bulunur.
`onay` (#4adf4f) beyaz üstünde metin rengi olarak düşük kontrastlıdır; metinde değil,
dolgu ve kenarlıkta kullanılır.


## Tipografi

- Font ailesi her yerde Red Hat Display, `line-height: 1.5`, antialiased.
- Sayfa başlığı: `text-3xl font-semibold text-primary`
- Sayfa alt başlığı: `text-base text-black` ve altında tarih/bağlam satırı `text-black/60`
  (ör. "Bugün, 26.06.2025")
- Kart/grup başlığı: `text-lg font-semibold`
- Dialog başlığı: `text-2xl font-semibold text-primary`
- Liste satırı: ana bilgi `text-sm font-bold`, yardımcı bilgi `text-xs`
- Yan menü linki: `text-lg font-light`
- Karşılama ekranı: "Hoş geldiniz," `text-lg font-light text-black/70`, altında
  `text-3xl font-bold text-primary` uygulama adı


## Köşe, boşluk, gölge

- Köşe: kontroller ve satırlar `rounded-lg`; küçük butonlar `rounded-md`;
  grup kutuları `rounded-xl`; dialog ve karşılama kartı `rounded-2xl`; rozet `rounded-full`.
- Kontrol yüksekliği: `h-12` (küçük varyant `h-8`).
- Kart iç boşluğu: dialog `p-6`, karşılama kartı `p-10`, liste satırı `p-3`.
- Büyük yüzey gölgesi: `shadow-2xl shadow-primary/20` (giriş kartı), `shadow-lg shadow-primary/20` (dialog).


## Ortak kontroller

staj-app bunları global CSS sınıfları olarak tanımlar. Aynı isimlerle taşınacak
(`globals.css` içinde `@apply`):

- `MainButton`: beyaz, `h-12 rounded-lg px-6`, ince mor kenarlık ve gölge. Hover'da
  `-translate-y-0.5`, mor tonlu arka plan ve daha belirgin gölge. Active'de geri iner.
- `MainInput` / `MainTextarea`: beyaz, `h-12 rounded-lg px-3`. Focus'ta
  `border-primary/40 bg-primary/4 ring-2 ring-primary/20`.
- `MainSelect` / `MainDetail`: `MainInput` görünümü + sağda chevron ikonu (data-URI SVG).
- `MainCheckbox`: `size-5 rounded-md`, işaretliyken `bg-primary` ve beyaz tik.
- Geçiş süresi: `duration-300 ease-out`.

Varyantlar ek sınıfla yapılır: `MainButton !h-8 !px-3` (küçük), seçili/tehlike için
yukarıdaki renk kalıpları.


## Düzen

### Panel (giriş sonrası)

- Solda yan menü: `bg-gradient-to-b from-custom-purple to-custom-blue`, beyaz metin,
  `p-10 pt-16`, en fazla `18rem`, masaüstünde `sticky top-0 min-h-svh`.
  - Üstte uygulama logosu (beyaz).
  - Kullanıcı bloğu: Dicebear baş harf avatarı (`size-20 rounded-xl`), "Hoş geldin,"
    `text-sm font-light`, ad `text-xl font-bold`, rol ve e-posta `text-sm`.
  - Menü linkleri: ikon + metin, pasifken `opacity-60`, aktif ve hover'da `opacity-100`.
  - En altta "Çıkış" (onay dialog'u ile).
- Sağda içerik: `lg:pl-12 lg:pt-12 lg:pr-6 p-4`. Üstte geri/ileri butonları (`size-8`),
  ardından sayfa başlığı bloğu.
- Mobilde (`< lg`) yan menü üste gelir ve yatay düzene geçer.

### Liste sayfası kalıbı

1. Başlık + açıklama + tarih satırı
2. Filtre çubuğu (`bg-hic/24`): sağa yaslı `MainSelect` ve arama `MainInput`
3. Açılır gruplar (`Details`): başlık + sayaç rozeti, içinde beyaz satır kartları
   (`rounded-lg outline-1 outline-black/20 p-3`, masaüstünde grid kolonlar)
4. Satır sonunda eylem butonu (`MainButton`, ikon + metin, ör. "İncele")

### Giriş / karşılama ekranı

`bg-body` üzerinde ortalanmış tek kart: `w-[30rem] bg-white p-10 rounded-2xl border
border-primary/10 shadow-2xl shadow-primary/20`. Logo, karşılama metni, alt alta tam
genişlik `MainButton`'lar ve altta "Yardım" linki (`text-prime underline`).
Sol üstte geri butonu (`MainButton !size-10`).


## Bileşenler

- **Modal:** `bg-black/40 backdrop-blur-sm` overlay; kart `bg-white p-6 rounded-lg
  border-primary/10 shadow-lg shadow-primary/20`. Dışarı tıklayınca kapanır
  (`cursor-zoom-out`).
- **Onay dialog'u (Alert):** `rounded-2xl p-8`, başlık mor, gövde metni, altta eşit
  genişlikte "Hayır" / "Evet" butonları. Tek butonluysa "Tamam".
- **Yükleniyor:** ortada beyaz kart; ilerleme bilinmiyorsa spinner (`text-primary`),
  biliniyorsa `h-6 rounded-full` ilerleme çubuğu (`bg-primary`). Altında başlık ve
  açıklama ("Giriş Yapılıyor" / "Lütfen Bekleyin...").
- **Details (açılır grup):** `MainDetail` başlık + `motion` ile yükseklik animasyonu.
- **Yükleme kartı (UploadCard):** solda renkli şerit (durum rengi), dosya adı ve ikonu,
  başlık, açıklama, altta "İndir / Görüntüle" linkleri. Excel yükleme ekranı bu kalıptan
  türetilecek.
- **Boş durum:** ortalanmış büyük gri ikon (`text-6xl text-gray-400`), `text-lg` başlık,
  `text-sm text-gray-500` açıklama.
- **404:** giriş kartı ölçüsünde kart, mor ikon dairesi, büyük "404", "Böyle bir yer yok!".


## Animasyon

- Tümü `motion` ile spring: dialog/overlay `stiffness 400, damping 40`; sayfa girişi
  kartı `stiffness 140, damping 18` (`opacity 0, y 40, scale 0.95` → normal).
- Dialog açılışı `scale 0.7 → 1`, kapanışı tersi.
- Hover etkileşimleri CSS geçişi (`duration-300 ease-out`).


## Metin dili

Türkçe, kısa ve samimi: "Hoş geldin,", "Böyle bir yer yok!", "Lütfen Bekleyin...",
"Çıkış Yapılsın Mı?". Butonlarda fiil: "İncele", "Yükle", "İndir".


## Bu projede düzeltilecekler

staj-app'ten taşırken birebir kopyalanmayacak noktalar:

- **Focus görünürlüğü:** `MainButton` ve yan menü linklerinde klavye focus stili yok;
  `focus-visible:ring-2 ring-primary/30` eklenecek.
- **Kontrast:** Gradyan üstünde `opacity-60` pasif menü metni düşük kontrastlı;
  pasif durum `opacity-75` civarında tutulacak.
- **Tekrarlanan inline SVG'ler** yerine Iconify ikonları kullanılacak.
- Yan menü linkleri her biri elle yazılmış; tek bir dizi üzerinden üretilecek.
- Tablo yoğun ekranlar (öğrenci × çıktı matrisi) staj-app'te yok. Bu ekranlarda
  aynı kenarlık/gölge dili korunarak sabit başlıklı, yatay kaydırılabilir tablo kullanılacak.
