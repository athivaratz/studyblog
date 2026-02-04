import type { Metadata, Viewport } from "next";
import { Felipa, Kanit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const felipa = Felipa({
  weight: "400",
  variable: "--font-felipa",
  subsets: ["latin"],
  display: "swap",
});

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "studyblog - จัดการการเรียนอย่างมีสไตล์",
  description: "แอปจัดการการเรียนสไตล์ Y2K สำหรับนักเรียนไทย - ติดตามการบ้าน ตารางเรียน และทบทวนบทเรียน",
  keywords: ["การเรียน", "นักเรียน", "การบ้าน", "ตารางเรียน", "Y2K", "studyblog"],
  authors: [{ name: "studyblog" }],
  openGraph: {
    title: "studyblog - จัดการการเรียนอย่างมีสไตล์",
    description: "แอปจัดการการเรียนสไตล์ Y2K สำหรับนักเรียนไทย",
    type: "website",
    locale: "th_TH",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00568C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${felipa.variable} ${kanit.variable} antialiased font-kanit`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
