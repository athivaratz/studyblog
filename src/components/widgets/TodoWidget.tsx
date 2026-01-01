"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTodos } from "@/hooks/useFirebaseData";
import { useTheme } from "@/contexts";

interface TodoWidgetProps {
  className?: string;
}

const colors = {
  light: ["#FFD6E0", "#C5E8FF", "#D4F5D4", "#E8D5F2", "#FFE4C9"],
  dark: ["#4D3540", "#35404D", "#354D35", "#453550", "#4D4035"]
};

export function TodoWidget({ className = "" }: TodoWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { todos, loading, addTodo, toggleTodo, removeTodo } = useTodos();
  const [newTodoText, setNewTodoText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTodo = async () => {
    if (newTodoText.trim() && !isAdding) {
      setIsAdding(true);
      try {
        await addTodo({
          text: newTodoText.trim(),
          category: "personal",
        });
        setNewTodoText("");
      } catch (error) {
        console.error("Failed to add todo:", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleToggle = async (id: string, currentCompleted: boolean) => {
    try {
      await toggleTodo(id, !currentCompleted);
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTodo(id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  // Get color for todo based on index and theme
  const getColor = (index: number) => {
    const colorSet = isDark ? colors.dark : colors.light;
    return colorSet[index % colorSet.length];
  };

  // Theme-aware colors
  const bgColor = isDark ? "#4A4530" : "#FFF3B0";
  const borderColor = isDark ? "#606060" : "#1A1A1A";
  const shadowColor = isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)";
  const tapeColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)";

  return (
    <motion.div
      className={`
        p-4 w-[280px] min-h-[320px]
        relative
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: `4px 4px 8px ${shadowColor}`,
      }}
      initial={{ opacity: 0, rotate: -3 }}
      animate={{ opacity: 1, rotate: -2 }}
    >
      {/* Tape */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm"
        style={{
          backgroundColor: tapeColor,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)'}`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pt-2">
        <span className="text-2xl">📝</span>
        <h3 className={`font-felipa text-xl ${isDark ? 'text-white' : 'text-black'}`}>To-Do List</h3>
      </div>

      {/* Todo list */}
      <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-white/40' : 'text-black/40'}`} />
          </div>
        ) : (
          <AnimatePresence>
            {todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="flex items-center gap-2 group"
              >
                <motion.button
                  onClick={() => handleToggle(todo.id, todo.completed)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: todo.completed ? getColor(index) : (isDark ? '#2A2A2A' : 'white'),
                    border: `2px solid ${borderColor}`,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {todo.completed && <Check className={`w-3 h-3 ${isDark ? 'text-white' : 'text-black'}`} />}
                </motion.button>

                <span
                  className={`
                    flex-1 font-kanit text-sm
                    ${isDark ? 'text-white' : 'text-black'}
                    ${todo.completed ? (isDark ? 'line-through text-white/40' : 'line-through text-black/40') : ''}
                  `}
                >
                  {todo.text}
                </span>

                <motion.button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-black/40'} hover:text-red-500`} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && todos.length === 0 && (
          <p className={`text-center font-kanit text-sm py-4 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
            ยังไม่มีรายการ
          </p>
        )}
      </div>

      {/* Add new todo */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="เพิ่มงาน..."
          disabled={isAdding}
          className={`
            flex-1 px-3 py-1.5 rounded-lg
            font-kanit text-sm
            focus:outline-none focus:ring-2
            disabled:opacity-50
            ${isDark 
              ? 'bg-[#1A1A1A] text-white placeholder:text-white/30 focus:ring-white/20' 
              : 'bg-white text-black placeholder:text-black/30 focus:ring-black/20'
            }
          `}
          style={{ border: `2px solid ${borderColor}` }}
        />
        <motion.button
          onClick={handleAddTodo}
          disabled={isAdding || !newTodoText.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: isDark ? '#354D35' : '#D4F5D4',
            border: `2px solid ${borderColor}`,
            boxShadow: `2px 2px 0px ${isDark ? '#404040' : '#1A1A1A'}`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAdding ? (
            <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
          ) : (
            <Plus className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
          )}
        </motion.button>
      </div>

      {/* Decorative lines */}
      <div className="absolute inset-x-4 top-16 bottom-16 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-full h-[1px] ${isDark ? 'bg-blue-400/20' : 'bg-blue-300/30'}`}
            style={{ marginTop: "24px" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
