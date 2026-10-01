"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { hocaDers } from "@/db/schema";
import { oturumuDogrula } from "@/lib/auth";
import { dersTag, obsProgramDersleri } from "@/lib/obs";

export async function dersEkle(obsBirimId: string, obsDersId: string) {
  const { user } = await oturumuDogrula();
  // İstemciden gelen id'ye güvenilmez; ders gerçekten o OBS programında olmalı.
  const { dersler } = await obsProgramDersleri(obsBirimId);
  if (!dersler.some((d) => d.id === obsDersId))
    throw new Error("Ders bu programda bulunamadı.");

  await db
    .insert(hocaDers)
    .values({ userId: user.id, obsDersId, obsBirimId })
    .onConflictDoNothing();
  redirect(`/panel/ders/${obsDersId}`);
}

export async function dersKaldir(obsDersId: string) {
  const { user } = await oturumuDogrula();
  await db
    .delete(hocaDers)
    .where(
      and(eq(hocaDers.userId, user.id), eq(hocaDers.obsDersId, obsDersId)),
    );
  redirect("/panel");
}

export async function obsYenile(obsDersId: string) {
  await oturumuDogrula();
  updateTag(dersTag(obsDersId));
}
