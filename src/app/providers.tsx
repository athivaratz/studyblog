"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MusicProvider } from "@/contexts/MusicContext";
import { NetworkWarningModal } from "@/components/ui";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MusicProvider>
        <AuthProvider>
          {children}
          <NetworkWarningModal />
        </AuthProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}
