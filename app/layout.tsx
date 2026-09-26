import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Geist, Fredoka, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MikuaBooth — Life4Cuts Photo Booth",
  description: "Korean-style 4-cut film booth. Take 4 snaps, customize your strip, keep the memory.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F1E7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${fredoka.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F6F1E7] text-[#221F1B] selection:bg-[#E1503A] selection:text-white">
        {children}
      </body>
    </html>
  );
}
