"use client";

import { Icon } from "@iconify/react/offline";
import uploadFile from "@iconify-icons/material-symbols/upload-file-rounded";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sinavYukle } from "../../actions";

export default function SinavYukleFormu({ obsDersId }: { obsDersId: string }) {
  const [durum, yukle, yukleniyor] = useActionState(
    sinavYukle.bind(null, obsDersId),
    { hatalar: [] },
  );

  return (
    <form action={yukle} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="dosya"
          type="file"
          required
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label="Sınav Excel dosyası"
          className="pt-3"
        />
        <Button type="submit" disabled={yukleniyor}>
          <Icon icon={uploadFile} className="size-5" />
          {yukleniyor ? "Okunuyor..." : "Sınavı Yükle"}
        </Button>
      </div>
      {durum.hatalar.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/8 p-4 text-sm"
        >
          <p className="mb-1 font-semibold">
            Dosyada {durum.hatalar.length} sorun var, düzeltip tekrar yükleyin:
          </p>
          <ul className="list-disc pl-5">
            {durum.hatalar.map((hata) => (
              <li key={hata}>{hata}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
