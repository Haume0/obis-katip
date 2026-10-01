import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";

// Türkçe karakterler (ş, ğ, İ) latin-ext alt kümesinde.
const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "OBİS Katip",
  description: "Sınav sonuçlarından öğrenme çıktısı başarı analizi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={redHatDisplay.variable}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
