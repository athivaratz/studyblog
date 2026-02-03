"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSettings, updateUserSettings } from "@/lib/firebaseServices";
import { RetroButton } from "@/components/ui";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
  Sparkles,
  MapPin
} from "lucide-react";

// ==========================================
// Types & Configuration
// ==========================================

interface TutorialStep {
  id: string;
  targetId?: string;
  targetIds?: string[]; // Array of IDs to check (useful for responsive layouts)
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "ยินดีต้อนรับสู่ studyblog! 🎉",
    description: "แอปพลิเคชันจัดการเรียนการสอนสไตล์ Y2K ที่จะช่วยให้ชีวิตการเรียนของคุณง่ายและสนุกยิ่งขึ้น!",
    position: "center"
  },
  {
    id: "stats",
    targetId: "tour-stats",
    title: "ภาพรวมของคุณ 📊",
    description: "ส่วนนี้แสดงจำนวนการบ้านที่ค้างอยู่, งานเร่งด่วน, และงานที่เลยกำหนดส่ง ช่วยให้คุณติดตามสถานะได้ทันที",
    position: "bottom"
  },
  {
    id: "todo",
    targetId: "tour-todo",
    title: "To-Do List ✅",
    description: "จัดการสิ่งที่ต้องทำได้ที่นี่ สามารถกรองตามหมวดหมู่ (การบ้าน/ส่วนตัว) และกดติ๊กถูกเพื่อทำเครื่องหมายว่าเสร็จสิ้น",
    position: "top"
  },
  {
    id: "utils",
    targetIds: ["tour-utils-desktop", "tour-utils-mobile"],
    title: "เครื่องมือช่วยเรียน 🛠️",
    description: "ใช้งาน Widget นาฬิกาจับเวลา (Pomodoro) และเครื่องเล่นเพลง Lo-fi เพื่อเพิ่มสมาธิในการอ่านหนังสือ",
    position: "bottom"
  },
  {
    id: "nav-schedule",
    targetId: "tour-nav-schedule",
    title: "ตารางเรียน 📅",
    description: "ดูตารางเรียนรายวันของคุณได้ที่หน้านี้ อย่าลืมตรวจสอบห้องเรียนและเวลาเรียนนะ!",
    position: "top"
  },
  {
    id: "nav-review",
    targetId: "tour-nav-review",
    title: "ห้องทบทวน 🧠",
    description: "ฝึกฝนความจำด้วย Flashcards และมินิเกมสนุกๆ ที่ช่วยให้จำศัพท์และเนื้อหาได้แม่นยำขึ้น",
    position: "top"
  },
  {
    id: "profile",
    targetId: "tour-profile",
    title: "ตั้งค่าโปรไฟล์ ⚙️",
    description: "ปรับแต่งธีม (Dark Mode), การแจ้งเตือน, และข้อมูลส่วนตัวได้ที่เมนูตั้งค่า",
    position: "bottom"
  },
  {
    id: "ready",
    title: "พร้อมลุยแล้ว! 🚀",
    description: "ขอให้สนุกกับการเรียนรู้ไปกับ studyblog! เริ่มต้นใช้งานได้เลย",
    position: "center"
  }
];

// ==========================================
// Tutorial Overlay Component
// ==========================================

