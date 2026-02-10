"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSettings, updateUserSettings } from "@/lib/firebaseServices";
import { ArrowRight, CheckCircle, X } from "lucide-react";

// ==========================================
// Types & Steps
// ==========================================

interface TutorialStep {
  id: string;
  targetId?: string;
  targetIds?: string[];
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "ยินดีต้อนรับสู่ studyblog! 🎉",
    description:
      "แอปจัดการเรียนสไตล์ Y2K มาดูภาพรวมฟีเจอร์ต่างๆ กันเลย!",
    position: "center",
  },
  {
    id: "stats",
    targetId: "tour-stats",
    title: "ภาพรวมของคุณ 📊",
    description:
      "แสดงจำนวนการบ้านค้าง, งานเร่งด่วน, และงานเลยกำหนด ช่วยให้คุณติดตามสถานะได้ทันที",
    position: "bottom",
  },
  {
    id: "todo",
    targetId: "tour-todo",
    title: "To-Do List ✅",
    description:
      "จัดการสิ่งที่ต้องทำ กรองตามหมวดหมู่ (การบ้าน/ส่วนตัว) แล้วกดติ๊กเมื่อเสร็จสิ้น",
    position: "bottom",
  },
  {
    id: "nav-subjects",
    targetIds: ["tour-nav-subjects", "tour-nav-subjects-mobile"],
    title: "จัดการวิชา 📚",
    description:
      "เพิ่มวิชาเรียน การบ้าน สื่อการสอน และจดบันทึกของแต่ละวิชาได้ที่นี่",
    position: "bottom",
  },
  {
    id: "nav-schedule",
    targetIds: ["tour-nav-schedule", "tour-nav-schedule-mobile"],
    title: "ตารางเรียน 📅",
    description:
      "ดูตารางเรียนรายวัน ตรวจสอบห้องเรียนและเวลาเรียน สร้างตารางของคุณเองได้",
    position: "bottom",
  },
  {
    id: "nav-review",
    targetIds: ["tour-nav-review", "tour-nav-review-mobile"],
    title: "ห้องทบทวน 🧠",
    description:
      "ฝึกฝนด้วย Flashcards, Quiz AI และมินิเกม ช่วยจำเนื้อหาได้แม่นยำ",
    position: "bottom",
  },
  {
    id: "nav-portal",
    targetIds: ["tour-nav-portal", "tour-nav-portal-mobile"],
    title: "Portal 🌐",
    description:
      "ค้นหาและเข้าถึงข้อสอบสาธารณะ แชร์ข้อสอบร่วมกับเพื่อนๆ ได้ที่นี่",
    position: "bottom",
  },
  {
    id: "utils",
    targetIds: ["tour-utils-mobile", "tour-utils-desktop"],
    title: "เครื่องมือช่วยเรียน ⏱️",
    description:
      "จับเวลา Pomodoro และเปิดเพลง Lo-fi เพิ่มสมาธิในการอ่านหนังสือ",
    position: "bottom",
  },
  {
    id: "profile",
    targetId: "tour-profile",
    title: "โปรไฟล์ & ตั้งค่า ⚙️",
    description:
      "คลิกที่รูปโปรไฟล์เพื่อปรับแต่งธีม สี Dark Mode และข้อมูลส่วนตัว",
    position: "bottom",
  },
  {
    id: "ready",
    title: "พร้อมลุยแล้ว! 🚀",
    description:
      "ขอให้สนุกกับการเรียนรู้ไปกับ studyblog! เริ่มต้นใช้งานได้เลย",
    position: "center",
  },
];

// ==========================================
// Component
// ==========================================

