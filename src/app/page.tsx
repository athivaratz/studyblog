"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopLayout, Navbar, FolderLayout } from "@/components/layout";
import { PaperCard, IDCard, RetroButton, ThemeToggle, ProfileModal } from "@/components/ui";
import { MusicPlayer, ClockTimerSwap, TodoWidget, MobileUtilities } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCard } from "@/components/auth";
import { 
  useSubjects, 
  useHomework, 
  useSchedule, 
  useUserStats,
  useInitializeUser 
} from "@/hooks/useFirebaseData";
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Globe, 
  Palette,
  Music,
  Calendar,
  Star,
  Sparkles,
  Loader2,
  Plus,
  GraduationCap,
  Clock,
  User
} from "lucide-react";

// Icon mapping for subjects
const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator className="w-5 h-5" />,
  flask: <FlaskConical className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  book: <BookOpen className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
};

function DashboardContent() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { pendingHomework, urgentHomework, loading: homeworkLoading } = useHomework();
  const { stats } = useUserStats();

  const displayName = userProfile?.displayName?.split(" ")[0] || "นักเรียน";

  // Calculate homework counts per subject
  const getHomeworkCountForSubject = (subjectId: string) => {
    return pendingHomework.filter(h => h.subjectId === subjectId).length;
  };

  // Format due date
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "เลยกำหนดแล้ว!";
    if (days === 0) return "วันนี้!";
    if (days === 1) return "พรุ่งนี้";
    return `${days} วัน`;
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="font-felipa text-2xl lg:text-4xl mb-1 lg:mb-2 dark:text-white">สวัสดี, {displayName}!</h2>
          <p className="font-kanit text-sm lg:text-base text-black/60 dark:text-white/60">
            วันนี้คุณมีการบ้าน{" "}
            <span className="font-bold text-[#FF6B6B]">
              {pendingHomework.length} ชิ้น
            </span>{" "}
            ที่ต้องส่ง
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl lg:text-5xl"
        >
          📖
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        <PaperCard color="pink" className="text-center p-2 lg:p-4">
          <p className="font-felipa text-2xl lg:text-4xl mb-0 lg:mb-1 text-black dark:text-white">{pendingHomework.length}</p>
          <p className="font-kanit text-[10px] lg:text-sm text-black/60 dark:text-white/60">การบ้านค้าง</p>
        </PaperCard>
        <PaperCard color="blue" className="text-center p-2 lg:p-4">
          <p className="font-felipa text-2xl lg:text-4xl mb-0 lg:mb-1 text-black dark:text-white">{urgentHomework.length}</p>
          <p className="font-kanit text-[10px] lg:text-sm text-black/60 dark:text-white/60">เร่งด่วน</p>
        </PaperCard>
        <PaperCard color="green" className="text-center p-2 lg:p-4">
          <p className="font-felipa text-2xl lg:text-4xl mb-0 lg:mb-1 text-black dark:text-white">{stats?.averageScore || 0}%</p>
          <p className="font-kanit text-[10px] lg:text-sm text-black/60 dark:text-white/60">คะแนนเฉลี่ย</p>
        </PaperCard>
      </div>

      {/* Subject Folders Grid */}
      <div>
        <h3 className="font-felipa text-xl lg:text-2xl mb-2 lg:mb-4 flex items-center gap-2 dark:text-white">
          <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
          วิชาของฉัน
        </h3>
        
        {subjectsLoading ? (
          <div className="flex justify-center py-4 lg:py-8">
            <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-[#FF6B6B]" />
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <SubjectFolder 
                  name={subject.name}
                  icon={iconMap[subject.icon] || <BookOpen className="w-5 h-5" />}
                  color={subject.color}
                  homework={getHomeworkCountForSubject(subject.id)}
                  onClick={() => router.push('/subjects')}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <PaperCard color="cream" className="text-center py-4 lg:py-8">
            <GraduationCap className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 text-black/30 dark:text-white/30" />
            <p className="font-kanit text-sm lg:text-base text-black/60 dark:text-white/60">ยังไม่มีวิชา กดเพิ่มวิชาแรกของคุณ!</p>
            <RetroButton color="yellow" size="sm" className="mt-3 lg:mt-4" onClick={() => router.push('/subjects')}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มวิชา
            </RetroButton>
          </PaperCard>
        )}
      </div>

      {/* Upcoming Deadlines - Show less on mobile */}
      <div>
        <h3 className="font-felipa text-xl lg:text-2xl mb-2 lg:mb-4 dark:text-white">📅 กำหนดส่งที่ใกล้ถึง</h3>
        
        {homeworkLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6B6B]" />
          </div>
        ) : pendingHomework.length > 0 ? (
          <div className="space-y-2 lg:space-y-3">
            {pendingHomework.slice(0, 3).map((item, index) => {
              const isUrgent = item.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
              const subject = subjects.find(s => s.id === item.subjectId);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    flex items-center justify-between p-2 lg:p-4
                    border-2 border-black dark:border-white/20 rounded-xl
                    ${isUrgent ? "bg-[#FFD6E0] dark:bg-[#5C3A3A]" : "bg-white dark:bg-[#2D2D2D]"}
                  `}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`
                      w-2 h-2 lg:w-3 lg:h-3 rounded-full
                      ${isUrgent ? "bg-red-500 animate-pulse" : "bg-green-500"}
                    `} />
                    <div>
                      <p className="font-kanit text-sm lg:text-base font-medium dark:text-white">{item.title}</p>
                      <p className="font-kanit text-[10px] lg:text-xs text-black/50 dark:text-white/50">
                        {subject?.name || "ไม่ระบุวิชา"}
                      </p>
                    </div>
                  </div>
                  <span className={`
                    font-kanit text-[10px] lg:text-sm px-2 lg:px-3 py-0.5 lg:py-1 rounded-full border-2 border-black dark:border-white/30
                    ${isUrgent ? "bg-[#FF6B6B] text-white" : "bg-[#D4F5D4] dark:bg-[#2D4D2D] dark:text-white"}
                  `}>
                    {formatDueDate(item.dueDate)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <PaperCard color="green" className="text-center py-4 lg:py-6">
            <span className="text-2xl lg:text-4xl">🎉</span>
            <p className="font-kanit text-sm lg:text-base mt-2 dark:text-white">ไม่มีการบ้านค้าง! เก่งมาก!</p>
          </PaperCard>
        )}
      </div>
    </div>
  );
}

function SubjectFolder({ 
  name, 
  icon, 
  color, 
  homework,
  onClick
}: { 
  name: string; 
  icon: React.ReactNode; 
  color: string;
  homework: number;
  onClick?: () => void;
}) {
  const bgColors: Record<string, string> = {
    yellow: "bg-[#FFF3B0] dark:bg-[#4D4A2A]",
    pink: "bg-[#FFD6E0] dark:bg-[#5C3A42]",
    blue: "bg-[#C5E8FF] dark:bg-[#2A3A4D]",
    green: "bg-[#D4F5D4] dark:bg-[#2A4D2A]",
    purple: "bg-[#E8D5F2] dark:bg-[#3D2A4D]",
    orange: "bg-[#FFE4C9] dark:bg-[#4D3A2A]",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${bgColors[color] || bgColors.yellow}
        w-full aspect-square
        border-2 border-black dark:border-white/20 rounded-xl
        flex flex-col items-center justify-center gap-1 lg:gap-2
        shadow-hard-sm dark:shadow-none
        relative overflow-hidden
        cursor-pointer
      `}
      whileHover={{ 
        scale: 1.05, 
        rotate: 2,
        boxShadow: "5px 5px 0px #1A1A1A"
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Folder tab effect */}
      <div className={`
        absolute -top-1 left-2 right-8 h-2 lg:h-3
        ${bgColors[color] || bgColors.yellow} border-2 border-black dark:border-white/20 border-b-0
        rounded-t-lg
      `} />
      
      <span className="text-lg lg:text-2xl mt-1 lg:mt-2 dark:text-white">{icon}</span>
      <span className="font-kanit text-[10px] lg:text-xs font-medium text-center px-1 lg:px-2 text-black dark:text-white truncate w-full">{name}</span>
      
      {/* Homework badge */}
      {homework > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-6 lg:h-6 bg-[#FF6B6B] border-2 border-black dark:border-white/30 rounded-full flex items-center justify-center">
          <span className="font-kanit text-[8px] lg:text-xs text-white font-bold">{homework}</span>
        </div>
      )}
    </motion.button>
  );
}

function SubjectsContent() {
  const router = useRouter();
  const { subjects, loading } = useSubjects();
  const { pendingHomework } = useHomework();

  const getHomeworkCountForSubject = (subjectId: string) => {
    return pendingHomework.filter(h => h.subjectId === subjectId).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-felipa text-3xl">📚 วิชาเรียนทั้งหมด</h2>
        <RetroButton color="yellow" size="sm" onClick={() => router.push('/subjects')}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มวิชา
        </RetroButton>
      </div>
      
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <PaperCard 
              key={subject.id} 
              color={subject.color as "yellow" | "pink" | "blue" | "green" | "purple"}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-xl flex items-center justify-center text-2xl">
                  {iconMap[subject.icon] || <BookOpen className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-kanit font-semibold text-lg">{subject.name}</h3>
                  <p className="font-kanit text-sm text-black/60">
                    การบ้านค้าง: {getHomeworkCountForSubject(subject.id)} ชิ้น
                  </p>
                </div>
                <RetroButton 
                  color={subject.color as "yellow" | "pink" | "blue" | "green" | "purple"} 
                  size="sm"
                  onClick={() => router.push('/subjects')}
                >
                  เปิด
                </RetroButton>
              </div>
            </PaperCard>
          ))}
        </div>
      ) : (
        <PaperCard color="cream" className="text-center py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-black/30" />
          <h3 className="font-felipa text-2xl mb-2">ยังไม่มีวิชา</h3>
          <p className="font-kanit text-black/60 mb-4">เริ่มต้นด้วยการเพิ่มวิชาแรกของคุณ</p>
          <RetroButton color="yellow" onClick={() => router.push('/subjects')}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มวิชาใหม่
          </RetroButton>
        </PaperCard>
      )}
    </div>
  );
}

