import { Subject, Flashcard } from "./firebaseServices";

// =====================
// Types for AI-Generated Questions
// =====================

export interface GameQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[]; // 3 wrong answers for multiple choice
  difficulty: "easy" | "medium" | "hard";
  subjectId: string;
  subjectName: string;
  topic?: string;
  explanation?: string;
  source: "ai" | "csv" | "flashcard";
  createdAt: Date;
}

export interface QuizGenerationRequest {
  subject: Subject;
  topics?: string[]; // Optional specific topics
  flashcards?: Flashcard[]; // Existing flashcards for context
  count: number; // Number of questions to generate
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  gradeLevel?: string; // e.g., "ม.1", "ม.2", etc.
}

export interface QuizGenerationResponse {
  success: boolean;
  questions: GameQuestion[];
  error?: string;
}

// =====================
// CSV Import Types
// =====================

export interface CSVQuestionRow {
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  topic?: string;
  difficulty?: string;
}

// =====================
// Gemini API Functions (Client-side, calls API route)
// =====================

/**
 * Generate quiz questions using Gemini AI
 * Calls the API route which handles the actual Gemini API call
 */
export async function generateQuizQuestions(
  request: QuizGenerationRequest
): Promise<QuizGenerationResponse> {
  try {
    const response = await fetch("/api/gemini/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectName: request.subject.name,
        subjectId: request.subject.id,
        topics: request.topics,
        flashcardContext: request.flashcards?.map((f) => ({
          question: f.question,
          answer: f.answer,
        })),
        count: request.count,
        difficulty: request.difficulty || "mixed",
        gradeLevel: request.gradeLevel,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        questions: [],
        error: error.message || "Failed to generate questions",
      };
    }

    const data = await response.json();
    return {
      success: true,
      questions: data.questions.map((q: Omit<GameQuestion, "id" | "createdAt">, index: number) => ({
        ...q,
        id: `ai-${Date.now()}-${index}`,
        source: "ai" as const,
        createdAt: new Date(),
      })),
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      success: false,
      questions: [],
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อ AI",
    };
  }
}

/**
 * Research topic and generate questions based on subject curriculum
 */
export async function researchAndGenerateQuestions(
  subject: Subject,
  gradeLevel: string,
  count: number = 10
): Promise<QuizGenerationResponse> {
  try {
    const response = await fetch("/api/gemini/research-topic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectName: subject.name,
        subjectId: subject.id,
        gradeLevel,
        count,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        questions: [],
        error: error.message || "Failed to research topic",
      };
    }

    const data = await response.json();
    return {
      success: true,
      questions: data.questions.map((q: Omit<GameQuestion, "id" | "createdAt">, index: number) => ({
        ...q,
        id: `ai-research-${Date.now()}-${index}`,
        source: "ai" as const,
        createdAt: new Date(),
      })),
    };
  } catch (error) {
    console.error("Error researching topic:", error);
    return {
      success: false,
      questions: [],
      error: "เกิดข้อผิดพลาดในการ research หัวข้อ",
    };
  }
}

// =====================
// CSV Import Functions
// =====================

/**
 * Parse CSV file content and convert to GameQuestion format
 */
export function parseCSVQuestions(
  csvContent: string,
  subjectId: string,
  subjectName: string
): { questions: GameQuestion[]; errors: string[] } {
  const questions: GameQuestion[] = [];
  const errors: string[] = [];

  // Split by lines and filter empty lines
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    errors.push("ไฟล์ CSV ต้องมีอย่างน้อย 1 คำถาม (รวมหัวตาราง)");
    return { questions, errors };
  }

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma, but handle quoted strings
    const columns = parseCSVLine(line);

    if (columns.length < 5) {
      errors.push(`บรรทัดที่ ${i + 1}: ต้องมีอย่างน้อย 5 คอลัมน์ (คำถาม, คำตอบถูก, คำตอบผิด 3 ตัว)`);
      continue;
    }

    const [question, correctAnswer, wrong1, wrong2, wrong3, topic, difficulty] = columns;

    if (!question || !correctAnswer || !wrong1 || !wrong2 || !wrong3) {
      errors.push(`บรรทัดที่ ${i + 1}: ข้อมูลไม่ครบ`);
      continue;
    }

    questions.push({
      id: `csv-${Date.now()}-${i}`,
      question: question.trim(),
      correctAnswer: correctAnswer.trim(),
      wrongAnswers: [wrong1.trim(), wrong2.trim(), wrong3.trim()],
      difficulty: (difficulty?.toLowerCase() as "easy" | "medium" | "hard") || "medium",
      subjectId,
      subjectName,
      topic: topic?.trim(),
      source: "csv",
      createdAt: new Date(),
    });
  }

  return { questions, errors };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert flashcards to game questions format
 */
export function flashcardsToGameQuestions(
  flashcards: Flashcard[],
  subjectName: string
): GameQuestion[] {
  return flashcards.map((card) => {
    // Generate 3 wrong answers by shuffling other flashcard answers
    const otherAnswers = flashcards
      .filter((f) => f.id !== card.id)
      .map((f) => f.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // If not enough flashcards, use placeholder wrong answers
    while (otherAnswers.length < 3) {
      otherAnswers.push(`คำตอบที่ไม่ถูกต้อง ${otherAnswers.length + 1}`);
    }

    return {
      id: `flashcard-${card.id}`,
      question: card.question,
      correctAnswer: card.answer,
      wrongAnswers: otherAnswers,
      difficulty: getDifficultyFromStats(card),
      subjectId: card.subjectId,
      subjectName,
      source: "flashcard" as const,
      createdAt: card.createdAt,
    };
  });
}

/**
 * Determine difficulty based on flashcard performance stats
 */
function getDifficultyFromStats(card: Flashcard): "easy" | "medium" | "hard" {
  const total = card.correctCount + card.wrongCount;
  if (total === 0) return "medium";

  const accuracy = card.correctCount / total;
  if (accuracy >= 0.8) return "easy";
  if (accuracy <= 0.4) return "hard";
  return "medium";
}

// =====================
// Sample CSV Template
// =====================

export const CSV_TEMPLATE = `คำถาม,คำตอบที่ถูกต้อง,คำตอบผิด1,คำตอบผิด2,คำตอบผิด3,หัวข้อ(optional),ระดับความยาก(optional)
"2 + 2 เท่ากับเท่าไร?","4","3","5","6","บวกเลข","easy"
"เมืองหลวงของประเทศไทยคืออะไร?","กรุงเทพมหานคร","เชียงใหม่","ภูเก็ต","พัทยา","ภูมิศาสตร์","medium"`;

export function downloadCSVTemplate(): void {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quiz_template.csv";
  link.click();
}
