"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode } from "react";
import { FolderTab } from "../ui/FolderTab";

interface Tab {
  id: string;
  label: string;
  color: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface FolderLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function FolderLayout({ tabs, defaultTab }: FolderLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Folder Tabs */}
      <div className="flex items-end gap-0.5 lg:gap-1 px-2 lg:px-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FolderTab
              label={tab.label}
              color={tab.color}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Folder Content */}
      <motion.div
        className="
          bg-[#FFFEF9] dark:bg-[#2D2D2D] border-2 border-black dark:border-white/20 rounded-b-2xl rounded-tr-2xl
          min-h-[350px] lg:min-h-[500px] p-3 lg:p-6
          shadow-hard-lg dark:shadow-none
          relative
        "
        layout
      >
        {/* Paper texture lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-b-2xl rounded-tr-2xl dark:opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[1px] bg-blue-200/20"
              style={{ marginTop: i === 0 ? "40px" : "20px" }}
            />
          ))}
        </div>

        {/* Red margin line */}
        <div className="absolute left-8 lg:left-12 top-0 bottom-0 w-[1px] bg-red-300/40 dark:bg-red-500/20" />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>

        {/* Hole punches */}
        <div className="absolute left-2 lg:left-4 top-6 lg:top-8 space-y-12 lg:space-y-16">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 lg:w-4 lg:h-4 bg-[#F5E6D3] dark:bg-[#1A1A1A] border-2 border-black/20 dark:border-white/10 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
