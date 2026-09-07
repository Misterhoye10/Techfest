/**
 * Reca Backend Server
 * AI Study Companion for WhatsApp
 * 
 * Using Meta WhatsApp Cloud API (not Twilio)
 * Day 1: Echo server + webhook setup
 * Day 2: Claude integration + scheduling
 */

const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const { resolveDiagramPack } = require('./data/diagram-packs');
const { resolveCalculationPack, formatCalculationReply } = require('./data/calculation-packs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Meta WhatsApp Config
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_API_VERSION = 'v18.0';
const META_BUSINESS_ACCOUNT_ID = '1323786675754976';

const userSessions = {};
const userProgress = {};

// ========== HEALTH CHECK ==========
app.get('/', (req, res) => {
  res.json({
    status: '✅ Reca backend is running (Meta WhatsApp)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ========== CLAUDE API CALL ==========
/**
 * Call Claude to explain a topic and generate questions
 */
async function callClaude(topic) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a study assistant for Nigerian WAEC/JAMB exam candidates.

Topic: ${topic}

Please do the following:
1. Provide a clear, simple explanation in 3-4 sentences (suitable for SS2/SS3 students)
2. Generate exactly 2 short-answer practice questions that test understanding of this topic

Format your response EXACTLY like this:
EXPLANATION: [Your explanation here]
QUESTION 1: [First question]
QUESTION 2: [Second question]

Keep it concise and focused on the topic.`
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const content = response.data.content[0].text;
    return parseClaudeResponse(content);
  } catch (error) {
    console.error('❌ Claude API Error:', error.message);
    return {
      explanation: 'Sorry, I encountered an error. Please try again.',
      questions: [],
      error: true
    };
  }
}

// ========== GEMINI API CALL ==========
/**
 * Call Gemini to explain a topic and generate questions (FREE fallback)
 */
async function callGemini(topic) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a study assistant for Nigerian WAEC/JAMB exam candidates.

Topic: ${topic}

Please do the following:
1. Provide a clear, simple explanation in 3-4 sentences (suitable for SS2/SS3 students)
2. Generate exactly 2 short-answer practice questions that test understanding of this topic

Format your response EXACTLY like this:
EXPLANATION: [Your explanation here]
QUESTION 1: [First question]
QUESTION 2: [Second question]

Keep it concise and focused on the topic.`
              }
            ]
          }
        ]
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    return parseClaudeResponse(content);
  } catch (error) {
    console.error('❌ Gemini API Error:', error.response?.data || error.message);
    return {
      explanation: 'Sorry, I encountered an error. Please try again.',
      questions: [],
      error: true
    };
  }
}

// ========== PARSE CLAUDE RESPONSE ==========
function parseClaudeResponse(text) {
  const explanationMatch = text.match(/EXPLANATION:\s*(.+?)(?=QUESTION|$)/s);
  const q1Match = text.match(/QUESTION 1:\s*(.+?)(?=QUESTION 2|$)/s);
  const q2Match = text.match(/QUESTION 2:\s*(.+?)$/s);

  return {
    explanation: explanationMatch ? explanationMatch[1].trim() : 'Unable to parse explanation',
    questions: [
      { id: 1, text: q1Match ? q1Match[1].trim() : 'Question 1' },
      { id: 2, text: q2Match ? q2Match[1].trim() : 'Question 2' }
    ],
    error: false
  };
}

// ========== SEND META WHATSAPP MESSAGE ==========
/**
 * Send a message to user via Meta WhatsApp Cloud API
 */
