"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Geri alınamayan silmeler (ders, sınav) önce onay ister; eylem server action'dır.
export default function OnayliSilme({
  etiket,
  baslik,
  aciklama,
  eylem,
}: {
  etiket: string;
  baslik: string;
  aciklama: string;
  eylem: () => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="lg" />}>
        {etiket}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-primary">
            {baslik}
          </AlertDialogTitle>
          <AlertDialogDescription>{aciklama}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <form action={eylem}>
            <Button type="submit" variant="destructive" className="w-full">
              {etiket}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
