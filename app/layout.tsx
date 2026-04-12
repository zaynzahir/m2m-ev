import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M2M | The Decentralized Power Grid for Machines",
  description:
    "M2M connects EV drivers with local homeowners. Find a charge anywhere, pay instantly on chain, and earn USDC by sharing your home charger.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0e0e11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-background text-on-background font-body selection:bg-primary/30 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
