import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// =====================
// Types
// =====================

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  order: number;
  createdAt: Date;
}

export interface Homework {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  urgent: boolean;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  order: number;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "09:00"
  subjectId: string;
  room?: string;
  userId: string;
}

export interface UserStats {
  totalHomework: number;
  completedHomework: number;
  upcomingExams: number;
  averageScore: number;
  studyStreak: number;
  lastStudyDate: Date;
}

export interface UserSettings {
  tutorialCompleted: boolean;
  theme: "light" | "dark" | "auto";
  notifications: boolean;
  musicEnabled: boolean;
  preferredLanguage: "th" | "en";
}

// =====================
// Subjects
// =====================

export async function getSubjects(userId: string): Promise<Subject[]> {
  const q = query(
    collection(db, "subjects"),
    where("userId", "==", userId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Subject[];
}

export async function createSubject(
  userId: string,
  data: Omit<Subject, "id" | "userId" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "subjects"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSubject(
  subjectId: string,
  data: Partial<Subject>
): Promise<void> {
  await updateDoc(doc(db, "subjects", subjectId), data);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", subjectId));
}

// Default subjects for new users
export const defaultSubjects = [
  { name: "คณิตศาสตร์", icon: "calculator", color: "yellow", order: 0 },
  { name: "วิทยาศาสตร์", icon: "flask", color: "green", order: 1 },
  { name: "ภาษาอังกฤษ", icon: "globe", color: "blue", order: 2 },
  { name: "ภาษาไทย", icon: "book", color: "pink", order: 3 },
  { name: "ศิลปะ", icon: "palette", color: "purple", order: 4 },
  { name: "ดนตรี", icon: "music", color: "orange", order: 5 },
];

export async function initializeUserSubjects(userId: string): Promise<void> {
  // Don't create default subjects - let user add their own
  // Just ensure the user can access the subjects collection
  return Promise.resolve();
}

// =====================
// Homework
// =====================

export async function getHomework(userId: string): Promise<Homework[]> {
  const q = query(
    collection(db, "homework"),
    where("userId", "==", userId),
    orderBy("dueDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as Homework[];
}

export async function getHomeworkBySubject(
  userId: string,
  subjectId: string
): Promise<Homework[]> {
  const q = query(
    collection(db, "homework"),
    where("userId", "==", userId),
    where("subjectId", "==", subjectId),
    orderBy("dueDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Homework[];
}

export async function createHomework(
  userId: string,
  data: Omit<Homework, "id" | "userId" | "createdAt" | "completed">
): Promise<string> {
  // Filter out undefined values - Firestore doesn't accept undefined
  const cleanData: Record<string, unknown> = {
    title: data.title,
    subjectId: data.subjectId,
    dueDate: data.dueDate,
    urgent: data.urgent,
    userId,
    completed: false,
    createdAt: serverTimestamp(),
  };
  
  // Only add description if it has a value
  if (data.description !== undefined && data.description !== "") {
    cleanData.description = data.description;
  }
  
  const docRef = await addDoc(collection(db, "homework"), cleanData);
  return docRef.id;
}

export async function updateHomework(
  homeworkId: string,
  data: Partial<Homework>
): Promise<void> {
  await updateDoc(doc(db, "homework", homeworkId), data);
}

export async function completeHomework(homeworkId: string): Promise<void> {
  await updateDoc(doc(db, "homework", homeworkId), {
    completed: true,
    completedAt: serverTimestamp(),
  });
}

export async function deleteHomework(homeworkId: string): Promise<void> {
  await deleteDoc(doc(db, "homework", homeworkId));
}

// =====================
// Todos
// =====================

export async function getTodos(userId: string): Promise<Todo[]> {
  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Todo[];
}

export async function createTodo(
  userId: string,
  text: string,
  order: number
): Promise<string> {
  const docRef = await addDoc(collection(db, "todos"), {
    text,
    completed: false,
    userId,
    order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTodo(
  todoId: string,
  data: Partial<Todo>
): Promise<void> {
  await updateDoc(doc(db, "todos", todoId), data);
}

export async function deleteTodo(todoId: string): Promise<void> {
  await deleteDoc(doc(db, "todos", todoId));
}

// =====================
// Schedule
// =====================

export async function getSchedule(userId: string): Promise<Schedule[]> {
  const q = query(
    collection(db, "schedule"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Schedule[];
}

export async function getScheduleByDay(
  userId: string,
  dayOfWeek: number
): Promise<Schedule[]> {
  const q = query(
    collection(db, "schedule"),
    where("userId", "==", userId),
    where("dayOfWeek", "==", dayOfWeek)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Schedule[];
}

export async function createScheduleItem(
  userId: string,
  data: Omit<Schedule, "id" | "userId">
): Promise<string> {
  const docRef = await addDoc(collection(db, "schedule"), {
    ...data,
    userId,
  });
  return docRef.id;
}

export async function updateScheduleItem(
  scheduleId: string,
  data: Partial<Schedule>
): Promise<void> {
  await updateDoc(doc(db, "schedule", scheduleId), data);
}

export async function deleteScheduleItem(scheduleId: string): Promise<void> {
  await deleteDoc(doc(db, "schedule", scheduleId));
}

// =====================
// User Stats
// =====================

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, "userStats", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastStudyDate: data.lastStudyDate?.toDate() || new Date(),
    } as UserStats;
  }
  return null;
}

export async function updateUserStats(
  userId: string,
  data: Partial<UserStats>
): Promise<void> {
  await setDoc(doc(db, "userStats", userId), data, { merge: true });
}

export async function initializeUserStats(userId: string): Promise<void> {
  const existing = await getUserStats(userId);
  if (!existing) {
    await setDoc(doc(db, "userStats", userId), {
      totalHomework: 0,
      completedHomework: 0,
      upcomingExams: 0,
      averageScore: 0,
      studyStreak: 0,
      lastStudyDate: serverTimestamp(),
    });
  }
}

// =====================
// User Settings
// =====================

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const docRef = doc(db, "userSettings", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserSettings;
  }
  return null;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettings>
): Promise<void> {
  await setDoc(doc(db, "userSettings", userId), data, { merge: true });
}

export async function initializeUserSettings(userId: string): Promise<void> {
  const existing = await getUserSettings(userId);
  if (!existing) {
    await setDoc(doc(db, "userSettings", userId), {
      tutorialCompleted: false,
      theme: "light",
      notifications: true,
      musicEnabled: true,
      preferredLanguage: "th",
    });
  }
}

// =====================
// Initialize New User
// =====================

export async function initializeNewUser(userId: string): Promise<void> {
  await Promise.all([
    initializeUserSubjects(userId),
    initializeUserStats(userId),
    initializeUserSettings(userId),
  ]);
}
