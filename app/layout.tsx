import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClientProviders } from "@/components/client-providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "First Timer Platform",
  description: "Track first timers, caller assignments, and follow-ups",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
        <ClientProviders />
        <Analytics />
      </body>
    </html>
  );
}