export function TutorialOverlay() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const [filteredSteps, setFilteredSteps] = useState<TutorialStep[]>([]);

  // Custom hook for window resize
  const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    useEffect(() => {
      const updateSize = () => setSize([window.innerWidth, window.innerHeight]);
      window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
  };
  useWindowSize(); // Trigger re-render on resize

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const settings = await getUserSettings(user.uid);
        if (settings && !settings.tutorialCompleted) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error("Tutorial check failed:", error);
      }
    };
    checkStatus();
  }, [user]);

  // Filter steps on load based on available DOM elements
  useEffect(() => {
    if (!showTutorial) return;

    // Wait for DOM
    const timer = setTimeout(() => {
      const available = tutorialSteps.filter(step => {
        // Always include centered steps (no targets)
        if (!step.targetId && (!step.targetIds || step.targetIds.length === 0)) {
          return true;
        }

        // Check if any target exists
        const ids = step.targetIds || (step.targetId ? [step.targetId] : []);
        return ids.some(id => document.getElementById(id));
      });

      setFilteredSteps(available);
    }, 500);

    return () => clearTimeout(timer);
  }, [showTutorial]);

  // Update rect when step changes
  useEffect(() => {
    if (!showTutorial || filteredSteps.length === 0) return;

    const step = filteredSteps[currentStep];
    if (!step) return; // Guard

    const idsToCheck = step.targetIds || (step.targetId ? [step.targetId] : []);

    if (idsToCheck.length > 0) {
      const timer = setTimeout(() => {
        let foundRect: DOMRect | null = null;
        let foundEl: HTMLElement | null = null;

        for (const id of idsToCheck) {
          const el = document.getElementById(id);
          if (el) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              foundRect = r;
              foundEl = el;
              break;
            }
          }
        }

        if (foundRect && foundEl) {
          setRect(foundRect);
          foundEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setRect(null);
        }
      }, 100); // Shorter delay since we already filtered
      return () => clearTimeout(timer);
    } else {
      setRect(null);
    }
  }, [currentStep, showTutorial, filteredSteps]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (user) {
      await updateUserSettings(user.uid, { tutorialCompleted: true });
    }
    setShowTutorial(false);
    setTimeout(() => setCurrentStep(0), 500);
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  if (!showTutorial || filteredSteps.length === 0) return null;

  const step = filteredSteps[currentStep];
  const isLastStep = currentStep === filteredSteps.length - 1;
  const isCentered = !rect || (!step.targetId && !step.targetIds);

  // Calculate Tooltip Position
  const getTooltipStyle = () => {
    if (isCentered) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed" as const,
        zIndex: 100, // Higher than spotlight
        maxWidth: "400px",
        width: "90%"
      };
    }

    // Position relative to rect
    // Default margin
    const gap = 20;
    const tooltipWidth = 320; // Approx width

    let style: any = { position: "fixed", zIndex: 100, width: tooltipWidth };

    // Simple logic: prefer step.position
    if (step.position === "top") {
      style.top = rect!.top - gap;
      style.left = rect!.left + (rect!.width / 2);
      style.transform = "translate(-50%, -100%)";
    } else if (step.position === "bottom") {
      style.top = rect!.bottom + gap;
      style.left = rect!.left + (rect!.width / 2);
      style.transform = "translate(-50%, 0)";
    } else if (step.position === "left") {
      style.top = rect!.top + (rect!.height / 2);
      style.left = rect!.left - gap;
      style.transform = "translate(-100%, -50%)";
    } else if (step.position === "right") {
      style.top = rect!.top + (rect!.height / 2);
      style.left = rect!.right + gap;
      style.transform = "translate(0, -50%)";
    }

    return style;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] pointer-events-auto">
        {/* 
          SPOTLIGHT EFFECT 
          Uses a simple transparent div with a massive box-shadow to dim everything else.
          This is the most robust CSS-only way to do a "hole".
        */}
        {!isCentered && rect && (
          <motion.div
            layoutId="spotlight"
            className="absolute rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: rect.top - 5, // -5 padding
              left: rect.left - 5,
              width: rect.width + 10,
              height: rect.height + 10,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)"
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            style={{ border: "2px solid rgba(255, 255, 255, 0.3)" }}
          />
        )}

        {/* Dark backdrop only for centered steps */}
        {isCentered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
        )}

        {/* TOOLTIP CARD */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.3 }}
          style={getTooltipStyle()}
          className="bg-[#1e1e1e] text-white p-6 rounded-2xl shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-felipa text-2xl text-[#FFD6E0]">
              {step.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <p className="font-kanit text-white/80 text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between">
            {/* Step Counter */}
            <div className="flex gap-1">
              {filteredSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? "bg-[#4ECDC4]" : "bg-white/20"}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg text-xs font-kanit text-white/60 hover:bg-white/10 transition-colors"
                >
                  ย้อนกลับ
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-kanit text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                {isLastStep ? "เสร็จสิ้น" : "ถัดไป"}
                {!isLastStep && <ArrowRight className="w-3 h-3" />}
                {isLastStep && <CheckCircle className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Arrow Tip for Top/Bottom (Visual flourish) */}
          {!isCentered && (
            <div className="absolute w-4 h-4 bg-[#1e1e1e] rotate-45 border-l border-t border-white/10"
              style={{
                // Simple positioning for arrow based on where the tooltip is relative to target
                ...(step.position === "top" ? { bottom: "-8px", left: "50%", marginLeft: "-8px", borderTop: "0", borderLeft: "0", borderBottom: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" } : {}),
                ...(step.position === "bottom" ? { top: "-8px", left: "50%", marginLeft: "-8px" } : {}),
                // Omitted specific arrow styles for left/right for simplicity, standard top/bottom covers most
              }}
            />
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Hook for manual triggering
export function useTutorial() {
  const { user } = useAuth();

  const resetTutorial = async () => {
    if (!user) return;
    try {
      await updateUserSettings(user.uid, { tutorialCompleted: false });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return { resetTutorial };
}
