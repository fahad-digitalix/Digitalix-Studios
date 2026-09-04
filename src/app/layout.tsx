import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import TawkChat from "@/components/TawkChat";
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export const metadata: Metadata = {
  title: {
    default: "Digitalix Studios | Premium Video Production For Modern Brands",
    template: "%s | Digitalix Studios",
  },

  description:
    "Premium Video Production For Modern Brands. Digitalix Studios specializes in high-converting custom editing, short-form content, commercial production, and YouTube content creation.",

  keywords: [
    "Digitalix Studios",
    "Premium Video Production",
    "Video Editing Agency",
    "Custom Editing Services",
    "Short Form Video Editing",
    "Cinematic Video Editing",
    "Modern Brand Video Production",
  ],

  authors: [{ name: "Digitalix Studios" }],
  creator: "Digitalix Studios",

  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "Digitalix Studios | Premium Video Production For Modern Brands",

    description:
      "Premium Video Production For Modern Brands. Transforming raw footage into cinematic, high-converting video stories.",

    url: "https://digitalixstudios.com",

    siteName: "Digitalix Studios",

    images: [
      {
        url: "/linklogo.png",
        width: 1200,
        height: 630,
        alt: "Digitalix Studios",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Digitalix Studios | Premium Video Production For Modern Brands",

    description:
      "Premium Video Production For Modern Brands. Transforming raw footage into cinematic, high-converting video stories.",

    images: ["/linklogo.png"],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#08050c] text-white`}
      >
        <Loader />
        <Navbar />
        {children}
        <TawkChat />
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}