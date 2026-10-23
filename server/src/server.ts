
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes.js";
import { seedQuestions } from "./seed.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

// Render can use CLIENT_URL for one frontend or CLIENT_URLS for a comma
// separated list (for example, the Vercel production and preview domains).
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ?? "").split(",")
]
  .filter((origin): origin is string => Boolean(origin))
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins
  })
);

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ message: "CyberSafe API is running" });
});

app.use("/api", routes);

async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be configured");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas connected");

    await seedQuestions();

    app.listen(port, "0.0.0.0", () => {
      console.log(`CyberSafe API running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
