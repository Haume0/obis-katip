"use client";

import { Icon } from "@iconify/react/offline";
import errorIcon from "@iconify-icons/material-symbols/error-outline-rounded";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Panel sayfaları OBS'den canlı veri çekiyor; OBS yanıt vermezse sayfa burada yakalanır.
// Production'da sunucu hata mesajı istemciye gelmez, bu yüzden metin genel tutuldu.
export default function PanelHatasi({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-8 max-w-lg items-center p-8 text-center">
      <Icon icon={errorIcon} className="size-12 text-destructive" />
      <h1 className="text-2xl font-semibold text-primary">Sayfa yüklenemedi</h1>
      <p className="text-muted-foreground">
        OBS'ye şu an ulaşılamıyor olabilir. Biraz sonra tekrar deneyin.
      </p>
      <Button onClick={retry}>Tekrar Dene</Button>
    </Card>
  );
}
