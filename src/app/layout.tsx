import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { RouteLoadingWrapper } from "@/components/RouteLoadingWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PETICIA - India's Civic Action Platform",
  description: "Converting citizen awareness into real government action and resolution",
  keywords: ["civic action", "India", "petitions", "government", "citizens rights"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RouteLoadingWrapper>
          {children}
        </RouteLoadingWrapper>
        <Toaster />
      </body>
    </html>
  );
}
