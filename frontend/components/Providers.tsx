"use client";

import { ReactNode } from "react";
import { WagmiConfig } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { wagmiConfig, queryClient } from "../lib/viem";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="rental-suite-theme">
          {children}
          <Toaster richColors position="top-center" closeButton duration={3500} />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
