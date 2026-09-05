const { copy } = require("./copy");
const {
  findTopic,
  findTopicById,
  resolveLearnQuery,
  conceptExplanation,
  teachExplanation,
  followUpIntent,
  topicLabel,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
  topics,
} = require("./topics");
const store = require("./store");
const llm = require("./llm");
const uniData = require("./data/uni-updates");
const uniFeed = require("./uni-feed");
const {
  resolveDiagramPack,
  formatPackReply,
  questionsFromPack,
  packToTopic,
  findPackById,
  missingPackCopy,
} = require("./data/diagram-packs");

const resurfaceMinutes = Number(process.env.RESURFACE_MINUTES || 2);

function teachBite(topic, depth) {
  const qs = topic.questions || [];
  if (!qs.length) return null;
  const q = qs[depth % qs.length];
  const point = q.correctAnswer || (q.accept && q.accept[0]) || "";
  if (!point) return null;
  return `Another angle: ${point}`;
}

function spellingPreface(corrections) {
  if (!corrections?.length) return "";
  const bits = corrections
    .slice(0, 4)
    .map((c) => `you wrote “${c.typed}”. It’s spelled “${c.correct}”`);
  return `Spelling check: ${bits.join("; ")}.`;
}

function withSpelling(corrections, body) {
  const preface = spellingPreface(corrections);
  if (!preface) return body;
  return `${preface}\n\n${body}`;
}

function resolveTopicOrPack(id) {
  if (!id) return null;
  return findTopicById(id) || (findPackById(id) ? packToTopic(findPackById(id)) : null);
}

/** Serve curated labelled diagram. withQuiz arms pending Q1 (WhatsApp). Web uses Try 2 CTA. */
function serveDiagramPack(student, pack, corrections, opts = {}) {
  const withQuiz = Boolean(opts.withQuiz);
  const topic = packToTopic(pack);
  const questions = questionsFromPack(pack, 2);
  student.learnFocusId = pack.id;
  student.learnDepth = 0;

  let body = formatPackReply(pack);
  if (withQuiz && questions[0]) {
    student.pending = {
      kind: "diagram-pack",
      topicId: pack.id,
      subject: topic.subject,
      step: "q1",
      topic: {
        ...topic,
        questions,
      },
      q1Correct: null,
      q2Correct: null,
    };
    body = `${body}\n\nQuick check 1/2: ${questions[0].text}`;
  } else {
    student.pending = null;
    body = `${body}\n\nWhen you’re ready, try 2 quick questions on the labels.`;
  }

  const text = withSpelling(corrections, body);
  return [
    {
      text,
      image: {
        src: pack.src,
        caption: pack.title,
        alt: pack.alt || pack.title,
        labelled: true,
      },
    },
  ];
}

async function gradeWithFallback(question, text) {
  if (llm.isEnabled()) {
    const result = await llm.gradeAnswerLlm({
      questionText: question.text,
      correctAnswer: question.correctAnswer,
      accept: question.accept || [question.correctAnswer],
      studentAnswer: text,
    });
    if (result) {
      return {
        ok: result.is_correct,
        feedback: result.feedback || null,
      };
    }
  }
  return { ok: gradeAnswer(question, text), feedback: null };
}

/** Learn follow-up while staying on the focused topic. */
async function learnFollowUp(student, topic, text, corrections) {
  const label = topicLabel(topic);
  const intent = followUpIntent(text);
  const depth = student.learnDepth || 0;

  if (llm.isEnabled()) {
    const ai = await llm.learnReply({
      topicTitle: label,
      subject: topic.subject,
      explanation: topic.explanation,
      studentAsk: text,
      intent,
      depth,
    });
    if (ai?.reply) {
      student.learnDepth = depth + 1;
      return [withSpelling(corrections, ai.reply)];
    }
  }

  student.learnDepth = depth + 1;
  const body = teachExplanation(topic, { mode: intent, depth });
  return [withSpelling(corrections, body)];
}

