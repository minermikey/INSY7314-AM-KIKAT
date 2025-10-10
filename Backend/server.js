// Backend/server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import https from "https";
import fs from "fs";

import paymentRoutes from "./routes/paymentRoutes.js";
import payfastRoutes from "./routes/payfast.js";
import authRoutes from "./routes/authRoutes.js";
import generalLimiter from "./middleware/rateLimiter.js";

dotenv.config();

// 🌍 Environment setup
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

// 🔒 SSL certificate paths (make sure these are correct)
const options = {
  key: process.env.SSL_KEY,
  cert: process.env.SSL_CERT,
};

// 🚀 Initialize Express app
const app = express();

// 🧱 Parse JSON (and allow CSP reports)
app.use(express.json({ type: ["application/json", "application/csp-report"] }));

// 🧠 Helmet (security middleware)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          FRONTEND_URL,
          !isProd && "'unsafe-eval'", // allow hot reload in dev
        ].filter(Boolean),
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          FRONTEND_URL,
          "https://localhost:5000",
          !isProd && `wss://${new URL(FRONTEND_URL).host}`,
          !isProd && `ws://${new URL(FRONTEND_URL).host}`,
        ].filter(Boolean),
        frameSrc: ["'self'", "https://sandbox.payfast.co.za"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://sandbox.payfast.co.za"],
      },
    },
    crossOriginEmbedderPolicy: false, // needed for dev sometimes
  })
);

// 🧩 CORS setup (after Helmet)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// ⚙️ Rate Limiting
app.use(generalLimiter);

// 📦 Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payfast", payfastRoutes);

// 🧠 Test endpoint
app.get("/test", (req, res) => res.json({ message: "✅ Backend is running!" }));

// 📋 CSP violation report (for debugging)
app.post("/api/csp-report", (req, res) => {
  console.warn("⚠️ CSP Violation:", JSON.stringify(req.body, null, 2));
  res.status(204).end();
});

// 🗄️ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔐 Start HTTPS Server
https.createServer(options, app).listen(PORT, () => {
  console.log(`🔒 Secure API running at https://localhost:${PORT}`);
  console.log(`🌐 Frontend URL allowed: ${FRONTEND_URL}`);
  console.log(`🧱 CSP mode: ${isProd ? "ENFORCED" : "REPORT-ONLY"}`);
});
