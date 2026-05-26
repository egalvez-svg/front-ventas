export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RefineProvider } from "@/providers/RefineProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToasterWrapper } from "@/components/ToasterWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant POS - Sistema de Ventas",
  description: "Sistema de gestión integral para restaurantes multi-sucursal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Sets .dark class before first paint to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t==='dark'||t==null)}catch(e){document.documentElement.classList.add('dark')}`,
          }}
        />
        <ThemeProvider>
          <RefineProvider>
            {children}
          </RefineProvider>
          <ToasterWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
