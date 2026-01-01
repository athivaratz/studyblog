"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSettings, updateUserSettings } from "@/lib/firebaseServices";
import { PaperCard, RetroButton } from "@/components/ui";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Music, 
  Timer,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "ยินดีต้อนรับสู่ studyblog! 🎉",
    description: "แอปผู้ช่วยจัดการการเรียนสไตล์ Y2K ที่จะทำให้การเรียนของคุณเป็นเรื่องสนุก",
    icon: <GraduationCap className="w-12 h-12" />,
    color: "yellow",
  },
  {
    id: "folders",
    title: "แฟ้มวิชาเรียน 📁",
    description: "จัดการวิชาเรียนด้วยระบบแฟ้มสีสันสดใส คลิกที่แท็บด้านบนเพื่อเปลี่ยนหมวดหมู่",
    icon: <BookOpen className="w-12 h-12" />,
    color: "pink",
    tip: "กดที่แฟ้มวิชาเพื่อดูรายละเอียดและการบ้าน",
  },
  {
    id: "schedule",
    title: "ตารางเรียน 📅",
    description: "ดูตารางเรียนรายวัน และกำหนดส่งการบ้านที่กำลังจะถึง",
    icon: <Calendar className="w-12 h-12" />,
    color: "blue",
    tip: "Sync กับ Google Calendar ได้ในอนาคต!",
  },
  {
    id: "timer",
    title: "นาฬิกาจับเวลา ⏱️",
    description: "กดที่นาฬิกาด้านซ้ายเพื่อสลับเป็นโหมดจับเวลา Pomodoro",
    icon: <Timer className="w-12 h-12" />,
    color: "green",
    tip: "ใช้เทคนิค Pomodoro 25 นาที พัก 5 นาที",
  },
  {
    id: "music",
    title: "เพลงประกอบการเรียน 🎵",
    description: "เปิดเพลง Lo-fi ช่วยให้สมาธิดีขึ้นขณะทำการบ้าน",
    icon: <Music className="w-12 h-12" />,
    color: "purple",
  },
  {
    id: "ready",
    title: "พร้อมแล้ว! ✨",
    description: "เริ่มต้นการเดินทางแห่งการเรียนรู้ของคุณได้เลย!",
    icon: <Sparkles className="w-12 h-12" />,
    color: "yellow",
  },
];

export function TutorialOverlay() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!user) return;
      
      try {
        const settings = await getUserSettings(user.uid);
        if (settings && !settings.tutorialCompleted) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error("Error checking tutorial status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTutorialStatus();
  }, [user]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    try {
      await updateUserSettings(user.uid, { tutorialCompleted: true });
      setShowTutorial(false);
    } catch (error) {
      console.error("Error completing tutorial:", error);
      setShowTutorial(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  if (loading || !showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const bgColors: Record<string, string> = {
    yellow: "bg-[#FFF3B0]",
    pink: "bg-[#FFD6E0]",
    blue: "bg-[#C5E8FF]",
    green: "bg-[#D4F5D4]",
    purple: "bg-[#E8D5F2]",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Tutorial Card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-md z-10"
        >
          <PaperCard color="white" className="p-6 relative overflow-hidden">
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/40" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2 }}
              className={`
                w-24 h-24 mx-auto mb-6 rounded-2xl
                ${bgColors[step.color]}
                border-3 border-black shadow-hard
                flex items-center justify-center
              `}
            >
              {step.icon}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <h2 className="font-felipa text-3xl">{step.title}</h2>
              <p className="font-kanit text-black/70">{step.description}</p>
              
              {step.tip && (
                <div className="mt-4 p-3 bg-[#FFF8E7] border-2 border-dashed border-black/20 rounded-xl">
                  <p className="font-kanit text-sm text-black/60">
                    💡 {step.tip}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 my-6">
              {tutorialSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full border border-black
                    ${index === currentStep ? "bg-[#FF6B6B]" : "bg-white"}
                  `}
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                  }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <RetroButton
                  onClick={handlePrev}
                  color="white"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ก่อนหน้า
                </RetroButton>
              )}
              
              <RetroButton
                onClick={isLastStep ? handleComplete : handleNext}
                color={isLastStep ? "green" : "yellow"}
                className="flex-1"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    เริ่มใช้งาน
                  </>
                ) : (
                  <>
                    ถัดไป
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </RetroButton>
            </div>
          </PaperCard>

          {/* Step counter */}
          <p className="text-center mt-4 font-kanit text-sm text-white/60">
            {currentStep + 1} / {tutorialSteps.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export a hook to manually trigger tutorial
export function useTutorial() {
  const { user } = useAuth();
  
  const resetTutorial = async () => {
    if (!user) return;
    await updateUserSettings(user.uid, { tutorialCompleted: false });
    window.location.reload();
  };

  return { resetTutorial };
}
