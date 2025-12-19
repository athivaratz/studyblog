"use client";

import { motion } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { RetroButton, AddScheduleModal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCard } from "@/components/auth";
import { useSchedule, useSubjects } from "@/hooks/useFirebaseData";
import { 
  Calendar as CalendarIcon, 
  Plus,
  Loader2,
  Clock,
  MapPin,
  Trash2
} from "lucide-react";
import { useState, useMemo } from "react";

const dayNamesFull = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const dayColors = ["#FFD6E0", "#FFF3B0", "#FFD6E0", "#D4F5D4", "#FFE4C9", "#C5E8FF", "#E8D5F2"]; // Sun-Sat colors

const bgColors: Record<string, string> = {
  yellow: "#FFF3B0",
  pink: "#FFD6E0",
  blue: "#C5E8FF",
  green: "#D4F5D4",
  purple: "#E8D5F2",
  orange: "#FFE4C9",
};

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState(1); // Default Monday
  
  // Fetch ALL schedule items (no day filter)
  const { schedule, loading: scheduleLoading, addScheduleItem, removeScheduleItem } = useSchedule();
  const { subjects } = useSubjects();

  // Group schedule by day
  const scheduleByDay = useMemo(() => {
    const grouped: any[][] = Array.from({ length: 7 }, () => []);
    schedule.forEach(item => {
      if (item.dayOfWeek >= 0 && item.dayOfWeek <= 6) {
        grouped[item.dayOfWeek].push(item);
      }
    });
    // Sort each day by start time
    grouped.forEach(dayItems => {
      dayItems.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [schedule]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  if (!user) {
    return <LoginCard />;
  }

  const handleAddClick = (dayIndex: number) => {
    setSelectedDayForAdd(dayIndex);
    setIsAddModalOpen(true);
  };

  // Order: Mon(1) -> Sat(6) -> Sun(0)
  const displayDays = [1, 2, 3, 4, 5, 6, 0];

  return (
    <DesktopLayout>
      <div className="space-y-6 pb-20">
        <Navbar />

        <div className="flex items-center justify-between px-2">
             <h2 className="font-felipa text-3xl flex items-center gap-2 dark:text-white">
                  <CalendarIcon className="w-7 h-7 text-[#FF6B6B]" />
                  ตารางเรียน
             </h2>
        </div>

        {scheduleLoading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-[#FF6B6B]" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {displayDays.map((dayIndex) => (
                  <motion.div 
                    key={dayIndex} 
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.05 }}
                  >
                      {/* Day Header */}
                      <div 
                        className="p-3 rounded-xl border-2 border-black dark:border-white/20 flex items-center justify-between shadow-hard-sm"
                        style={{ backgroundColor: dayColors[dayIndex] }}
                      >
                          <span className="font-kanit font-bold text-lg text-black/80">
                            {dayNamesFull[dayIndex]}
                          </span>
                          <RetroButton size="sm" color="white" onClick={() => handleAddClick(dayIndex)}>
                              <Plus className="w-4 h-4" />
                          </RetroButton>
                      </div>

                      {/* Classes List */}
                      <div className="space-y-2 min-h-[100px]">
                          {scheduleByDay[dayIndex].map((item: any) => {
                              const subject = subjects.find(s => s.id === item.subjectId);
                              return (
                                  <motion.div 
                                      key={item.id}
                                      className="bg-white dark:bg-[#2D2D2D] border-2 border-black dark:border-white/20 rounded-xl p-3 relative group shadow-sm hover:shadow-md transition-all"
                                      whileHover={{ scale: 1.02 }}
                                  >
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                          <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm('ต้องการลบวิชานี้ใช่ไหม?')) {
                                                  removeScheduleItem(item.id);
                                                }
                                              }}
                                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                          >
                                              <Trash2 className="w-3 h-3" />
                                          </button>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                          <div 
                                              className="w-2 self-stretch rounded-full border border-black/10" 
                                              style={{ backgroundColor: bgColors[subject?.color || "yellow"] }}
                                          />
                                          <div className="flex-1 min-w-0">
                                              <h4 className="font-kanit font-semibold text-sm dark:text-white truncate pr-6">
                                                  {subject?.name || "ไม่ระบุวิชา"}
                                              </h4>
                                              <div className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60 mt-1.5">
                                                  <Clock className="w-3 h-3" />
                                                  <span className="font-mono">{item.startTime} - {item.endTime}</span>
                                              </div>
                                              {item.room && (
                                                  <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 mt-1">
                                                      <MapPin className="w-3 h-3" />
                                                      <span className="truncate">{item.room}</span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </motion.div>
                              )
                          })}
                          {scheduleByDay[dayIndex].length === 0 && (
                              <div className="h-full flex items-center justify-center py-8 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5">
                                  <p className="text-xs text-black/40 dark:text-white/40 font-kanit">ไม่มีเรียน</p>
                              </div>
                          )}
                      </div>
                  </motion.div>
              ))}
          </div>
        )}
      </div>

      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dayOfWeek={selectedDayForAdd}
        onAdd={addScheduleItem}
      />
    </DesktopLayout>
  );
}
