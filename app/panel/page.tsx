import { Icon } from "@iconify/react/offline";
import menuBook from "@iconify-icons/material-symbols/menu-book-rounded";
import { oturumuDogrula } from "@/lib/auth";

export default async function PanelPage() {
  await oturumuDogrula();

  return (
    <>
      <h1 className="text-3xl font-semibold text-primary">Dersler</h1>
      <p>OBS'den eklediğiniz dersler ve sınav analizleri.</p>
      <p className="text-black/60">
        Bugün, {new Date().toLocaleDateString("tr-TR")}
      </p>
      <div className="mt-8 flex flex-col items-center p-8 text-center">
        <Icon icon={menuBook} className="mb-3 text-6xl text-gray-400" />
        <h2 className="text-lg font-medium text-gray-600">Henüz ders yok</h2>
        <p className="mt-2 text-sm text-gray-500">
          OBS bağlantısıyla ders ekleme yakında burada olacak.
        </p>
      </div>
    </>
  );
}