async function handleIncoming(phone, body, opts = {}) {
  const text = String(body || "").trim();
  const student = store.getStudent(phone);

  try {
    // Learn asks always win — never grade a question as a recall answer
    if (opts.mode === "learn") {
      student.awaitingResurface = null;

      // Continue labelled-diagram quiz if already armed
      if (student.pending?.kind === "diagram-pack") {
        return handlePendingAnswer(student, text);
      }

      student.pending = null;

      // Labelled diagram packs before free-topic Learn (curated keys only)
      const packHit = resolveDiagramPack(text);
      if (packHit.pack) {
        return serveDiagramPack(student, packHit.pack, []);
      }
      if (packHit.wantedButMissing) {
        return [missingPackCopy()];
      }

      const resolved = resolveLearnQuery(
        text,
        opts.topicId || student.learnFocusId
      );
      let topic = resolved.topic;
      const corrections = resolved.corrections || [];

      if (!topic && opts.topicId) topic = resolveTopicOrPack(opts.topicId);
      if (!topic && student.learnFocusId) {
        topic = resolveTopicOrPack(student.learnFocusId);
      }

      if (!topic) {
        return [
          withSpelling(
            corrections,
            "I couldn’t lock onto a syllabus topic yet. Ask again with the topic name, even if the spelling’s off (e.g. “what is osmosiss?” or “photosyntesis”). Reca will correct it and explain."
          ),
        ];
      }

      // If they picked a pack topic from the hub list
      const asPack = findPackById(topic.id);
      if (asPack) {
        const switchingPack = topic.id !== student.learnFocusId;
        if (Boolean(opts.fresh) || switchingPack || !student.learnFocusId) {
          return serveDiagramPack(student, asPack, corrections);
        }
      }

      const switching = Boolean(topic.id !== student.learnFocusId);
      const fresh = Boolean(opts.fresh) || switching || !student.learnFocusId;

      student.learnFocusId = topic.id;
      if (fresh) {
        student.learnDepth = 0;
        let explanation = conceptExplanation(topic, text) || topic.explanation;
        // Teen-readable Learn: expand short bank blurbs with exam lock-ins
        explanation = teachExplanation(
          { ...topic, explanation },
          { mode: "fresh", depth: 0 }
        );

        if (llm.isEnabled() && !topic.isDiagramPack) {
          const ai = await llm.learnReply({
            topicTitle: topicLabel(topic),
            subject: topic.subject,
            explanation: topic.explanation,
            studentAsk: text,
            intent: "fresh",
            depth: 0,
          });
          if (ai?.reply) explanation = ai.reply;
        }

        return [withSpelling(corrections, explanation)];
      }

      return learnFollowUp(student, topic, text, corrections);
    }

    if (student.awaitingResurface) {
      // Don't treat a clear question as a yes/no recall answer
      const q = normalize(text);
      const looksLikeQuestion =
        /\?$/.test(text.trim()) ||
        /^(what|why|how|when|where|who|explain|define|tell|describe|is|are|can|does|do)\b/.test(
          q
        );
      if (looksLikeQuestion) {
        student.awaitingResurface = null;
      } else {
        return handleResurfaceAnswer(student, text);
      }
    }

    if (student.pending) {
      return handlePendingAnswer(student, text);
    }

    if (isHelp(text)) return [copy.welcome];

    // WhatsApp / default chat: labelled packs before free explain
    {
      const packHit = resolveDiagramPack(text);
      if (packHit.pack) {
        return serveDiagramPack(student, packHit.pack, [], { withQuiz: true });
      }
      if (packHit.wantedButMissing) {
        return [missingPackCopy()];
      }
    }

    if (isRecap(text)) {
      const lower = text.toLowerCase();
      const subject = lower.includes("further math")
        ? "Further Mathematics"
        : lower.includes("english")
          ? "English Language"
          : lower.includes("agriculture") || lower.includes("agric")
            ? "Agriculture"
            : lower.includes("yoruba")
              ? "Yoruba"
              : lower.includes("igbo")
                ? "Igbo"
                : lower.includes("hausa")
                  ? "Hausa"
                  : lower.includes("chemistry")
                    ? "Chemistry"
                    : lower.includes("biology")
                      ? "Biology"
                      : lower.includes("physics")
                        ? "Physics"
                        : lower.includes("math")
                          ? "Mathematics"
                          : null;
      const prog = store.progressFor(phone, subject);
      if (!prog.answered) {
        return [copy.emptyRecap];
      }
      return [copy.recap(prog)];
    }

    const topic = findTopic(text);
    if (!topic) return [copy.help];

    if (topic.isDiagramPack) {
      const pack = findPackById(topic.id);
      if (pack) return serveDiagramPack(student, pack, []);
    }

    let explanation = topic.explanation;
    let questions = topic.questions;
    let usedLlm = false;

    if (llm.isEnabled()) {
      const ai = await llm.explainAndQuiz({
        topicTitle: topicLabel(topic),
        subject: topic.subject,
        studentAsk: text,
      });
      if (ai) {
        explanation = ai.explanation;
        questions = ai.questions;
        usedLlm = true;
      }
    }

    // Same teen teach path as web Learn when bank copy is the source
    if (!usedLlm) {
      explanation = teachExplanation(
        { ...topic, explanation },
        { mode: "fresh", depth: 0, channel: "wa" }
      );
    }

    student.pending = {
      topicId: topic.id,
      subject: topic.subject,
      step: "q1",
      topic: {
        ...topic,
        explanation,
        questions,
      },
      q1Correct: null,
      q2Correct: null,
    };

    return [copy.explainAndQ1(explanation, questions[0].text)];
  } catch (err) {
    console.error(err);
    return [copy.error];
  }
}

