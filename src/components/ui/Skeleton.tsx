"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const highlightColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {
    backgroundColor: baseColor,
    width: width,
    height: height,
  };

  return (
    <div
      className={`${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

export function SkeletonCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#00568C";

  return (
    <div
      className="rounded-2xl border-2 p-4"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      <Skeleton variant="text" height={24} className="w-3/4 mb-3" />
      <Skeleton variant="text" height={16} className="w-full mb-2" />
      <Skeleton variant="text" height={16} className="w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={60} height={28} />
        <Skeleton variant="rounded" width={80} height={28} />
      </div>
    </div>
  );
}

export function SkeletonTodoItem() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ backgroundColor: cardBg, borderColor }}
    >
      <Skeleton variant="circular" width={24} height={24} />
      <div className="flex-1">
        <Skeleton variant="text" height={18} className="w-3/4 mb-1" />
        <Skeleton variant="text" height={14} className="w-1/2" />
      </div>
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
  );
}

export function SkeletonScheduleItem() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";

  return (
    <div
      className="rounded-xl border-2 p-3"
      style={{ backgroundColor: cardBg, borderColor: "#00568C" }}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" height={18} className="w-2/3 mb-2" />
          <Skeleton variant="text" height={14} className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <Skeleton variant="text" height={32} className="w-12 mx-auto mb-1" />
          <Skeleton variant="text" height={14} className="w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rounded" width={120} height={36} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>

      {/* Stats Card */}
      <SkeletonCard />

      {/* List */}
      <div className="space-y-3">
        <SkeletonTodoItem />
        <SkeletonTodoItem />
        <SkeletonTodoItem />
      </div>
    </div>
  );
}