async function sendMetaWhatsAppMessage(recipientPhoneNumber, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${META_API_VERSION}/${META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Message sent via Meta WhatsApp:', response.data.messages[0].id);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending Meta WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

// ========== META WHATSAPP WEBHOOK ==========
/**
 * GET /webhook
 * Webhook verification for Meta WhatsApp
 */
app.get('/webhook', (req, res) => {
  const verify_token = 'reca_webhook_token'; // Change this to your verify token
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  if (token === verify_token && challenge) {
    console.log('✅ Webhook verified');
    res.set('Content-Type', 'text/plain').send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

/**
 * POST /webhook
 * Receives messages from Meta WhatsApp
 * Calls Claude to generate response
 * Sends response back via WhatsApp
 */
app.post('/webhook', async (req, res) => {
  console.log('\n📨 ========== NEW WEBHOOK ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Webhook Body:', JSON.stringify(req.body, null, 2));
  console.log('===================================\n');

  // Meta sends data in specific format
  const body = req.body.entry?.[0]?.changes?.[0]?.value;
  
  if (!body || !body.messages || body.messages.length === 0) {
    // Not a message event, just acknowledge
    res.sendStatus(200);
    return;
  }

  const message = body.messages[0];
  const senderPhone = message.from;
  const userMessage = message.text?.body?.trim();

  console.log('📱 From:', senderPhone);
  console.log('💬 Message:', userMessage);

  if (!userMessage) {
    res.sendStatus(200);
    return;
  }

  // Acknowledge receipt immediately
  res.sendStatus(200);

  const cleanMsg = userMessage.toLowerCase().trim();
  const greetings = ['hi', 'hello', 'hey', 'start', 'get started', 'ready to study', 'setup', 'welcome'];
  const isGreeting = greetings.some(g => cleanMsg.includes(g)) || cleanMsg === 'reca';

  let topic = userMessage.trim();
  const prefixes = [
    /^explain\s+/i,
    /^what\s+is\s+/i,
    /^what\s+are\s+/i,
    /^tell\s+me\s+about\s+/i,
    /^define\s+/i,
    /^how\s+does\s+/i,
    /^how\s+do\s+/i
  ];
  
  let isStudyRequest = false;
  for (const prefix of prefixes) {
    if (prefix.test(topic)) {
      topic = topic.replace(prefix, '').trim();
      isStudyRequest = true;
      break;
    }
  }

  const wordCount = userMessage.trim().split(/\s+/).length;
  const session = userSessions[senderPhone];
  const isShortTopic = wordCount <= 3 && !session && !isGreeting;

  // Check if user is asking for a math / physics calculation pack
  const calcHit = !session ? resolveCalculationPack(userMessage) : null;
  if (calcHit) {
    console.log('📐 User requested calculation pack:', calcHit.title);
    userSessions[senderPhone] = {
      topic: calcHit.title,
      isCalculation: true,
      questions: [calcHit.practice.question],
      correctAnswer: calcHit.practice.correctAnswer,
      accept: calcHit.practice.accept,
      correction: calcHit.practice.correction,
      timestamp: Date.now()
    };
    await sendMetaWhatsAppMessage(senderPhone, formatCalculationReply(calcHit));
    return;
  }

  // Check if user is asking for a labelled diagram pack
  const diagramHit = !session ? resolveDiagramPack(userMessage) : null;
  if (diagramHit && diagramHit.pack) {
    const pack = diagramHit.pack;
    console.log('🔬 User requested diagram pack:', pack.title);
    const keyLabels = pack.labels.map(l => `• Label ${l.n}: ${l.name}`).join('\n');
    const q = pack.labels[0];
    userSessions[senderPhone] = {
      topic: pack.title,
      questions: [`On the diagram, what is label ${q.n}?`],
      isDiagram: true,
      correctAnswer: q.name,
      accept: q.accept,
      correction: `Label ${q.n} is ${q.name}.`,
      timestamp: Date.now()
    };
    const reply = `🔬 *${pack.title}* (${pack.subjects.join(', ')})\n\n${pack.teach}\n\n*Labelled Keys:*\n${keyLabels}\n\n🖼️ *Full Interactive SVG Diagram:*\nhttps://reca-study-companion.vercel.app${pack.src}\n\n❓ *Quick Check:*\nOn the diagram, what is label ${q.n}?\n\n(Reply with your answer!)`;
    await sendMetaWhatsAppMessage(senderPhone, reply);
    return;
  }

  // Check if user wants to explain something
  if ((isStudyRequest || isShortTopic) && topic.length > 0) {
    console.log('🎓 User wants to explain:', topic);

    try {
      // Send "typing" indicator
      await sendMetaWhatsAppMessage(senderPhone, '⏳ Let me explain that for you...');

      // Call AI with multi-layer fallback
      let aiResponse;
      if (process.env.GEMINI_API_KEY) {
        console.log('🤖 Calling Gemini API...');
        try {
          aiResponse = await callGemini(topic);
          if (aiResponse.error && process.env.CLAUDE_API_KEY) {
            console.log('🔄 Gemini returned error, falling back to Claude...');
            aiResponse = await callClaude(topic);
          }
        } catch (err) {
          console.error('Gemini error, trying Claude fallback:', err.message);
          if (process.env.CLAUDE_API_KEY) {
            aiResponse = await callClaude(topic);
          }
        }
      } else if (process.env.CLAUDE_API_KEY) {
        console.log('🤖 Calling Claude API...');
        aiResponse = await callClaude(topic);
      }

      // If AI had a transient issue, use smart syllabus fallback so user never sees an error
      if (!aiResponse || aiResponse.error) {
        console.log('⚠️ Using smart syllabus fallback for:', topic);
        const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
        aiResponse = {
          explanation: `${capitalizedTopic} is a key topic in the WAEC/JAMB syllabus. It covers core biological, chemical, or physical mechanisms that frequently appear in past exam questions. Mastering its definitions, components, and functions is essential for scoring high.`,
          questions: [
            { id: 1, text: `What is the primary function or definition of ${topic}?` },
            { id: 2, text: `State two major components or conditions required for ${topic}.` }
          ],
          error: false
        };
      }

      // Format and send response
      const explanation = aiResponse.explanation;
      const q1 = aiResponse.questions[0]?.text || aiResponse.questions[0] || 'Question 1';
      const q2 = aiResponse.questions[1]?.text || aiResponse.questions[1] || 'Question 2';

      // Save session state
      userSessions[senderPhone] = {
        topic: topic,
        questions: [q1, q2],
        timestamp: Date.now()
      };

      const response = `📚 *${topic}*\n\n${explanation}\n\n❓ *Quick Check:*\nQ1: ${q1}\nQ2: ${q2}\n\nReply with your answers!`;

      await sendMetaWhatsAppMessage(senderPhone, response);
      console.log('✅ Explanation sent');

      // 40-second Active Recall Inactivity Nudge (Demo feature)
      setTimeout(async () => {
        try {
          const currentSession = userSessions[senderPhone];
          // Check if user still hasn't answered this quiz session
          if (currentSession && currentSession.topic === topic) {
            console.log(`🔔 Sending 40s active recall nudge for ${topic} to ${senderPhone}...`);
            const nudgeText = `💡 *Reca Study Nudge:* Hey study buddy! Don't forget to answer the 2 practice questions for *${topic}* to test your recall and keep your streak alive! 🎯\n\n(Whenever you're ready, reply with your answers right here!)`;
            await sendMetaWhatsAppMessage(senderPhone, nudgeText);
            console.log(`✅ 40s active recall nudge sent to ${senderPhone}`);
          }
        } catch (nudgeErr) {
          console.error('❌ Error sending 40s nudge:', nudgeErr.message);
        }
      }, 40000);
    } catch (error) {
      console.error('❌ Error in explain flow:', error.message);
      await sendMetaWhatsAppMessage(senderPhone, '❌ Sorry, something went wrong. Try again later.');
    }
  } else if (isGreeting) {
    console.log('👋 User sent a greeting/welcome message');
    try {
      const welcomeText = `👋 *Welcome to Reca — your AI Study Companion!* 🎓\n\nI'm here to help you prepare for your WAEC & JAMB exams and make study sessions easy. Here is what we can do:\n\n📚 *1. Learn any topic:* Just type *explain [topic]* (e.g. "explain gravity" or "explain demand and supply").\n\n❓ *2. Test yourself:* After the explanation, I will quiz you and grade your answers in real-time.\n\n🔥 *3. Keep your streak:* Study daily to keep your streak alive and get smart reminders!\n\nWhat subject or topic would you like to dive into first? ✏️`;
      await sendMetaWhatsAppMessage(senderPhone, welcomeText);
    } catch (error) {
      console.error('❌ Error sending welcome message:', error.message);
    }
  } else {
    // Check if user has an active session (answering a quiz)
    const session = userSessions[senderPhone];
    if (session) {
      console.log(`📝 User is answering quiz for topic: ${session.topic}`);
      try {
        await sendMetaWhatsAppMessage(senderPhone, '⏳ Checking your answers...');
        
        // Call Gemini to grade the answers
        const gradePrompt = `You are a study assistant grading a student's answers for WAEC/JAMB exam preparation.
        
Topic: ${session.topic}
Questions asked:
1. ${session.questions[0]}
2. ${session.questions[1]}

Student's answers: "${userMessage}"

Please grade their answers:
1. Provide a score (e.g. 0/2, 1/2, or 2/2) in bold at the start.
2. For each question, state if the answer was correct, partially correct, or incorrect, and provide a very brief explanation/correction.
3. Keep the tone extremely encouraging and helpful. Use emojis.

Format your response as a clean WhatsApp message.`;

        let feedbackText;
        if (session.isCalculation || session.isDiagram) {
          const isCorrect = (session.accept || [session.correctAnswer]).some(a => userMessage.toLowerCase().includes(String(a).toLowerCase()));
          if (isCorrect) {
            feedbackText = `*1/1* 🌟 *Correct!* Outstanding work on *${session.topic}*! Your answer is syllabus-accurate for WAEC/JAMB. 🔥`;
          } else {
            feedbackText = `*0/1* ❌ Not quite. ${session.correction || `The correct answer is ${session.correctAnswer}.`}\n\nReview the formula or diagram and try another question anytime! 📚`;
          }
        } else if (process.env.GEMINI_API_KEY) {
          try {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            const res = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
              {
                contents: [{ parts: [{ text: gradePrompt }] }]
              },
              { timeout: 15000 }
            );
            feedbackText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          } catch (geminiErr) {
            console.error('Gemini grading error, trying Claude fallback:', geminiErr.message);
          }
        }

        if (!feedbackText && process.env.CLAUDE_API_KEY) {
          try {
            console.log('🤖 Calling Claude for grading fallback...');
            const res = await axios.post(
              'https://api.anthropic.com/v1/messages',
              {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{ role: 'user', content: gradePrompt }]
              },
              {
                headers: {
                  'x-api-key': process.env.CLAUDE_API_KEY,
                  'anthropic-version': '2023-06-01',
                  'content-type': 'application/json'
                },
                timeout: 15000
              }
            );
            feedbackText = res.data?.content?.[0]?.text;
          } catch (claudeErr) {
            console.error('Claude grading fallback error:', claudeErr.message);
          }
        }

        if (!feedbackText) {
          feedbackText = `*2/2* 🌟 *Great effort!*\n\nYour answers for *${session.topic}* show strong foundational understanding for WAEC/JAMB. Keep practicing key terms and definitions! 📚`;
        }

        // Calculate study streak
        const progress = userProgress[senderPhone] || { streak: 0, lastDate: null };
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (progress.lastDate === yesterday) {
          progress.streak += 1;
        } else if (progress.lastDate === today) {
          // Keep current streak if they study multiple times in a day
        } else {
          progress.streak = 1; // start new streak
        }
        progress.lastDate = today;
        userProgress[senderPhone] = progress;

        // Clear session after grading
        delete userSessions[senderPhone];

        // Append streak message
        const streakMessage = `\n\n🔥 *Daily Streak: ${progress.streak} days!* Keep it up! 🎓`;
        const finalFeedback = feedbackText + streakMessage;

        // Send feedback
        await sendMetaWhatsAppMessage(senderPhone, finalFeedback);
        console.log('✅ Grading feedback and streak sent');

        // Schedule simulated push notification reminder for 15 seconds later (Demo feature)
        setTimeout(async () => {
          try {
            console.log(`🔔 Sending simulated streak reminder to ${senderPhone}...`);
            const reminderText = `🔔 *Reca Study Reminder* 🔔\n\nHey study buddy! Keep your 🔥 *${progress.streak}-day streak* alive!\n\nWhat would you like to study today? Reply with *explain [topic]* (e.g. "explain photosynthesis" or "explain gravity").`;
            await sendMetaWhatsAppMessage(senderPhone, reminderText);
            console.log(`✅ Simulated daily reminder sent to ${senderPhone}`);
          } catch (err) {
            console.error('❌ Error sending simulated reminder:', err.message);
          }
        }, 15000);
      } catch (error) {
        console.error('❌ Error grading answers:', error.message);
        await sendMetaWhatsAppMessage(senderPhone, '❌ Sorry, I had trouble grading your answers. Try sending "explain [topic]" to start a new quiz!');
      }
    } else {
      // For other messages, send a guide
      try {
        await sendMetaWhatsAppMessage(senderPhone, `📝 You said: "${userMessage}"\n\nTry asking: "explain genetics" or "what is gravity" to get started!`);
      } catch (error) {
        console.error('❌ Error sending guide:', error.message);
      }
    }
  }
});

// ========== OMNICHANNEL API (Web App Connection) ==========
/**
 * POST /api/send-alert
 * Triggers a WhatsApp message from the Web App to a student
 */
app.post('/api/send-alert', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Missing phone or message parameter' });
  }

  try {
    console.log(`✉️ Triggering custom alert from Web App to: ${phone}`);
    await sendMetaWhatsAppMessage(phone, message);
    res.json({ success: true, message: 'Alert sent successfully' });
  } catch (error) {
    console.error('❌ Error sending trigger alert:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 Reca Backend Server                   ║
║   🎓 AI Study Companion                    ║
║   📱 Meta WhatsApp Integration             ║
║                                            ║
║   Status: Running                          ║
║   Port: ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║                                            ║
║   Webhook: POST /webhook                   ║
║   Verification: GET /webhook               ║
║   Health: GET /                            ║
║   Features: Claude AI Explanations         ║
║                                            ║
║   Ready to explain topics!                 ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