async function handlePendingAnswer(student, text) {
  const { topic, step } = student.pending;
  const q1 = topic.questions[0];
  const q2 = topic.questions[1];

  if (step === "q1") {
    const { ok } = await gradeWithFallback(q1, text);
    student.pending.q1Correct = ok;
    student.pending.step = "q2";
    student.pending.q1Answer = text;
    return [copy.q2(q2.text)];
  }

  if (step === "q2") {
    const { ok } = await gradeWithFallback(q2, text);
    student.pending.q2Correct = ok;
    student.pending.q2Answer = text;

    const q1Correct = student.pending.q1Correct;
    const q2Correct = ok;

    // Store attempts for memory / resurface
    const nextReviewAt = Date.now() + resurfaceMinutes * 60 * 1000;

    if (!q1Correct) {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q1.id,
        questionText: q1.text,
        correctAnswer: q1.correctAnswer,
        accept: q1.accept,
        isCorrect: false,
        nextReviewAt,
        cleared: false,
        surfaced: false,
      });
    } else {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q1.id,
        questionText: q1.text,
        correctAnswer: q1.correctAnswer,
        accept: q1.accept,
        isCorrect: true,
        nextReviewAt: null,
        cleared: false,
        surfaced: false,
      });
    }

    if (!q2Correct) {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q2.id,
        questionText: q2.text,
        correctAnswer: q2.correctAnswer,
        accept: q2.accept,
        isCorrect: false,
        nextReviewAt,
        cleared: false,
        surfaced: false,
      });
    } else {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q2.id,
        questionText: q2.text,
        correctAnswer: q2.correctAnswer,
        accept: q2.accept,
        isCorrect: true,
        nextReviewAt: null,
        cleared: false,
        surfaced: false,
      });
    }

    const reply =
      q1Correct && q2Correct
        ? copy.bothCorrect(
            topic.id === "photosynthesis" ? "explain osmosis" : "explain photosynthesis"
          )
        : copy.mixedGrade({
            q1Correct,
            q2Correct,
            q1: q1Correct ? null : q1,
            q2: q2Correct ? null : q2,
          });

    student.pending = null;
    return [reply];
  }

  student.pending = null;
  return [copy.help];
}