function ScheduleContent() {
  const { schedule, loading } = useSchedule(new Date().getDay());
  const { subjects } = useSubjects();
  
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const today = dayNames[new Date().getDay()];

  const bgColors: Record<string, string> = {
    yellow: "#FFF3B0",
    pink: "#FFD6E0",
    blue: "#C5E8FF",
    green: "#D4F5D4",
    purple: "#E8D5F2",
    orange: "#FFE4C9",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-felipa text-3xl">📆 ตารางเรียนวันนี้</h2>
        <span className="font-kanit text-sm text-black/60 bg-white px-4 py-2 border-2 border-black rounded-full">
          วัน{today}
        </span>
      </div>
      
      {schedule.length > 0 ? (
        <div className="space-y-3">
          {schedule.map((item, index) => {
            const subject = subjects.find(s => s.id === item.subjectId);
            const color = subject?.color || "yellow";
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 border-2 border-black rounded-xl bg-white"
              >
                <div 
                  className="w-4 h-16 rounded-full border-2 border-black"
                  style={{ backgroundColor: bgColors[color] }}
                />
                <div className="w-32">
                  <p className="font-mono text-sm font-bold">
                    {item.startTime} - {item.endTime}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-kanit font-semibold">{subject?.name || "ไม่ระบุวิชา"}</p>
                  <p className="font-kanit text-xs text-black/50">{item.room || "ไม่ระบุห้อง"}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <PaperCard color="blue" className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-black/30" />
          <h3 className="font-felipa text-2xl mb-2">วันนี้ไม่มีคาบเรียน</h3>
          <p className="font-kanit text-black/60">พักผ่อนหรือทบทวนบทเรียนได้เลย!</p>
        </PaperCard>
      )}
    </div>
  );
}

// Sidebar component
function Sidebar({ onProfileClick }: { onProfileClick: () => void }) {
  const { user, userProfile } = useAuth();
  
  return (
    <div className="space-y-4">
      {/* ID Card - Clickable for profile */}
      <motion.div
        onClick={onProfileClick}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <IDCard 
          name={userProfile?.displayName || user?.displayName || "นักเรียน"}
          studentId={userProfile?.studentId || "STUDENT"}
          school={userProfile?.school || "Studygram Academy"}
          photoURL={user?.photoURL || undefined}
        />
      </motion.div>
      
      {/* Clock/Timer Widget - Swappable */}
      <ClockTimerSwap />
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-[#FFF3B0] dark:bg-[#3D3A2A] border-3 border-black dark:border-white/30 rounded-2xl flex items-center justify-center shadow-hard dark:shadow-none"
        >
          <GraduationCap className="w-8 h-8" />
        </motion.div>
        <p className="font-kanit text-black/60 dark:text-white/60">กำลังโหลด Studygram...</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#FF6B6B] rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Mobile Header with Profile
function MobileHeader({ onProfileClick, onUtilitiesClick }: { onProfileClick: () => void; onUtilitiesClick: () => void }) {
  const { user, userProfile } = useAuth();

  return (
    <div className="lg:hidden flex items-center justify-between p-3 bg-[#FFFEF9] dark:bg-[#2D2D2D] border-2 border-black dark:border-white/20 rounded-2xl shadow-hard dark:shadow-none mx-2 mt-2">
      {/* Profile */}
      <motion.button
        onClick={onProfileClick}
        className="flex items-center gap-3"
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-black dark:border-white/30 overflow-hidden bg-[#FFF3B0] dark:bg-[#3D3A2A]">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-black/30 dark:text-white/30" />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="font-kanit font-medium text-sm dark:text-white">
            {userProfile?.displayName?.split(" ")[0] || "นักเรียน"}
          </p>
          <p className="font-kanit text-xs text-black/50 dark:text-white/50">
            {userProfile?.studentId || "STUDENT"}
          </p>
        </div>
      </motion.button>

      {/* Utilities button */}
      <motion.button
        onClick={onUtilitiesClick}
        className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] dark:bg-[#3D3A2A] text-white rounded-xl border-2 border-black dark:border-white/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Clock className="w-4 h-4" />
        <Music className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { loading: initLoading } = useInitializeUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileUtilities, setShowMobileUtilities] = useState(false);

  // Folder tabs
  const folderTabs = [
    {
      id: "dashboard",
      label: "หน้าหลัก",
      color: "yellow",
      icon: <Star className="w-4 h-4" />,
      content: <DashboardContent />,
    },
    {
      id: "subjects",
      label: "วิชาเรียน",
      color: "pink",
      icon: <BookOpen className="w-4 h-4" />,
      content: <SubjectsContent />,
    },
    {
      id: "schedule",
      label: "ตารางเรียน",
      color: "blue",
      icon: <Calendar className="w-4 h-4" />,
      content: <ScheduleContent />,
    },
  ];

  // Show loading screen
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginCard />;
  }

  // Show loading while initializing user data
  if (initLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Tutorial Overlay */}
      <TutorialOverlay />
      
      {/* Theme Toggle - Fixed Bottom Right */}
      <ThemeToggle />
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* Mobile Utilities Bottom Sheet */}
      <MobileUtilities 
        isOpen={showMobileUtilities} 
        onClose={() => setShowMobileUtilities(false)} 
      />

      {/* Mobile Header */}
      <MobileHeader 
        onProfileClick={() => setShowProfileModal(true)}
        onUtilitiesClick={() => setShowMobileUtilities(true)}
      />
      
      <DesktopLayout sidebar={<Sidebar onProfileClick={() => setShowProfileModal(true)} />}>
        <div className="space-y-6">
          <Navbar />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FolderLayout tabs={folderTabs} defaultTab="dashboard" />
          </motion.div>
          
          {/* Floating Todo Widget - Desktop only */}
          <motion.div
            className="fixed bottom-8 right-8 hidden xl:block z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TodoWidget />
          </motion.div>
        </div>
      </DesktopLayout>
    </>
  );
}
