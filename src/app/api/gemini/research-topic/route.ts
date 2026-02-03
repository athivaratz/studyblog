import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// =====================
// Research Topic and Generate Questions
// =====================

interface ResearchTopicRequest {
  subjectName: string;
  subjectId: string;
  gradeLevel: string;
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchTopicRequest = await request.json();
    const { subjectName, subjectId, gradeLevel, count } = body;

    if (!subjectName || !gradeLevel) {
      return NextResponse.json(
        { message: "กรุณาระบุวิชาและระดับชั้น" },
        { status: 400 }
      );
    }

    // Get Thai curriculum topics
    const curriculumPrompt = `ในหลักสูตรการศึกษาไทย วิชา${subjectName} ระดับชั้น${gradeLevel}
มีหัวข้อหลักอะไรบ้างที่นักเรียนต้องเรียน?

ตอบเป็น JSON array ของหัวข้อ เช่น:
["หัวข้อ1", "หัวข้อ2", "หัวข้อ3"]

ให้เพียง 5-8 หัวข้อหลักๆ`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // First, get curriculum topics
    const topicResult = await model.generateContent(curriculumPrompt);
    const topicText = topicResult.response.text();
    
    let topics: string[] = [];
    try {
      const cleanText = topicText.replace(/```json\n?|\n?```/g, "").trim();
      topics = JSON.parse(cleanText);
    } catch {
      // Default topics if parsing fails
      topics = [subjectName + " พื้นฐาน"];
    }

    // Now generate questions based on these topics
    const questionPrompt = `คุณเป็นครูสอนวิชา${subjectName}สำหรับนักเรียนไทย ระดับชั้น${gradeLevel}

หัวข้อในหลักสูตร: ${topics.join(", ")}

สร้างคำถามแบบปรนัย 4 ตัวเลือก จำนวน ${count} ข้อ
โดยกระจายให้ครอบคลุมหลายหัวข้อ และมีความยากหลากหลาย

**กฎสำคัญ:**
1. คำถามต้องตรงกับหลักสูตรไทย
2. ใช้ภาษาที่เข้าใจง่ายสำหรับนักเรียนระดับนี้
3. คำตอบที่ถูกต้องต้องถูกต้อง 100%
4. คำตอบที่ผิดต้องดูสมจริง
5. มีทั้งคำถามง่าย กลาง และยาก

ตอบเป็น JSON array เท่านั้น ไม่ต้องมี markdown code blocks:
[
  {
    "question": "คำถาม",
    "correctAnswer": "คำตอบที่ถูกต้อง",
    "wrongAnswers": ["คำตอบผิด1", "คำตอบผิด2", "คำตอบผิด3"],
    "difficulty": "easy|medium|hard",
    "topic": "หัวข้อของคำถามนี้",
    "explanation": "คำอธิบายสั้นๆ"
  }
]`;

    const questionResult = await model.generateContent(questionPrompt);
    const questionText = questionResult.response.text();

    let questions;
    try {
      const cleanText = questionText.replace(/```json\n?|\n?```/g, "").trim();
      questions = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse Gemini response:", questionText);
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

    return NextResponse.json({
      topics,
      questions: processedQuestions,
    });
  } catch (error) {
    console.error("Error researching topic:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการ research หัวข้อ" },
      { status: 500 }
    );
  }
}
