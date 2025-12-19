"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTodos } from "@/hooks/useFirebaseData";

interface TodoWidgetProps {
  className?: string;
}

const colors = ["#FFD6E0", "#C5E8FF", "#D4F5D4", "#E8D5F2", "#FFE4C9"];

export function TodoWidget({ className = "" }: TodoWidgetProps) {
  const { todos, loading, addTodo, toggleTodo, removeTodo } = useTodos();
  const [newTodoText, setNewTodoText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTodo = async () => {
    if (newTodoText.trim() && !isAdding) {
      setIsAdding(true);
      try {
        await addTodo(newTodoText);
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

  // Get color for todo based on index
  const getColor = (index: number) => colors[index % colors.length];

  return (
    <motion.div
      className={`
        bg-[#FFF3B0] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/20
        p-4 w-[280px] min-h-[320px]
        relative
        ${className}
      `}
      initial={{ opacity: 0, rotate: -3 }}
      animate={{ opacity: 1, rotate: -2 }}
      style={{
        boxShadow: "4px 4px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Tape */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/70 dark:bg-white/20 border border-black/20 dark:border-white/20 rounded-sm" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pt-2">
        <span className="text-2xl">📝</span>
        <h3 className="font-felipa text-xl dark:text-white">To-Do List</h3>
      </div>

      {/* Todo list */}
      <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-black/40" />
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
                  className={`
                    w-5 h-5 rounded border-2 border-black dark:border-white/30
                    flex items-center justify-center
                    transition-colors cursor-pointer
                  `}
                  style={{ backgroundColor: todo.completed ? getColor(index) : "white" }}
                  whileTap={{ scale: 0.9 }}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </motion.button>

                <span
                  className={`
                    flex-1 font-kanit text-sm dark:text-white
                    ${todo.completed ? "line-through text-black/40 dark:text-white/40" : ""}
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
                  <X className="w-4 h-4 text-black/40 dark:text-white/40 hover:text-red-500" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && todos.length === 0 && (
          <p className="text-center font-kanit text-sm text-black/40 dark:text-white/40 py-4">
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
          className="
            flex-1 px-3 py-1.5
            bg-white dark:bg-[#1A1A1A] border-2 border-black dark:border-white/30 rounded-lg
            font-kanit text-sm dark:text-white
            placeholder:text-black/30 dark:placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
            disabled:opacity-50
          "
        />
        <motion.button
          onClick={handleAddTodo}
          disabled={isAdding || !newTodoText.trim()}
          className="
            w-8 h-8 bg-[#D4F5D4] dark:bg-[#2A4D2A] border-2 border-black dark:border-white/30 rounded-lg
            flex items-center justify-center
            shadow-hard-sm dark:shadow-none
            disabled:opacity-50 cursor-pointer
          "
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin dark:text-white" />
          ) : (
            <Plus className="w-4 h-4 dark:text-white" />
          )}
        </motion.button>
      </div>

      {/* Decorative lines */}
      <div className="absolute inset-x-4 top-16 bottom-16 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-[1px] bg-blue-300/30"
            style={{ marginTop: "24px" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
