import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAuthToken } from "@/lib/authVerify";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// =====================
// Generate Quiz Questions
// =====================

interface GenerateQuizRequest {
  subjectName: string;
  subjectId: string;
  topics?: string[];
  flashcardContext?: { question: string; answer: string }[];
  count: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  gradeLevel?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const verifiedUser = await verifyAuthToken(request);
    if (!verifiedUser) {
      return NextResponse.json(
        { message: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body: GenerateQuizRequest = await request.json();
    const { subjectName, subjectId, topics, flashcardContext, count, difficulty, gradeLevel } = body;

    if (!subjectName || !count) {
      return NextResponse.json(
        { message: "กรุณาระบุวิชาและจำนวนคำถาม" },
        { status: 400 }
      );
    }

    // Build the prompt
    const flashcardInfo = flashcardContext?.length
      ? `\n\nข้อมูลเนื้อหาที่ผู้ใช้เรียน:\n${flashcardContext
          .slice(0, 10)
          .map((f, i) => `${i + 1}. คำถาม: ${f.question} -> คำตอบ: ${f.answer}`)
          .join("\n")}`
      : "";

    const topicInfo = topics?.length
      ? `\nหัวข้อที่ต้องการ: ${topics.join(", ")}`
      : "";

    const gradeInfo = gradeLevel ? `\nระดับชั้น: ${gradeLevel}` : "";

    const difficultyGuide = {
      easy: "คำถามง่าย เหมาะสำหรับทบทวน ตอบได้โดยใช้ความจำพื้นฐาน",
      medium: "คำถามระดับกลาง ต้องใช้ความเข้าใจ",
      hard: "คำถามยาก ต้องใช้การวิเคราะห์และประยุกต์",
      mixed: "ผสมผสานทุกระดับความยาก",
    };

    const prompt = `คุณเป็นครูสอนวิชา${subjectName}สำหรับนักเรียนไทย${gradeInfo}
${topicInfo}${flashcardInfo}

สร้างคำถามแบบปรนัย 4 ตัวเลือก จำนวน ${count} ข้อ
ระดับความยาก: ${difficultyGuide[difficulty]}

**กฎสำคัญ:**
1. คำถามต้องชัดเจน กระชับ
2. คำตอบที่ถูกต้องต้องถูกต้อง 100%
3. คำตอบที่ผิดต้องดูสมจริง แต่ผิดอย่างชัดเจน
4. หลีกเลี่ยงคำถามที่คลุมเครือ
5. เนื้อหาต้องเหมาะสมกับระดับชั้น

ตอบเป็น JSON array เท่านั้น ไม่ต้องมี markdown code blocks:
[
  {
    "question": "คำถาม",
    "correctAnswer": "คำตอบที่ถูกต้อง",
    "wrongAnswers": ["คำตอบผิด1", "คำตอบผิด2", "คำตอบผิด3"],
    "difficulty": "easy|medium|hard",
    "topic": "หัวข้อ (optional)",
    "explanation": "คำอธิบายสั้นๆ ว่าทำไมคำตอบนี้ถูก (optional)"
  }
]`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let questions;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      questions = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { message: "AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง กรุณาลองใหม่" },
        { status: 500 }
      );
    }

    // Add subjectId and subjectName to each question
    const processedQuestions = questions.map((q: {
      question: string;
      correctAnswer: string;
      wrongAnswers: string[];
      difficulty?: string;
      topic?: string;
      explanation?: string;
    }) => ({
      ...q,
      subjectId,
      subjectName,
      difficulty: q.difficulty || "medium",
    }));

    return NextResponse.json({ questions: processedQuestions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการสร้างคำถาม" },
      { status: 500 }
    );
  }
}
