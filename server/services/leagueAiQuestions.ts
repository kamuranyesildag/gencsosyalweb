import { GoogleGenAI } from "@google/genai";
import { db } from "../../src/db/index.js";
import { leagueQuestions, leagueQuestionOptions } from "../../src/db/schema.js";
import { eq, ilike } from "drizzle-orm";

interface QuestionInput {
  question: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  ageGroup: "ALL" | "13-15" | "16-17" | "18+";
  explanation: string;
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
    isCorrect: boolean;
  }[];
}

export async function generateDraftQuestionsWithAI({
  category = "Tarih ve Kültür",
  difficulty = "MEDIUM",
  ageGroup = "ALL",
  count = 5,
}: {
  category?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  ageGroup?: "ALL" | "13-15" | "16-17" | "18+";
  count?: number;
}): Promise<{ createdCount: number; questions: any[]; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { 
        createdCount: 0, 
        questions: [], 
        error: "GEMINI_API_KEY ortam değişkeni bulunamadı." 
      };
    }

    const ai = new GoogleGenAI();
    const prompt = `
Sen 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı "Genç Sosyal Gençlik Ligi" için Türkçe bilgi yarışması soru hazırlayıcısısın.
Lütfen aşağıdaki parametrelere göre tam ${count} adet çoktan seçmeli soru üret.

Parametreler:
- Kategori: ${category}
- Zorluk Derecesi: ${difficulty} (EASY, MEDIUM, HARD, EXPERT)
- Hedef Yaş Grubu: ${ageGroup}
- Dil: Türkçe

Kurallar:
1. Her sorunun kesinlikle 4 seçeneği olmalıdır: "A", "B", "C", "D".
2. Seçeneklerden yalnızca BİR tanesi doğru (isCorrect: true) olmalıdır, diğer üçü yanlış (isCorrect: false) olmalıdır.
3. Sorular gerçek, doğrulanabilir ve güncel bilgilere dayanmalıdır. Belirsiz veya tartışmalı konulardan kaçın.
4. Açıklama (explanation) bölümünde neden o seçeneğin doğru olduğu gençlere öğretici bir dille özetlenmelidir.

Lütfen çıktıyı sadece aşağıdaki JSON şemasına uygun dizi (array) formatında ver:
[
  {
    "question": "Türkiye Cumhuriyeti'nin kurucusu Gazi Mustafa Kemal Atatürk, Milli Mücadele'yi başlatmak üzere Samsun'a hangi tarihte çıkmıştır?",
    "category": "${category}",
    "difficulty": "${difficulty}",
    "ageGroup": "${ageGroup}",
    "explanation": "Mustafa Kemal Paşa, 19 Mayıs 1919'da Bandırma Vapuru ile Samsun'a ayak basarak Milli Mücadele'yi fiilen başlatmıştır.",
    "options": [
      { "key": "A", "text": "23 Nisan 1920", "isCorrect": false },
      { "key": "B", "text": "19 Mayıs 1919", "isCorrect": true },
      { "key": "C", "text": "29 Ekim 1923", "isCorrect": false },
      { "key": "D", "text": "30 Ağustos 1922", "isCorrect": false }
    ]
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "[]";
    let parsed: QuestionInput[] = [];

    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", rawText);
      return { createdCount: 0, questions: [], error: "Yapay zeka yanıtı işlenemedi." };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { createdCount: 0, questions: [], error: "Uygun soru formatı üretilemedi." };
    }

    const insertedQuestions: any[] = [];

    for (const item of parsed) {
      if (!item.question || !Array.isArray(item.options) || item.options.length !== 4) {
        continue;
      }

      // Check single correct answer
      const correctOpts = item.options.filter(o => o.isCorrect);
      if (correctOpts.length !== 1) {
        continue;
      }

      // Check duplicate question text
      const cleanQ = item.question.trim();
      const existing = await db
        .select({ id: leagueQuestions.id })
        .from(leagueQuestions)
        .where(ilike(leagueQuestions.question, `%${cleanQ.substring(0, 50)}%`))
        .limit(1);

      if (existing.length > 0) {
        // Skip duplicate
        continue;
      }

      // Insert question with DRAFT status
      const [insertedQ] = await db.insert(leagueQuestions).values({
        question: cleanQ,
        category: item.category || category,
        difficulty: item.difficulty || difficulty,
        ageGroup: item.ageGroup || ageGroup,
        language: "tr",
        explanation: item.explanation?.trim() || null,
        sourceType: "AI",
        sourceReference: "Gemini 3.8 Flash Question Generator",
        status: "DRAFT", // AI generated questions start as DRAFT
      }).returning();

      // Insert 4 options
      for (const opt of item.options) {
        await db.insert(leagueQuestionOptions).values({
          questionId: insertedQ.id,
          optionKey: opt.key,
          optionText: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
        });
      }

      insertedQuestions.push(insertedQ);
    }

    return {
      createdCount: insertedQuestions.length,
      questions: insertedQuestions,
    };
  } catch (error: any) {
    console.error("AI question generation error:", error);
    return {
      createdCount: 0,
      questions: [],
      error: error?.message || "Yapay zeka ile soru üretilirken hata oluştu.",
    };
  }
}
