"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Subject,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
} from "@/lib/firebaseServices";

interface SubjectContextType {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
    addSubject: (data: Omit<Subject, "id" | "userId" | "createdAt">) => Promise<string>;
    editSubject: (id: string, data: Partial<Subject>) => Promise<void>;
    removeSubject: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

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
        await fetchSubjects();
    };

    return (
        <SubjectContext.Provider
            value={{
                subjects,
                loading,
                error,
                addSubject,
                editSubject,
                removeSubject,
                refetch: fetchSubjects,
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
