import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:data/obis.db";

// libsql dosyayı açarken klasörü oluşturmaz, bağlantı da import anında açılır. next build
// sayfa modüllerini çalıştırdığı için Docker build aşamasında (data/ .dockerignore'da)
// ve data/ oluşturulmamış kurulumlarda "ConnectionFailed ... 14" ile düşüyordu.
if (url.startsWith("file:"))
  mkdirSync(dirname(url.slice("file:".length)), { recursive: true });

export const db = drizzle({ connection: { url }, schema });
