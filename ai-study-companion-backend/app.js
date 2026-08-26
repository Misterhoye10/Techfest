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
    res.send(challenge);
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

  // Check if user wants to explain something
  if (userMessage.toLowerCase().startsWith('explain ')) {
    const topic = userMessage.substring(8).trim();
    console.log('🎓 User wants to explain:', topic);

    try {
      // Send "typing" indicator
      await sendMetaWhatsAppMessage(senderPhone, '⏳ Let me explain that for you...');

      // Call AI
      let aiResponse;
      if (process.env.GEMINI_API_KEY) {
        console.log('🤖 Calling Gemini API...');
        aiResponse = await callGemini(topic);
      } else {
        console.log('🤖 Calling Claude API...');
        aiResponse = await callClaude(topic);
      }

      if (aiResponse.error) {
        await sendMetaWhatsAppMessage(senderPhone, '❌ Sorry, something went wrong. Try again.');
        return;
      }

      // Format and send response
      const explanation = aiResponse.explanation;
      const q1 = aiResponse.questions[0]?.text || 'Question 1';
      const q2 = aiResponse.questions[1]?.text || 'Question 2';

      const response = `📚 *${topic}*\n\n${explanation}\n\n❓ *Quick Check:*\nQ1: ${q1}\nQ2: ${q2}\n\nReply with your answers!`;

      await sendMetaWhatsAppMessage(senderPhone, response);
      console.log('✅ Explanation sent');
    } catch (error) {
      console.error('❌ Error in explain flow:', error.message);
      await sendMetaWhatsAppMessage(senderPhone, '❌ Sorry, something went wrong. Try again later.');
    }
  } else {
    // For other messages, send a guide
    try {
      await sendMetaWhatsAppMessage(senderPhone, `📝 You said: "${userMessage}"\n\nTry: "explain photosynthesis" to get started!`);
    } catch (error) {
      console.error('❌ Error sending guide:', error.message);
    }
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
