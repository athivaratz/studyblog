import type { Metadata } from "next";
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
  title: "studyblog",
  description: "จัดการการเรียนของคุณอย่างมีสไตล์",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "studyblog",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* PWA Meta Tags for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="studyblog" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        
        {/* PWA Splash Screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>
      <body
        className={`${felipa.variable} ${kanit.variable} antialiased font-kanit`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
