// OBS sayfaları cache'te yoksa ilk istek birkaç saniye sürebiliyor.
export default function PanelYukleniyor() {
  return (
    <output className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
      <span className="size-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
      Yükleniyor…
    </output>
  );
}
