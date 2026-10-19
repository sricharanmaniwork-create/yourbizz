import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YourBizz — Forms, Bookings & CRM for modern teams",
    template: "%s · YourBizz",
  },
  description:
    "YourBizz is the all-in-one platform to build forms, accept bookings, and manage customer relationships. Drag-drop builder, conditional logic, payments, analytics, and integrations.",
  keywords: [
    "form builder",
    "online forms",
    "booking system",
    "CRM",
    "website builder",
    "SaaS",
    "YourBizz",
    "alternative to Zoho Forms",
    "Jotform alternative",
  ],
  authors: [{ name: "YourBizz" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "YourBizz — Forms, Bookings & CRM for modern teams",
    description:
      "Build forms, accept bookings, and manage customers — all in one place.",
    url: "https://yourbizz.app",
    siteName: "YourBizz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YourBizz — Forms, Bookings & CRM",
    description:
      "Build forms, accept bookings, and manage customers — all in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
