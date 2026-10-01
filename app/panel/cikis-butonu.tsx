"use client";

import { Icon } from "@iconify/react/offline";
import powerSettings from "@iconify-icons/material-symbols/power-settings-circle-outline-rounded";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function CikisButonu() {
  const router = useRouter();
  return (
    <Button
      variant="destructive"
      size="lg"
      aria-label="Çıkış"
      onClick={async () => {
        await authClient.signOut();
        router.push("/giris");
      }}
    >
      <Icon icon={powerSettings} height={20} />
      <span className="hidden sm:inline">Çıkış</span>
    </Button>
  );
}
