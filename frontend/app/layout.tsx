import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Nav } from "../components/Nav";
import { ToastBoundary } from "../components/ToastBoundary";
import { cn } from "../lib/format";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Rental Suite",
  description: "Smart rental agreements with DeFi rails and streaming rent payments"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "font-sans bg-background text-slate-100 min-h-screen")}> 
        <Providers>
          <ToastBoundary />
          <div className="relative flex min-h-screen flex-col bg-background transition-colors">
            <Nav />
            <main className="container flex-1 pb-20 pt-6 md:pb-12">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