async function handleResurfaceAnswer(student, text) {
  const pending = student.awaitingResurface;

  if (llm.isEnabled()) {
    const result = await llm.gradeAnswerLlm({
      questionText: pending.questionText,
      correctAnswer: pending.correctAnswer,
      accept: pending.accept,
      studentAnswer: text,
    });
    if (result) {
      if (result.is_correct) {
        if (student.attempts[pending.attemptIndex]) {
          student.attempts[pending.attemptIndex].cleared = true;
          student.attempts[pending.attemptIndex].isCorrect = true;
        }
        student.awaitingResurface = null;
        return [copy.resurfaceCleared(pending.topicLabel)];
      }
      student.awaitingResurface = null;
      if (student.attempts[pending.attemptIndex]) {
        student.attempts[pending.attemptIndex].surfaced = false;
        student.attempts[pending.attemptIndex].nextReviewAt =
          Date.now() + resurfaceMinutes * 60 * 1000;
      }
      return [copy.resurfaceMiss(pending.correctAnswer)];
    }
  }

  const ok = pending.accept.some((a) => {
    const n = normalize(a);
    const ans = normalize(text);
    const nTight = n.replace(/\s+/g, "");
    const ansTight = ans.replace(/\s+/g, "");
    if (
      ans === n ||
      ans.includes(n) ||
      n.includes(ans) ||
      ansTight === nTight ||
      ansTight.includes(nTight) ||
      nTight.includes(ansTight)
    ) {
      return true;
    }
    // Lenient on short exam spellings (e.g. chorophyll → chlorophyll)
    if (Math.abs(ansTight.length - nTight.length) > 2) return false;
    if (ansTight.length < 4 || nTight.length < 4) return false;
    let i = 0;
    let j = 0;
    let misses = 0;
    while (i < ansTight.length && j < nTight.length) {
      if (ansTight[i] === nTight[j]) {
        i += 1;
        j += 1;
        continue;
      }
      misses += 1;
      if (misses > 2) return false;
      if (ansTight.length > nTight.length) i += 1;
      else if (nTight.length > ansTight.length) j += 1;
      else {
        i += 1;
        j += 1;
      }
    }
    misses += ansTight.length - i + (nTight.length - j);
    return misses <= 2;
  });

  if (ok) {
    if (student.attempts[pending.attemptIndex]) {
      student.attempts[pending.attemptIndex].cleared = true;
      student.attempts[pending.attemptIndex].isCorrect = true;
    }
    student.awaitingResurface = null;
    return [copy.resurfaceCleared(pending.topicLabel)];
  }

  student.awaitingResurface = null;
  if (student.attempts[pending.attemptIndex]) {
    student.attempts[pending.attemptIndex].surfaced = false;
    student.attempts[pending.attemptIndex].nextReviewAt =
      Date.now() + resurfaceMinutes * 60 * 1000;
  }
  return [copy.resurfaceMiss(pending.correctAnswer)];
}

/** Build resurface payload for a due attempt */
function prepareResurface(phone, attempt, index) {
  const student = store.getStudent(phone);
  const topicLabelText = attempt.topicId
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  student.awaitingResurface = {
    attemptIndex: index,
    questionText: attempt.questionText,
    correctAnswer: attempt.correctAnswer,
    accept: attempt.accept,
    topicLabel: topicLabelText,
  };
  store.markSurfaced(phone, index);
  return copy.resurface(attempt.questionText);
}

/**
 * Grade a web Quick Recall answer. Re-arms awaitingResurface from attempts
 * or from the nudge payload when the toast was restored after refresh/restart.
 */
