import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteLoadingWrapper } from "@/components/RouteLoadingWrapper";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Peticia - Raise your voice...",
  description: "Converting citizen awareness into real government action and resolution",
  keywords: ["civic action", "India", "petitions", "government", "citizens rights"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <RouteLoadingWrapper>
              {children}
            </RouteLoadingWrapper>
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