export function TutorialOverlay() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [filteredSteps, setFilteredSteps] = useState<TutorialStep[]>([]);
  const scrollRAF = useRef(0);

  // ---- Check whether tutorial should show ----
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const settings = await getUserSettings(user.uid);
        if (!cancelled && settings && !settings.tutorialCompleted) {
          setIsVisible(true);
        }
      } catch (err) {
        console.error("Tutorial check failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ---- Filter available steps once overlay becomes visible ----
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      const available = tutorialSteps.filter((s) => {
        if (!s.targetId && (!s.targetIds || s.targetIds.length === 0))
          return true;
        const ids = s.targetIds || (s.targetId ? [s.targetId] : []);
        return ids.some((id) => {
          const el = document.getElementById(id);
          return el && el.getBoundingClientRect().width > 0;
        });
      });
      setFilteredSteps(available);
    }, 600);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // ---- Measure target rect ----
  const measureRect = useCallback(() => {
    if (!isVisible || filteredSteps.length === 0) return;
    const step = filteredSteps[currentStep];
    if (!step) return;
    const ids = step.targetIds || (step.targetId ? [step.targetId] : []);
    if (ids.length === 0) {
      setRect(null);
      return;
    }
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          return;
        }
      }
    }
    setRect(null);
  }, [isVisible, filteredSteps, currentStep]);

  // ---- On step change → scroll into view, then measure ----
  useEffect(() => {
    if (!isVisible || filteredSteps.length === 0) return;
    const step = filteredSteps[currentStep];
    if (!step) return;
    const ids = step.targetIds || (step.targetId ? [step.targetId] : []);
    let el: HTMLElement | null = null;
    for (const id of ids) {
      const candidate = document.getElementById(id);
      if (candidate && candidate.getBoundingClientRect().width > 0) {
        el = candidate;
        break;
      }
    }
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(measureRect, 400);
      return () => clearTimeout(t);
    } else {
      setRect(null);
    }
  }, [currentStep, isVisible, filteredSteps, measureRect]);

  // ---- Re-measure on scroll / resize ----
  useEffect(() => {
    if (!isVisible) return;
    const handler = () => {
      cancelAnimationFrame(scrollRAF.current);
      scrollRAF.current = requestAnimationFrame(measureRect);
    };
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(scrollRAF.current);
    };
  }, [isVisible, measureRect]);

  // ---- Navigation ----
  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) setCurrentStep((p) => p + 1);
    else handleComplete();
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };
  const handleComplete = async () => {
    setIsVisible(false);
    if (user) {
      await updateUserSettings(user.uid, { tutorialCompleted: true });
    }
    setTimeout(() => setCurrentStep(0), 400);
  };

  // ---- Derived ----
  const step = filteredSteps[currentStep];
  const isLast = step ? currentStep === filteredSteps.length - 1 : false;
  const isCentered =
    !step || (!step.targetId && !step.targetIds) || !rect;

  // ---- Tooltip positioning (viewport-safe) ----
  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "fixed", zIndex: 10002 };
    const vw = typeof window !== "undefined" ? window.innerWidth : 375;
    const vh = typeof window !== "undefined" ? window.innerHeight : 667;

    if (isCentered || !rect) {
      return {
        ...base,
        top: "50%",
        transform: "translateY(-50%)",
        left: 20,
        right: 20,
        maxWidth: 380,
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box" as const,
      };
    }
    const w = Math.min(300, vw - 32);
    const cssW = "calc(100vw - 32px)";
    const gap = 14;
    const cx = rect.left + rect.width / 2;
    const clampX = (x: number) => Math.max(16, Math.min(x, vw - w - 16));

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const minH = 160;

    let pos = step?.position || "bottom";
    if (pos === "top" && spaceAbove < minH && spaceBelow >= minH)
      pos = "bottom";
    if (pos === "bottom" && spaceBelow < minH && spaceAbove >= minH)
      pos = "top";

    const s: React.CSSProperties = { ...base, width: cssW, maxWidth: 300, boxSizing: "border-box" as const };

    switch (pos) {
      case "top":
        s.bottom = vh - rect.top + gap;
        s.left = clampX(cx - w / 2);
        break;
      case "bottom":
        s.top = rect.bottom + gap;
        s.left = clampX(cx - w / 2);
        break;
      case "left":
        s.right = vw - rect.left + gap;
        s.top = Math.max(16, Math.min(rect.top, vh - 200));
        break;
      case "right":
        s.left = rect.right + gap;
        s.top = Math.max(16, Math.min(rect.top, vh - 200));
        break;
      default:
        s.top = rect.bottom + gap;
        s.left = clampX(cx - w / 2);
    }
    return s;
  };

  // ---- Render ----
  return (
    <AnimatePresence>
      {isVisible && filteredSteps.length > 0 && step && (
        <motion.div
          key="tutorial-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 pointer-events-auto"
          style={{ zIndex: 10000 }}
        >
          {/* Spotlight */}
          {!isCentered && rect && (
            <motion.div
              className="absolute rounded-xl pointer-events-none"
              initial={false}
              animate={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
                border: "2px solid rgba(255,255,255,0.25)",
                zIndex: 10001,
              }}
            />
          )}

          {/* Backdrop (centered only) */}
          {isCentered && (
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              style={{ zIndex: 10001 }}
            />
          )}

          {/* Click blocker */}
          {!isCentered && (
            <div className="absolute inset-0" style={{ zIndex: 10000 }} />
          )}

          {/* Tooltip */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            style={getStyle()}
            className="bg-[#1e1e1e] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-felipa text-xl sm:text-2xl text-[#FFD6E0] leading-tight">
                {step.title}
              </h3>
              <button
                onClick={handleComplete}
                className="text-white/40 hover:text-white transition-colors flex-shrink-0 p-1 -mr-1 -mt-1 cursor-pointer"
                aria-label="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-kanit text-white/80 text-sm leading-relaxed mb-5">
              {step.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              {/* Step counter */}
              <span className="font-kanit text-xs text-white/40 flex-shrink-0">
                {currentStep + 1} / {filteredSteps.length}
              </span>

              {/* Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-kanit text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    ย้อนกลับ
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-kanit text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {isLast ? "เสร็จสิ้น" : "ถัดไป"}
                  {!isLast && <ArrowRight className="w-3 h-3" />}
                  {isLast && <CheckCircle className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / filteredSteps.length) * 100}%`,
                  backgroundColor: "#4ECDC4",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// Hook – reset tutorial from settings
// ==========================================

export function useTutorial() {
  const { user } = useAuth();

  const resetTutorial = async () => {
    if (!user) return;
    try {
      await updateUserSettings(user.uid, { tutorialCompleted: false });
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  return { resetTutorial };
}
