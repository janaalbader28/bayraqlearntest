import type { Metadata } from "next";
import { Inter, Outfit, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-heading", subsets: ["latin"] });
const notoArabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BayraqLearn | Online Learning & Growth",
  description:
    "BayraqLearn Academy helps you grow through structured courses, expert instruction, and a supportive learning community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} ${notoArabic.variable} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
