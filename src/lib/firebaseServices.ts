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
  category: "homework" | "personal" | "other"; // ประเภท
  subjectId?: string; // ถ้าเป็นการบ้านจะมี subjectId
  subjectName?: string; // ชื่อวิชา (for display)
  dueDate?: Date; // วันกำหนดส่ง
  userId: string;
  order: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  userId: string;
  // Spaced Repetition Data
  easeFactor: number; // 2.5 default, ยิ่งสูงยิ่งง่าย
  interval: number; // จำนวนวันก่อนทบทวนครั้งต่อไป
  repetitions: number; // จำนวนครั้งที่ตอบถูกติดต่อกัน
  nextReviewDate: Date; // วันที่ควรทบทวน
  lastReviewDate?: Date;
  correctCount: number;
  wrongCount: number;
  createdAt: Date;
}

export interface ReviewSession {
  id: string;
  userId: string;
  subjectId?: string;
  gameMode: "quiz" | "memory" | "speed";
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // seconds
  completedAt: Date;
}

// =====================
// Quiz Bank (AI-Generated & CSV Questions)
// =====================

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[]; // 3 wrong answers
  difficulty: "easy" | "medium" | "hard";
  subjectId: string;
  subjectName: string;
  topic?: string;
  explanation?: string;
  source: "ai" | "csv" | "flashcard";
  userId: string;
  timesUsed: number;
  correctRate: number; // 0-1
  createdAt: Date;
}

export interface QuizBank {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  questionIds: string[];
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "09:00"
  subjectId: string;
  subjectName?: string;
  room?: string;
  teacher?: string;
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
  // Custom Theme
  customColors?: {
    primary: string;
    accent: string;
  };
  // Pomodoro Settings
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;
}

// =====================
// NEW: Tags for Homework
// =====================

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}

// =====================
// NEW: Notes per Subject
// =====================

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// NEW: Study Goals
// =====================

export interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  targetType: "homework" | "quiz" | "study_hours" | "streak" | "custom";
  targetValue: number;
  currentValue: number;
  completed: boolean;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
}

// =====================
// NEW: Enhanced Study Statistics
// =====================

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  type: "pomodoro" | "free" | "review";
  durationMinutes: number;
  date: Date;
  completed: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  studyMinutes: number;
  homeworkCompleted: number;
  quizzesTaken: number;
  flashcardsReviewed: number;
}

// =====================
// NEW: Shared Quiz
// =====================

export interface SharedQuiz {
  id: string;
  quizBankId: string;
  shareCode: string; // 6-char unique code
  createdBy: string;
  createdByName: string;
  title: string;
  questionCount: number;
  expiresAt?: Date;
  createdAt: Date;
}

// Update Homework to include tags
export interface HomeworkWithTags extends Homework {
  tags?: string[]; // Tag IDs
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

export async function initializeUserSubjects(_userId: string): Promise<void> {
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
// Todos (New System)
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
    dueDate: doc.data().dueDate?.toDate(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as Todo[];
}

export async function createTodo(
  userId: string,
  data: {
    text: string;
    category: "homework" | "personal" | "other";
    subjectId?: string;
    subjectName?: string;
    dueDate?: Date;
    order: number;
  }
): Promise<string> {
  const cleanData: Record<string, unknown> = {
    text: data.text,
    category: data.category,
    completed: false,
    userId,
    order: data.order,
    createdAt: serverTimestamp(),
  };
  
  if (data.subjectId) cleanData.subjectId = data.subjectId;
  if (data.subjectName) cleanData.subjectName = data.subjectName;
  if (data.dueDate) cleanData.dueDate = data.dueDate;
  
  const docRef = await addDoc(collection(db, "todos"), cleanData);
  return docRef.id;
}

export async function updateTodo(
  todoId: string,
  data: Partial<Todo>
): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.completed) {
    updateData.completedAt = serverTimestamp();
  }
  await updateDoc(doc(db, "todos", todoId), updateData);
}

export async function deleteTodo(todoId: string): Promise<void> {
  await deleteDoc(doc(db, "todos", todoId));
}

// =====================
// Flashcards (Review System)
// =====================

export async function getFlashcards(userId: string, subjectId?: string): Promise<Flashcard[]> {
  let q;
  if (subjectId) {
    q = query(
      collection(db, "flashcards"),
      where("userId", "==", userId),
      where("subjectId", "==", subjectId)
    );
  } else {
    q = query(
      collection(db, "flashcards"),
      where("userId", "==", userId)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    nextReviewDate: doc.data().nextReviewDate?.toDate() || new Date(),
    lastReviewDate: doc.data().lastReviewDate?.toDate(),
  })) as Flashcard[];
}

