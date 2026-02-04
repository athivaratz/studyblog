"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Subject,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    Homework,
    getHomework,
    Flashcard,
    getFlashcards,
    Schedule,
    getSchedule,
} from "@/lib/firebaseServices";

// =====================
// Subject Stats Interface
// =====================
export interface SubjectStats {
    subjectId: string;
    homeworkTotal: number;
    homeworkPending: number;
    homeworkCompleted: number;
    flashcardCount: number;
    scheduleCount: number;
}

export interface SubjectWithStats extends Subject {
    stats: SubjectStats;
}

interface SubjectContextType {
    // Core data
    subjects: Subject[];
    subjectsWithStats: SubjectWithStats[];
    loading: boolean;
    error: string | null;
    
    // CRUD operations
    addSubject: (data: Omit<Subject, "id" | "userId" | "createdAt">) => Promise<string>;
    editSubject: (id: string, data: Partial<Subject>) => Promise<void>;
    removeSubject: (id: string) => Promise<void>;
    reorderSubjects: (orderedIds: string[]) => Promise<void>;
    
    // Utility functions
    getSubjectById: (id: string) => Subject | undefined;
    getSubjectByName: (name: string) => Subject | undefined;
    getSubjectStats: (subjectId: string) => SubjectStats | undefined;
    
    // Related data (cached for quick access)
    allHomework: Homework[];
    allFlashcards: Flashcard[];
    allSchedule: Schedule[];
    
    // Refresh
    refetch: () => Promise<void>;
    refetchStats: () => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Related data for stats
    const [allHomework, setAllHomework] = useState<Homework[]>([]);
    const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
    const [allSchedule, setAllSchedule] = useState<Schedule[]>([]);

    // Fetch all subjects
    const fetchSubjects = useCallback(async () => {
        if (!user) {
            setSubjects([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await getSubjects(user.uid);
            setSubjects(data);
            setError(null);
        } catch (err) {
            setError("ไม่สามารถโหลดวิชาได้");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch related data for stats
    const fetchRelatedData = useCallback(async () => {
        if (!user) {
            setAllHomework([]);
            setAllFlashcards([]);
            setAllSchedule([]);
            return;
        }
        try {
            // Fetch each collection separately to handle partial failures
            const results = await Promise.allSettled([
                getHomework(user.uid),
                getFlashcards(user.uid),
                getSchedule(user.uid),
            ]);
            
            // Handle homework
            if (results[0].status === 'fulfilled') {
                setAllHomework(results[0].value);
            } else {
                console.warn("Failed to fetch homework:", results[0].reason);
                setAllHomework([]);
            }
            
            // Handle flashcards
            if (results[1].status === 'fulfilled') {
                setAllFlashcards(results[1].value);
            } else {
                console.warn("Failed to fetch flashcards:", results[1].reason);
                setAllFlashcards([]);
            }
            
            // Handle schedule
            if (results[2].status === 'fulfilled') {
                setAllSchedule(results[2].value);
            } else {
                console.warn("Failed to fetch schedule:", results[2].reason);
                setAllSchedule([]);
            }
        } catch (err) {
            console.error("Failed to fetch related data:", err);
            // Reset to empty arrays on error
            setAllHomework([]);
            setAllFlashcards([]);
            setAllSchedule([]);
        }
    }, [user]);

    useEffect(() => {
        fetchSubjects();
        fetchRelatedData();
    }, [fetchSubjects, fetchRelatedData]);

    // Compute stats for each subject
    const statsMap = useMemo(() => {
        const map = new Map<string, SubjectStats>();
        
        subjects.forEach(subject => {
            const subjectHomework = allHomework.filter(h => h.subjectId === subject.id);
            const subjectFlashcards = allFlashcards.filter(f => f.subjectId === subject.id);
            const subjectSchedule = allSchedule.filter(s => s.subjectId === subject.id);
            
            map.set(subject.id, {
                subjectId: subject.id,
                homeworkTotal: subjectHomework.length,
                homeworkPending: subjectHomework.filter(h => !h.completed).length,
                homeworkCompleted: subjectHomework.filter(h => h.completed).length,
                flashcardCount: subjectFlashcards.length,
                scheduleCount: subjectSchedule.length,
            });
        });
        
        return map;
    }, [subjects, allHomework, allFlashcards, allSchedule]);

    // Subjects with stats combined
    const subjectsWithStats = useMemo(() => {
        return subjects.map(subject => ({
            ...subject,
            stats: statsMap.get(subject.id) || {
                subjectId: subject.id,
                homeworkTotal: 0,
                homeworkPending: 0,
                homeworkCompleted: 0,
                flashcardCount: 0,
                scheduleCount: 0,
            },
        }));
    }, [subjects, statsMap]);

    // CRUD Operations
    const addSubject = async (data: Omit<Subject, "id" | "userId" | "createdAt">): Promise<string> => {
        if (!user) return "";
        const newId = await createSubject(user.uid, data);
        await fetchSubjects();
        return newId;
    };

    const editSubject = async (id: string, data: Partial<Subject>) => {
        await updateSubject(id, data);
        await fetchSubjects();
    };

    const removeSubject = async (id: string) => {
        await deleteSubject(id);
        await Promise.all([fetchSubjects(), fetchRelatedData()]);
    };

    const reorderSubjects = async (orderedIds: string[]) => {
        // Update order for each subject
        const updates = orderedIds.map((id, index) => 
            updateSubject(id, { order: index })
        );
        await Promise.all(updates);
        await fetchSubjects();
    };

    // Utility functions
    const getSubjectById = useCallback((id: string) => {
        return subjects.find(s => s.id === id);
    }, [subjects]);

    const getSubjectByName = useCallback((name: string) => {
        return subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    }, [subjects]);

    const getSubjectStats = useCallback((subjectId: string) => {
        return statsMap.get(subjectId);
    }, [statsMap]);

    return (
        <SubjectContext.Provider
            value={{
                subjects,
                subjectsWithStats,
                loading,
                error,
                addSubject,
                editSubject,
                removeSubject,
                reorderSubjects,
                getSubjectById,
                getSubjectByName,
                getSubjectStats,
                allHomework,
                allFlashcards,
                allSchedule,
                refetch: fetchSubjects,
                refetchStats: fetchRelatedData,
            }}
        >
            {children}
        </SubjectContext.Provider>
    );
}

export function useSubjectContext() {
    const context = useContext(SubjectContext);
    if (context === undefined) {
        throw new Error("useSubjectContext must be used within a SubjectsProvider");
    }
    return context;
}
