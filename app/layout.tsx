import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/app-layout";
import { DataInitializer } from "@/components/providers/data-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareScribe - Intelligent NDIS Incident Reporting",
  description: "Transform incident reporting with AI-powered voice documentation for disability support providers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataInitializer>
          <AppLayout>
            {children}
          </AppLayout>
        </DataInitializer>
        <Toaster />
      </body>
    </html>
  );
}
