import "dotenv/config"; // Load environment variables
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Optional middleware to enforce HTTPS in production
function requireHTTPS(req, res, next) {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
}
app.use(requireHTTPS);

// Configure CORS (adjust origin as needed)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://your-production-frontend.example.com",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);

// Parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Connect to CosmosDB
mongoose
  .connect(process.env.COSMOSDB_CONNECTION_STRING)
  .then(() => console.log("Connected to CosmosDB"))
  .catch((err) => console.error("CosmosDB Connection Error:", err));

// Mount authentication routes (for registration and login)
app.use("/auth", authRoutes);

// Mount job routes (all require JWT authentication)
app.use("/api/jobs", jobRoutes);

// Function to update application streak
const updateStreak = () => {
    const today = new Date().toISOString().split("T")[0];
    if (lastApplicationDate === today) return; // Already applied today

    if (lastApplicationDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split("T")[0];

        if (lastApplicationDate === yesterdayString) {
            applicationStreak += 1; // Continue streak
        } else {
            applicationStreak = 1; // Reset streak
        }
    } else {
        applicationStreak = 1;
    }

    lastApplicationDate = today;
    weeklyApplications += 1;
};

// Get application streak & weekly goals
app.get("/api/streak-goals", (req, res) => {
    res.json({ streak: applicationStreak, applicationsThisWeek: weeklyApplications, goal: weeklyGoal });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