async function answerResurface(phone, text, meta = {}) {
  const student = store.getStudent(phone);
  const answer = String(text || "").trim();
  if (!answer) {
    return { error: "Type a short answer, then try again.", status: 400 };
  }

  function armFromMeta() {
    let correctAnswer = meta.correctAnswer ? String(meta.correctAnswer) : "";
    let accept = Array.isArray(meta.accept) ? meta.accept.filter(Boolean) : [];
    const qRaw = String(meta.questionText || "").trim();

    if ((!correctAnswer && !accept.length) && qRaw) {
      const qNorm = normalize(qRaw);
      for (const topic of topics) {
        for (const q of topic.questions || []) {
          const qt = normalize(q.text || "");
          if (
            qt === qNorm ||
            qt.includes(qNorm.slice(0, 36)) ||
            qNorm.includes(qt.slice(0, 36))
          ) {
            correctAnswer = q.correctAnswer || "";
            accept = q.accept || [correctAnswer].filter(Boolean);
            break;
          }
        }
        if (correctAnswer || accept.length) break;
      }
    }

    if (!qRaw || (!correctAnswer && !accept.length)) return false;

    const acceptList = accept.length ? accept : [correctAnswer].filter(Boolean);
    student.awaitingResurface = {
      attemptIndex: -1,
      questionText: qRaw.slice(0, 500),
      correctAnswer: String(correctAnswer || acceptList[0] || "").slice(0, 200),
      accept: acceptList,
      topicLabel: String(meta.topicLabel || "this topic").slice(0, 120),
    };
    return true;
  }

  if (!student.awaitingResurface) {
    const qNorm = normalize(String(meta.questionText || ""));
    let index = student.attempts.findIndex(
      (a) =>
        !a.cleared &&
        !a.isCorrect &&
        (meta.topicId ? a.topicId === meta.topicId : true) &&
        (qNorm
          ? normalize(a.questionText || "").includes(qNorm.slice(0, 40)) ||
            qNorm.includes(normalize(a.questionText || "").slice(0, 40))
          : true)
    );
    if (index < 0) {
      index = student.attempts.findIndex((a) => !a.cleared && !a.isCorrect);
    }
    if (index >= 0) {
      prepareResurface(phone, student.attempts[index], index);
    } else if (!armFromMeta()) {
      return {
        error:
          "This recall expired after a refresh. Close it, miss a quiz question again, then use Send a test nudge.",
        status: 404,
      };
    }
  }

  const pending = student.awaitingResurface;
  const replies = await handleResurfaceAnswer(student, answer);
  const message = Array.isArray(replies) ? replies[0] : String(replies || "");
  const correct = /correct|cleared/i.test(String(message));
  return {
    ok: true,
    correct,
    message,
    correctAnswer: correct ? null : pending?.correctAnswer || null,
    topicLabel: pending?.topicLabel || meta.topicLabel || null,
  };
}

/** Unprompted daily study plan — weakest topic + days to exam */
function prepareDailyBriefing(phone) {
  const student = store.getStudent(phone);
  const progress = store.progressFor(phone);
  const dueLabel = progress.dueForRecall?.[0]?.label;
  const focusTopic =
    progress.nextWeak ||
    dueLabel ||
    progress.needsWork?.[0] ||
    "Photosynthesis";
  const daysLeft = store.daysUntilExam(student.examDate);
  const message = copy.dailyBriefing({
    daysLeft,
    focusTopic,
    examLabel: student.examLabel || "WAEC",
    name: student.displayName || null,
  });
  store.markBriefed(phone);
  return message;
}

/** Unprompted Nigerian university admin update — AI feed first, curated fallback */
function prepareUniAdminUpdate(phone) {
  const student = store.getStudent(phone);
  if (student.uniUpdatesEnabled === false) return null;

  let update = uniFeed.getUpdateForStudent(
    student.targetUniversity,
    student.deliveredUniUpdateIds || []
  );

  if (!update) {
    store.resetUniUpdateCycle(phone);
    update = uniFeed.getUpdateForStudent(student.targetUniversity, []);
  }
  if (!update) return null;

  const uni =
    uniData.universityById(update.universityId) ||
    uniData.universityById(student.targetUniversity);
  const universityName = uni?.shortName || uni?.name || "JAMB";

  const message = copy.uniAdminUpdate({
    update: {
      ...update,
      sourceUrl: update.sourceUrl || uni?.url || null,
    },
    name: student.displayName || null,
    universityName,
  });
  store.markUniUpdateDelivered(phone, update.id);
  return { message, update, universityName };
}

module.exports = {
  handleIncoming,
  prepareResurface,
  answerResurface,
  prepareDailyBriefing,
  prepareUniAdminUpdate,
};
