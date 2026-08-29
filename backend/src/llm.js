/**
 * Reca LLM layer — Gemini first (free tier), preset curriculum is the fallback.
 * Never call this from the browser; keys stay in backend/.env only.
 */

const MODEL =
  process.env.GEMINI_MODEL ||
  process.env.GOOGLE_GEMINI_MODEL ||
  "gemini-2.0-flash";

function apiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();
}

function isEnabled() {
  return Boolean(apiKey());
}

function providerLabel() {
  if (apiKey()) return `gemini:${MODEL}`;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic-unset";
  return "preset";
}

function stripFences(text) {
  return String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJson(text) {
  const raw = stripFences(text);
  try {
    return JSON.parse(raw);
  } catch (_) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("LLM returned non-JSON");
  }
}

async function generateJson(system, user) {
  const key = apiKey();
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`Gemini ${res.status}:`, errText.slice(0, 400));
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) {
      console.error("Gemini empty response", JSON.stringify(data).slice(0, 300));
      return null;
    }
    return parseJson(text);
  } catch (err) {
    console.error("Gemini call failed:", err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Explain a topic + exactly 2 short-answer practice questions (WAEC/JAMB level).
 * Returns { explanation, questions: [{ id, text, correctAnswer, accept, correction }] } or null.
 */
async function explainAndQuiz({ topicTitle, subject, studentAsk }) {
  const system = `You are Reca, a WhatsApp study companion for Nigerian WAEC and JAMB students (SS2/SS3).
Return ONLY valid JSON. No markdown.
Tone: plain, warm, short — like a sharp classmate, not a textbook.
Explanation: 3–5 sentences max.
Questions: exactly 2 short-answer items (not multiple choice). WAEC syllabus difficulty.
Each question needs a clear correctAnswer and 2–5 accept strings (common phrasings / synonyms).
correction: one short sentence if they get it wrong.`;

  const user = `Subject: ${subject || "Biology"}
Topic: ${topicTitle}
Student message: ${studentAsk || topicTitle}

Return JSON shape:
{
  "explanation": "string",
  "questions": [
    {
      "id": "q1",
      "text": "question text ending with ?",
      "correctAnswer": "canonical short answer",
      "accept": ["canonical", "synonym"],
      "correction": "short fix if wrong"
    },
    {
      "id": "q2",
      "text": "...",
      "correctAnswer": "...",
      "accept": ["..."],
      "correction": "..."
    }
  ]
}`;

  const data = await generateJson(system, user);
  if (!data?.explanation || !Array.isArray(data.questions) || data.questions.length < 2) {
    return null;
  }

  const questions = data.questions.slice(0, 2).map((q, i) => {
    const correct = String(q.correctAnswer || q.accept?.[0] || "").trim();
    const accept = Array.isArray(q.accept)
      ? q.accept.map(String).filter(Boolean)
      : [];
    if (correct && !accept.includes(correct)) accept.unshift(correct);
    return {
      id: String(q.id || `llm-q${i + 1}`),
      text: String(q.text || "").trim(),
      correctAnswer: correct,
      accept: accept.length ? accept : [correct],
      correction:
        String(q.correction || "").trim() ||
        (correct ? `Not quite — it's ${correct}.` : "Not quite."),
      options: accept.slice(0, 4),
    };
  });

  if (!questions[0].text || !questions[1].text || !questions[0].correctAnswer) {
    return null;
  }

  return {
    explanation: String(data.explanation).trim(),
    questions,
  };
}

/**
 * Grade a free-text answer (lenient on phrasing).
 * Returns { is_correct, feedback } or null.
 */
async function gradeAnswerLlm({ questionText, correctAnswer, accept, studentAnswer }) {
  const system = `You grade WAEC/JAMB short answers for Reca.
Be lenient on spelling and phrasing if the core concept is right.
Return ONLY JSON: { "is_correct": boolean, "feedback": "short plain correction if wrong, empty if correct" }`;

  const user = `Question: ${questionText}
Correct concept: ${correctAnswer}
Also accept: ${(accept || []).join("; ")}
Student answer: ${studentAnswer}`;

  const data = await generateJson(system, user);
  if (!data || typeof data.is_correct !== "boolean") return null;
  return {
    is_correct: data.is_correct,
    feedback: String(data.feedback || "").trim(),
  };
}

/**
 * Learn-mode answer grounded on a syllabus topic.
 * Returns { reply } or null.
 */
async function learnReply({ topicTitle, subject, explanation, studentAsk }) {
  const system = `You are Reca on WhatsApp. Answer the student's question about this syllabus topic.
Keep it to 4–6 short sentences. WAEC/JAMB level. No markdown headings.
End by inviting them to ask more or take a quiz.
Return ONLY JSON: { "reply": "string" }`;

  const user = `Subject: ${subject}
Topic: ${topicTitle}
Syllabus notes: ${explanation}
Student asked: ${studentAsk}`;

  const data = await generateJson(system, user);
  if (!data?.reply) return null;
  return { reply: String(data.reply).trim() };
}

/**
 * Vision: past question / notes photo → short explain + 2 quiz items.
 * imageBase64 without data: prefix; mimeType e.g. image/jpeg
 */
async function explainFromImage({ imageBase64, mimeType, note }) {
  const key = apiKey();
  if (!key || !imageBase64) return null;

  const system = `You are Reca, a WAEC/JAMB study companion.
The student uploaded a photo of notes or a past question.
Return ONLY JSON:
{
  "topicTitle": "short topic name",
  "subject": "Biology|Chemistry|Physics|Mathematics|Further Mathematics|English Language|Agriculture|Yoruba|Igbo|Hausa|General",
  "explanation": "3–5 plain sentences",
  "questions": [
    { "id": "q1", "text": "...?", "correctAnswer": "...", "accept": ["..."], "correction": "..." },
    { "id": "q2", "text": "...?", "correctAnswer": "...", "accept": ["..."], "correction": "..." }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35000);

  try {
    const cleaned = String(imageBase64 || "").replace(/^data:[^;]+;base64,/, "");
    const mimeRaw = String(mimeType || "image/jpeg").toLowerCase().split(";")[0].trim();
    const mime = mimeRaw === "image/jpg" ? "image/jpeg" : mimeRaw;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!allowed.has(mime)) return null;
    const approxBytes = Math.floor((cleaned.length * 3) / 4);
    if (approxBytes > Number(process.env.MAX_UPLOAD_BYTES || 1_500_000)) return null;
    const safeNote = String(note || "").trim().slice(0, 400);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  (safeNote ? `Student note: ${safeNote}\n\n` : "") +
                  "Explain this for WAEC/JAMB and give exactly 2 short-answer practice questions.",
              },
              {
                inlineData: {
                  mimeType: mime,
                  data: cleaned,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`Gemini vision ${res.status}:`, errText.slice(0, 400));
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) return null;
    const parsed = parseJson(text);
    if (!parsed?.explanation || !Array.isArray(parsed.questions) || parsed.questions.length < 2) {
      return null;
    }

    const questions = parsed.questions.slice(0, 2).map((q, i) => {
      const correct = String(q.correctAnswer || q.accept?.[0] || "").trim();
      const accept = Array.isArray(q.accept) ? q.accept.map(String).filter(Boolean) : [];
      if (correct && !accept.includes(correct)) accept.unshift(correct);
      return {
        id: String(q.id || `img-q${i + 1}`),
        text: String(q.text || "").trim(),
        correctAnswer: correct,
        accept: accept.length ? accept : [correct],
        correction:
          String(q.correction || "").trim() ||
          (correct ? `Not quite — it's ${correct}.` : "Not quite."),
        options: accept.slice(0, 4),
      };
    });

    return {
      topicTitle: String(parsed.topicTitle || "Uploaded question").trim(),
      subject: String(parsed.subject || "General").trim(),
      explanation: String(parsed.explanation).trim(),
      questions,
    };
  } catch (err) {
    console.error("Gemini vision failed:", err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Summarize official university / JAMB page text into a student admin update.
 * Returns { hasUpdate, headline, detail, actionHint, category } — hasUpdate false if nothing admission-relevant.
 */
async function summarizeUniAdmin({ universityName, shortName, sourceUrl, pageText }) {
  const system = `You extract Nigerian university admission admin updates for WAEC/JAMB students.
Rules:
- ONLY use facts explicitly present in the page text. Never invent dates, fees, links, or deadlines.
- If there is no clear admission, POST-UTME, screening, CAPS, registration, or result news, set hasUpdate to false.
- Write plain, short copy for WhatsApp — no markdown.
- category must be one of: admission, screening, results, deadline
Return ONLY JSON.`;

  const user = `University: ${universityName} (${shortName || universityName})
Official source: ${sourceUrl}

Page text (may be noisy HTML extraction):
"""
${String(pageText || "").slice(0, 12000)}
"""

Return JSON:
{
  "hasUpdate": boolean,
  "headline": "short headline under 80 chars",
  "detail": "2-3 sentences max — only facts from the page",
  "actionHint": "one practical next step for the student",
  "category": "admission|screening|results|deadline"
}`;

  const data = await generateJson(system, user);
  if (!data || data.hasUpdate !== true) {
    return { hasUpdate: false };
  }

  const headline = String(data.headline || "").trim();
  const detail = String(data.detail || "").trim();
  if (!headline || !detail) {
    return { hasUpdate: false };
  }

  return {
    hasUpdate: true,
    headline: headline.slice(0, 120),
    detail: detail.slice(0, 500),
    actionHint: String(data.actionHint || "Confirm on the official portal before you pay.")
      .trim()
      .slice(0, 200),
    category: String(data.category || "admission").trim().slice(0, 24),
  };
}

module.exports = {
  isEnabled,
  providerLabel,
  explainAndQuiz,
  gradeAnswerLlm,
  learnReply,
  explainFromImage,
  summarizeUniAdmin,
};
