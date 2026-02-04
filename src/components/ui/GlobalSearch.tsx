"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, ClipboardList, FileText, Brain, Target, Loader2 } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { globalSearch, SearchResult } from "@/lib/firebaseServices";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const typeIcons: Record<string, React.ReactNode> = {
  subject: <BookOpen className="w-4 h-4" />,
  homework: <ClipboardList className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  flashcard: <Brain className="w-4 h-4" />,
  goal: <Target className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  subject: "#C5E8FF",
  homework: "#FFD6E0",
  note: "#FFF3B0",
  flashcard: "#D4F5D4",
  goal: "#E8D5F2",
};

export function GlobalSearch() {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme colors
  const bgColor = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await globalSearch(user.uid, query);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex]
  );

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");

    // Navigate based on type
    switch (result.type) {
      case "subject":
        router.push(`/subjects`);
        break;
      case "homework":
        router.push(`/homework`);
        break;
      case "note":
        router.push(`/notes`);
        break;
      case "flashcard":
        router.push(`/review`);
        break;
      case "goal":
        router.push(`/stats`);
        break;
    }
  };

  const typeLabels: Record<string, string> = {
    subject: t("search.subject"),
    homework: t("search.homework"),
    note: t("search.note"),
    flashcard: t("search.flashcard"),
    goal: t("search.goal"),
  };

  return (
    <>
      {/* Search Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all"
        style={{
          borderColor,
          backgroundColor: bgColor,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search className="w-4 h-4" style={{ color: textMuted }} />
        <span className="font-kanit text-sm hidden sm:inline" style={{ color: textMuted }}>
          {t("search.placeholder")}
        </span>
        <kbd
          className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            color: textMuted,
          }}
        >
          ⌘K
        </kbd>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Search Dialog */}
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
            >
              <div
                className="rounded-2xl border-2 overflow-hidden"
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
                }}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor }}>
                  <Search className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("search.placeholder_full")}
                    className="flex-1 bg-transparent outline-none font-kanit"
                    style={{ color: textColor }}
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-4 h-4" style={{ color: textMuted }} />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                    </div>
                  ) : results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, index) => (
                        <motion.button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                          style={{
                            backgroundColor: index === selectedIndex ? hoverBg : "transparent",
                          }}
                          whileHover={{ backgroundColor: hoverBg }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isDark
                                ? `${typeColors[result.type]}33`
                                : typeColors[result.type],
                              color: primaryColor,
                            }}
                          >
                            {typeIcons[result.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-kanit text-sm font-medium truncate"
                              style={{ color: textColor }}
                            >
                              {result.title}
                            </p>
                            <p className="font-kanit text-xs truncate" style={{ color: textMuted }}>
                              {typeLabels[result.type]}
                              {result.subjectName && ` • ${result.subjectName}`}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : query ? (
                    <div className="py-8 text-center">
                      <p className="font-kanit text-sm" style={{ color: textMuted }}>
                        {t("search.no_results")}
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="font-kanit text-sm" style={{ color: textMuted }}>
                        {t("search.hint")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between px-4 py-2 text-xs border-t"
                  style={{ borderColor, color: textMuted }}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 rounded" style={{ backgroundColor: hoverBg }}>
                        ↑↓
                      </kbd>
                      {t("search.navigate")}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 rounded" style={{ backgroundColor: hoverBg }}>
                        ↵
                      </kbd>
                      {t("search.select")}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 rounded" style={{ backgroundColor: hoverBg }}>
                      esc
                    </kbd>
                    {t("search.close")}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
