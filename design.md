# Tasarım Rehberi

Kaynak: [Haume0/staj-app](https://github.com/Haume0/staj-app) (`site/`). Bu projede aynı görsel
dil kullanılır; iki uygulama aynı ailenin parçası gibi görünmelidir. Aşağıdaki değerler
staj-app'in `site/src/styles.css` dosyasından ve ekranlarından alınmıştır.

Genel karakter: açık, ferah, mor tonlu. Beyaz kartlar, ince mor kenarlıklar, mor gölgeler,
yumuşak yay (spring) animasyonları. Yalnızca açık tema var.


## Teknoloji

- Tailwind CSS v4 + **shadcn/ui** (base-nova, Base UI). Bileşenler `components/ui/` altında;
  shadcn ile eklenir (`bunx shadcn@latest add <ad>`), görünüm için doğrudan düzenlenir.
  Bu klasör Biome lint dışında, shadcn güncellemeleri kolay uygulansın diye.
- Tema: `app/globals.css` içindeki shadcn token'ları (`--primary`, `--border`, `--accent` …)
  staj-app renklerine eşlenmiştir. Yalnızca açık tema; `dark:` sınıfları `.dark` olmadan
  devreye girmez.
- İkonlar: uygulama kodunda Iconify Material Symbols, çevrimdışı
  (`@iconify/react/offline` + `@iconify-icons/material-symbols`). shadcn bileşenlerinin
  kendi içindeki ikonlar lucide.
- Animasyon: `motion` (`motion/react`)
- Font: Red Hat Display (`next/font/google`, latin + latin-ext).


## Renkler

```css
@theme {
  --color-prime: #9236ff;         /* canlı mor: vurgu, seçili durum, rozet, link */
  --color-primary: #39188f;       /* koyu mor: başlıklar, kenarlık ve gölge tabanı */
  --color-body: #fafafa;          /* sayfa arka planı */
  --color-custom-purple: #703a8f; /* gradyan başlangıcı (üst şerit, avatar) */
  --color-custom-blue: #2756ff;   /* gradyan bitişi */
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
- Karşılama ekranı: "Hoş geldiniz," `text-lg font-light text-black/70`, altında
  `text-3xl font-bold text-primary` uygulama adı


## Köşe, boşluk, gölge

- Köşe: kontroller ve satırlar `rounded-lg`; küçük butonlar `rounded-md`;
  grup kutuları `rounded-xl`; dialog ve karşılama kartı `rounded-2xl`; rozet `rounded-full`.
- Kontrol yüksekliği: `h-12` (küçük varyant `h-8`).
- Kart iç boşluğu: dialog `p-6`, karşılama kartı `p-10`, liste satırı `p-3`.
- Büyük yüzey gölgesi: `shadow-2xl shadow-primary/20` (giriş kartı), `shadow-lg shadow-primary/20` (dialog).


## Ortak kontroller

staj-app'teki `MainButton`, `MainInput` … global sınıfları yerine shadcn bileşenleri
kullanılır; görünümleri staj-app'e benzetildi:

- `Button`: `default` varyantı staj-app `MainButton` görünümü (beyaz, `h-12 px-6`, ince mor
  kenarlık, hover'da `-translate-y-0.5` ve mor gölge). `destructive` aynı görünüm + hover'da
  kırmızı. `solid` dolu mor (gerektiğinde ana eylem için). Boyutlar: `default` h-12,
  `lg` h-10, `icon-lg` size-10. Link için `buttonVariants()` sınıfı kullanılır.
- `Input`: beyaz, `h-12 px-3`, focus'ta hafif mor zemin ve halka.
- `InputOTP`: `size-12` beyaz kutular (giriş kodu).
- `Card`: `rounded-2xl`, `ring-primary/10`, `shadow-primary/5`. Giriş/karşılama kartı ek
  olarak `shadow-2xl shadow-primary/20` alır.
- Metin renkleri: ikincil metin `text-muted-foreground`, hata `text-destructive`.


## Düzen

### Panel (giriş sonrası)

staj-app'teki gradyanlı yan menü birebir alınmadı; uygulamada tek bölüm (dersler)
olduğu için ince bir üst çubuk yeterli. Estetik aynı, düzen farklı.

- Üst çubuk: `sticky top-0`, `bg-white/80 backdrop-blur`, altında `border-primary/10`.
  En üstte 4px'lik `from-custom-purple to-custom-blue` gradyan şerit (marka vurgusu).
  - Solda "OBİS Katip" (`text-xl font-bold text-primary`), panel ana sayfasına link.
  - Sağda ad + e-posta (mobilde gizli), gradyan zeminli baş harf kutusu
    (`size-10 rounded-lg`), çıkış butonu (`Button variant="destructive" size="lg"`, mobilde sadece ikon).
- İçerik: `max-w-6xl mx-auto`, `p-4 lg:py-10`; en üstte sayfa başlığı bloğu.
- Avatar için dicebear gibi dış servis kullanılmaz; baş harfler yerelde üretilir.

### Liste sayfası kalıbı

1. Başlık + açıklama + tarih satırı
2. Filtre çubuğu (`bg-hic/24`): sağa yaslı `MainSelect` ve arama `MainInput`
3. Açılır gruplar (`Details`): başlık + sayaç rozeti, içinde beyaz satır kartları
   (`rounded-lg outline-1 outline-black/20 p-3`, masaüstünde grid kolonlar)
4. Satır sonunda eylem butonu (`Button`, ikon + metin, ör. "İncele")

### Giriş / karşılama ekranı

`bg-body` üzerinde ortalanmış tek kart: `w-[30rem] bg-white p-10 rounded-2xl border
border-primary/10 shadow-2xl shadow-primary/20`. Logo, karşılama metni, alt alta tam
genişlik `Button`'lar ve altta "Yardım" linki (`text-prime underline`).
Sol üstte geri butonu (`buttonVariants({ size: "icon-lg" })`).


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

- **Focus görünürlüğü:** staj-app'te kontrollerde klavye focus stili yok; burada
  `focus-visible:ring-2 ring-primary/30` var.
- **Yan menü** yerine üst çubuk (bkz. Düzen → Panel).
- **Tekrarlanan inline SVG'ler** yerine Iconify ikonları, çevrimdışı
  (`@iconify/react/offline` + `@iconify-icons/material-symbols`).
- Tablo yoğun ekranlar (öğrenci × çıktı matrisi) staj-app'te yok. Bu ekranlarda
  aynı kenarlık/gölge dili korunarak sabit başlıklı, yatay kaydırılabilir tablo kullanılacak.