export async function getFlashcardsDueForReview(userId: string): Promise<Flashcard[]> {
  const now = new Date();
  const q = query(
    collection(db, "flashcards"),
    where("userId", "==", userId),
    where("nextReviewDate", "<=", now)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    nextReviewDate: doc.data().nextReviewDate?.toDate() || new Date(),
    lastReviewDate: doc.data().lastReviewDate?.toDate(),
  })) as Flashcard[];
}

export async function createFlashcard(
  userId: string,
  data: { question: string; answer: string; subjectId: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, "flashcards"), {
    question: data.question,
    answer: data.answer,
    subjectId: data.subjectId,
    userId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date(),
    correctCount: 0,
    wrongCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// SM-2 Spaced Repetition Algorithm
export async function updateFlashcardAfterReview(
  flashcardId: string,
  quality: number // 0-5: 0=blackout, 5=perfect
): Promise<void> {
  const docRef = doc(db, "flashcards", flashcardId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return;
  
  const card = docSnap.data();
  let { easeFactor, interval, repetitions, correctCount, wrongCount } = card;
  
  if (quality >= 3) {
    // Correct answer
    correctCount++;
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Wrong answer
    wrongCount++;
    repetitions = 0;
    interval = 1;
  }
  
  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  await updateDoc(docRef, {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: serverTimestamp(),
    correctCount,
    wrongCount,
  });
}

export async function deleteFlashcard(flashcardId: string): Promise<void> {
  await deleteDoc(doc(db, "flashcards", flashcardId));
}

// =====================
// Review Sessions
// =====================

export async function saveReviewSession(
  userId: string,
  data: Omit<ReviewSession, "id" | "userId" | "completedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "reviewSessions"), {
    ...data,
    userId,
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getReviewSessions(userId: string, limit = 10): Promise<ReviewSession[]> {
  const q = query(
    collection(db, "reviewSessions"),
    where("userId", "==", userId),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate() || new Date(),
  })) as ReviewSession[];
}

// =====================
// Schedule
// =====================

export async function getSchedule(userId: string): Promise<Schedule[]> {
  const q = query(
    collection(db, "schedules"),
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
    collection(db, "schedules"),
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
  // Filter out undefined values (Firestore doesn't accept undefined)
  const cleanData: Record<string, unknown> = { userId };
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  
  const docRef = await addDoc(collection(db, "schedules"), cleanData);
  return docRef.id;
}

export async function updateScheduleItem(
  scheduleId: string,
  data: Partial<Schedule>
): Promise<void> {
  // Filter out undefined values
  const cleanData: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  await updateDoc(doc(db, "schedules", scheduleId), cleanData);
}

export async function deleteScheduleItem(scheduleId: string): Promise<void> {
  await deleteDoc(doc(db, "schedules", scheduleId));
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

// =====================
// Quiz Questions (AI-Generated & CSV)
// =====================

export async function getQuizQuestions(
  userId: string,
  subjectId?: string
): Promise<QuizQuestion[]> {
  let q;
  if (subjectId) {
    q = query(
      collection(db, "quizQuestions"),
      where("userId", "==", userId),
      where("subjectId", "==", subjectId)
    );
  } else {
    q = query(
      collection(db, "quizQuestions"),
      where("userId", "==", userId)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as QuizQuestion[];
}

export async function createQuizQuestion(
  userId: string,
  data: Omit<QuizQuestion, "id" | "userId" | "createdAt" | "timesUsed" | "correctRate">
): Promise<string> {
  const docRef = await addDoc(collection(db, "quizQuestions"), {
    ...data,
    userId,
    timesUsed: 0,
    correctRate: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createQuizQuestionsBatch(
  userId: string,
  questions: Omit<QuizQuestion, "id" | "userId" | "createdAt" | "timesUsed" | "correctRate">[]
): Promise<string[]> {
  const ids: string[] = [];
  for (const question of questions) {
    const id = await createQuizQuestion(userId, question);
    ids.push(id);
  }
  return ids;
}

export async function updateQuizQuestion(
  questionId: string,
  data: Partial<QuizQuestion>
): Promise<void> {
  await updateDoc(doc(db, "quizQuestions", questionId), data);
}

export async function updateQuizQuestionStats(
  questionId: string,
  wasCorrect: boolean
): Promise<void> {
  const docRef = doc(db, "quizQuestions", questionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return;
  
  const data = docSnap.data();
  const newTimesUsed = (data.timesUsed || 0) + 1;
  const currentCorrect = (data.timesUsed || 0) * (data.correctRate || 0);
  const newCorrectRate = (currentCorrect + (wasCorrect ? 1 : 0)) / newTimesUsed;
  
  await updateDoc(docRef, {
    timesUsed: newTimesUsed,
    correctRate: newCorrectRate,
  });
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  await deleteDoc(doc(db, "quizQuestions", questionId));
}

export async function deleteQuizQuestionsBySubject(
  userId: string,
  subjectId: string
): Promise<void> {
  const questions = await getQuizQuestions(userId, subjectId);
  await Promise.all(questions.map((q) => deleteQuizQuestion(q.id)));
}

// =====================
// Quiz Banks
// =====================

export async function getQuizBanks(userId: string): Promise<QuizBank[]> {
  const q = query(
    collection(db, "quizBanks"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as QuizBank[];
}

export async function createQuizBank(
  userId: string,
  data: Omit<QuizBank, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "quizBanks"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateQuizBank(
  bankId: string,
  data: Partial<QuizBank>
): Promise<void> {
  await updateDoc(doc(db, "quizBanks", bankId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuizBank(bankId: string): Promise<void> {
  await deleteDoc(doc(db, "quizBanks", bankId));
}

// =====================
// Tags CRUD
// =====================

export async function getTags(userId: string): Promise<Tag[]> {
  const q = query(
    collection(db, "tags"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Tag[];
}

export async function createTag(
  userId: string,
  data: { name: string; color: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, "tags"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTag(
  tagId: string,
  data: Partial<Tag>
): Promise<void> {
  await updateDoc(doc(db, "tags", tagId), data);
}

export async function deleteTag(tagId: string): Promise<void> {
  await deleteDoc(doc(db, "tags", tagId));
}

// =====================
// Notes CRUD
// =====================

export async function getNotes(userId: string, subjectId?: string): Promise<Note[]> {
  let q;
  if (subjectId) {
    q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      where("subjectId", "==", subjectId),
      orderBy("updatedAt", "desc")
    );
  } else {
    q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Note[];
}

export async function createNote(
  userId: string,
  data: { subjectId: string; title: string; content: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, "notes"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateNote(
  noteId: string,
  data: Partial<Note>
): Promise<void> {
  await updateDoc(doc(db, "notes", noteId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, "notes", noteId));
}

// =====================
// Study Goals CRUD
// =====================

export async function getStudyGoals(userId: string): Promise<StudyGoal[]> {
  const q = query(
    collection(db, "studyGoals"),
    where("userId", "==", userId),
    orderBy("targetDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as StudyGoal[];
}

export async function createStudyGoal(
  userId: string,
  data: Omit<StudyGoal, "id" | "userId" | "createdAt" | "currentValue" | "completed">
): Promise<string> {
  const docRef = await addDoc(collection(db, "studyGoals"), {
    ...data,
    userId,
    currentValue: 0,
    completed: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateStudyGoal(
  goalId: string,
  data: Partial<StudyGoal>
): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.completed) {
    updateData.completedAt = serverTimestamp();
  }
  await updateDoc(doc(db, "studyGoals", goalId), updateData);
}

export async function deleteStudyGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, "studyGoals", goalId));
}

// =====================
// Study Sessions CRUD
// =====================

export async function getStudySessions(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<StudySession[]> {
  let q = query(
    collection(db, "studySessions"),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  
  const snapshot = await getDocs(q);
  let sessions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
  })) as StudySession[];

  // Filter by date range if provided
  if (startDate) {
    sessions = sessions.filter(s => s.date >= startDate);
  }
  if (endDate) {
    sessions = sessions.filter(s => s.date <= endDate);
  }
  
  return sessions;
}

export async function createStudySession(
  userId: string,
  data: Omit<StudySession, "id" | "userId">
): Promise<string> {
  const docRef = await addDoc(collection(db, "studySessions"), {
    ...data,
    userId,
  });
  return docRef.id;
}

export async function updateStudySession(
  sessionId: string,
  data: Partial<StudySession>
): Promise<void> {
  await updateDoc(doc(db, "studySessions", sessionId), data);
}

// =====================
// Shared Quiz CRUD
// =====================

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getSharedQuizByCode(shareCode: string): Promise<SharedQuiz | null> {
  const q = query(
    collection(db, "sharedQuizzes"),
    where("shareCode", "==", shareCode.toUpperCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  // Check if expired
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return null;
  }
  
  return {
    id: doc.id,
    ...data,
    expiresAt: data.expiresAt?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
  } as SharedQuiz;
}

export async function createSharedQuiz(
  userId: string,
  userName: string,
  quizBankId: string,
  title: string,
  questionCount: number,
  expiresInDays?: number
): Promise<SharedQuiz> {
  const shareCode = generateShareCode();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  const docRef = await addDoc(collection(db, "sharedQuizzes"), {
    quizBankId,
    shareCode,
    createdBy: userId,
    createdByName: userName,
    title,
    questionCount,
    expiresAt,
    createdAt: serverTimestamp(),
  });
  
  return {
    id: docRef.id,
    quizBankId,
    shareCode,
    createdBy: userId,
    createdByName: userName,
    title,
    questionCount,
    expiresAt: expiresAt || undefined,
    createdAt: new Date(),
  };
}

export async function deleteSharedQuiz(sharedQuizId: string): Promise<void> {
  await deleteDoc(doc(db, "sharedQuizzes", sharedQuizId));
}

// =====================
// Daily Stats (for streak tracking)
// =====================

export async function getDailyStats(
  userId: string,
  days: number = 30
): Promise<DailyStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, "dailyStats"),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as DailyStats[];
}

export async function updateDailyStats(
  userId: string,
  date: string,
  updates: Partial<Omit<DailyStats, "date">>
): Promise<void> {
  const docId = `${userId}_${date}`;
  const docRef = doc(db, "dailyStats", docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const current = docSnap.data();
    await updateDoc(docRef, {
      studyMinutes: (current.studyMinutes || 0) + (updates.studyMinutes || 0),
      homeworkCompleted: (current.homeworkCompleted || 0) + (updates.homeworkCompleted || 0),
      quizzesTaken: (current.quizzesTaken || 0) + (updates.quizzesTaken || 0),
      flashcardsReviewed: (current.flashcardsReviewed || 0) + (updates.flashcardsReviewed || 0),
    });
  } else {
    await setDoc(docRef, {
      userId,
      date,
      studyMinutes: updates.studyMinutes || 0,
      homeworkCompleted: updates.homeworkCompleted || 0,
      quizzesTaken: updates.quizzesTaken || 0,
      flashcardsReviewed: updates.flashcardsReviewed || 0,
    });
  }
}

// Calculate study streak
export async function calculateStudyStreak(userId: string): Promise<number> {
  const stats = await getDailyStats(userId, 365);
  if (stats.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const sortedStats = stats.sort((a, b) => b.date.localeCompare(a.date));
  
  for (let i = 0; i < sortedStats.length; i++) {
    const stat = sortedStats[i];
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split("T")[0];
    
    if (stat.date === expectedDateStr && stat.studyMinutes > 0) {
      streak++;
    } else if (i === 0 && stat.date !== today) {
      // Allow missing today
      continue;
    } else {
      break;
    }
  }
  
  return streak;
}

// =====================
// Global Search
// =====================

export interface SearchResult {
  type: "homework" | "subject" | "note" | "flashcard" | "goal";
  id: string;
  title: string;
  subtitle?: string;
  subjectId?: string;
  subjectName?: string;
}

export async function globalSearch(
  userId: string,
  searchQuery: string
): Promise<SearchResult[]> {
  const query_lower = searchQuery.toLowerCase();
  const results: SearchResult[] = [];
  
  // Search subjects
  const subjects = await getSubjects(userId);
  subjects.forEach(s => {
    if (s.name.toLowerCase().includes(query_lower)) {
      results.push({
        type: "subject",
        id: s.id,
        title: s.name,
      });
    }
  });
  
  // Search homework
  const homework = await getHomework(userId);
  homework.forEach(h => {
    if (h.title.toLowerCase().includes(query_lower) || 
        h.description?.toLowerCase().includes(query_lower)) {
      const subject = subjects.find(s => s.id === h.subjectId);
      results.push({
        type: "homework",
        id: h.id,
        title: h.title,
        subtitle: h.description,
        subjectId: h.subjectId,
        subjectName: subject?.name,
      });
    }
  });
  
  // Search notes
  const notes = await getNotes(userId);
  notes.forEach(n => {
    if (n.title.toLowerCase().includes(query_lower) ||
        n.content.toLowerCase().includes(query_lower)) {
      const subject = subjects.find(s => s.id === n.subjectId);
      results.push({
        type: "note",
        id: n.id,
        title: n.title,
        subtitle: n.content.substring(0, 50),
        subjectId: n.subjectId,
        subjectName: subject?.name,
      });
    }
  });
  
  // Search flashcards
  const flashcards = await getFlashcards(userId);
  flashcards.forEach(f => {
    if (f.question.toLowerCase().includes(query_lower) ||
        f.answer.toLowerCase().includes(query_lower)) {
      const subject = subjects.find(s => s.id === f.subjectId);
      results.push({
        type: "flashcard",
        id: f.id,
        title: f.question,
        subtitle: f.answer.substring(0, 50),
        subjectId: f.subjectId,
        subjectName: subject?.name,
      });
    }
  });
  
  // Search goals
  const goals = await getStudyGoals(userId);
  goals.forEach(g => {
    if (g.title.toLowerCase().includes(query_lower) ||
        g.description?.toLowerCase().includes(query_lower)) {
      results.push({
        type: "goal",
        id: g.id,
        title: g.title,
        subtitle: g.description,
      });
    }
  });
  
  return results;
}
