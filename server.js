
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// ==========================================
// ABUBAKAR AI TECHNOLOGY COMPANY
// Main Backend Server
// Version 1.0.0
// Architecture: Modular Monolith
// ==========================================

const app = express();

const PORT = process.env.PORT || 3000;
const APP_NAME = "ABUBAKAR AI TECHNOLOGY COMPANY";
const APP_VERSION = "1.0.0";

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ==========================================
// SECURITY CONFIGURATION
// ==========================================

app.disable("x-powered-by");

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(x => x.trim())
  : ["*"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed"));
  }
}));

app.use(express.json({ limit: "1mb" }));

// ==========================================
// BASIC RATE LIMITING
// ==========================================

const requests = new Map();

app.use("/api", (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 60;

  let record = requests.get(ip);

  if (!record || now - record.start > windowMs) {
    record = { start: now, count: 0 };
  }

  record.count++;
  requests.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Try again later."
    });
  }

  next();
});

// ==========================================
// AI ENGINE CONFIGURATION
// ==========================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

const aiModel = genAI
  ? genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: `
You are ABUBAKAR AI, the official AI assistant
of ABUBAKAR AI TECHNOLOGY COMPANY.

Your responsibilities include:

1. Answering questions clearly.
2. Helping users learn.
3. Supporting research.
4. Explaining business and technology.
5. Providing general health education.
6. Supporting programming and creativity.

Be helpful, respectful, accurate and honest.
Do not invent facts.
Respond in the language used by the user.
For medical questions, provide education rather
than diagnosis or prescriptions.
      `
    })
  : null;

// ==========================================
// MAIN ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    company: APP_NAME,
    platform: "ABUBAKAR AI PLATFORM",
    message: "Welcome to our official AI server.",
    version: APP_VERSION,
    status: "running"
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    company: APP_NAME,
    server: "online",
    aiEngine: genAI ? "configured" : "not configured",
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// AI CHAT ENGINE
// ==========================================

app.post("/api/chat", async (req, res) => {
  try {
    if (!aiModel) {
      return res.status(503).json({
        success: false,
        error: "AI engine is not configured."
      });
    }

    const { message, history = [] } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid message."
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        success: false,
        error: "Message is too long."
      });
    }

    if (!Array.isArray(history) || history.length > 12) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversation history."
      });
    }

    const validHistory = [];

    for (const item of history) {
      if (
        !item ||
        !["user", "model"].includes(item.role) ||
        typeof item.text !== "string" ||
        !item.text.trim() ||
        item.text.length > 10000
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid history format."
        });
      }

      validHistory.push({
        role: item.role,
        parts: [{ text: item.text }]
      });
    }

    const chat = aiModel.startChat({
      history: validHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    });

    const result = await chat.sendMessage(message.trim());

    const response = result.response.text();

    return res.status(200).json({
      success: true,
      company: APP_NAME,
      assistant: "ABUBAKAR AI",
      response,
      model: GEMINI_MODEL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI ENGINE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: "AI service is temporarily unavailable."
    });
  }
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found."
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: "Internal server error."
  });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("================================");
  console.log(APP_NAME);
  console.log("ABUBAKAR AI PLATFORM");
  console.log("Server: ONLINE");
  console.log(`Port: ${PORT}`);
  console.log(`AI Model: ${GEMINI_MODEL}`);
  console.log("================================");
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

function shutdown() {
  console.log("Shutting down server...");

  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
