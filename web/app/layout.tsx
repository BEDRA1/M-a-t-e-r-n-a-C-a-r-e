import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Materna Care | رفيقتكِ من الحمل حتى ما بعد الولادة",
    template: "%s | Materna Care",
  },
  description:
    "منصة Materna Care الجزائرية ترافقك خلال رحلة الألف يوم الأولى من بداية الحمل إلى غاية بلوغ الطفل سنتين: حاسبة حمل دقيقة، متابعة أسبوعية، تذكيرات صحية، وربط بزوجك لمتابعة مشتركة.",
  keywords: [
    "حاسبة الحمل",
    "متابعة الحمل",
    "تطبيق الحمل الجزائر",
    "Materna Care",
    "تذكيرات الحمل",
    "تطور الجنين أسبوعيًا",
  ],
  authors: [{ name: "Materna Care" }],
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    siteName: "Materna Care",
    title: "Materna Care — رفيقتكِ من الحمل حتى ما بعد الولادة",
    description:
      "حاسبة حمل دقيقة، متابعة أسبوعية، تذكيرات صحية، وربط بزوجك — كل ما تحتاجينه في رحلة الأمومة في مكان واحد.",
    images: [{ url: "/logo.jpg" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
