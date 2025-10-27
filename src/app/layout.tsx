import type { Metadata } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gema-sma-wahidiyah.vercel.app'),
  title: "GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri",
  description: "Wadah kreatif untuk belajar, berinovasi, dan berkembang di dunia teknologi dengan landasan nilai-nilai pesantren. Program unggulan informatika SMA Wahidiyah Kediri, Pondok Pesantren Kedunglo.",
  keywords: [
    "GEMA",
    "Generasi Muda Informatika",
    "SMA Wahidiyah Kediri", 
    "Pondok Pesantren Kedunglo",
    "komunitas teknologi pesantren",
    "belajar coding pesantren",
    "workshop teknologi Kediri",
    "kompetisi IT pesantren",
    "programming Islamic school",
    "informatika pesantren",
    "teknologi pendidikan Islam",
    "SPMB Kedunglo",
    "pendaftaran SMA Wahidiyah"
  ],
  authors: [{ name: "GEMA Team - SMA Wahidiyah Kediri" }],
  creator: "GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri",
  publisher: "SMA Wahidiyah Kediri",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://gema-sma-wahidiyah.vercel.app",
    title: "GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri",
    description: "Wadah kreatif untuk belajar, berinovasi, dan berkembang di dunia teknologi dengan landasan nilai-nilai pesantren",
    siteName: "GEMA SMA Wahidiyah",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GEMA - Generasi Muda Informatika"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri", 
    description: "Wadah kreatif untuk belajar, berinovasi, dan berkembang di dunia teknologi dengan landasan nilai-nilai pesantren",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "your-google-verification-code"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${poppins.variable} ${firaCode.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
