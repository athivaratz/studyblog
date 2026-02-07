"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MusicProvider } from "@/contexts/MusicContext";
import { SubjectsProvider } from "@/contexts/SubjectContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CustomColorsProvider } from "@/contexts/CustomColorsContext";
import { NetworkWarningModal, GlobalSearch } from "@/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <MusicProvider>
            <AuthProvider>
              <CustomColorsProvider>
                <SubjectsProvider>
                  {children}
                  <NetworkWarningModal />
                  <GlobalSearch />
                </SubjectsProvider>
              </CustomColorsProvider>
            </AuthProvider>
          </MusicProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
