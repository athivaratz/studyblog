"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MusicProvider } from "@/contexts/MusicContext";
import { SubjectsProvider } from "@/contexts/SubjectContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NetworkWarningModal } from "@/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <MusicProvider>
            <AuthProvider>
              <SubjectsProvider>
                {children}
                <NetworkWarningModal />
              </SubjectsProvider>
            </AuthProvider>
          </MusicProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
