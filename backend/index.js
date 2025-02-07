import "dotenv/config"; // Load environment variables for local development
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/auth.js";
import passport from "./passportConfig.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Configure CORS (adjust origin as needed)
app.use(
  cors({
    origin: "https://karlverse-bfdbcsbge7f5e6bh.eastus2-01.azurewebsites.net",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);

// Parse JSON bodies
app.use(express.json());

// Connect to CosmosDB using the connection string from environment variables
mongoose
  .connect(process.env.COSMOSDB_CONNECTION_STRING)
  .then(() => console.log("Connected to CosmosDB"))
  .catch((err) => console.error("CosmosDB Connection Error:", err));

// Configure session middleware (in production, use a persistent session store)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }
  })
);

// Initialize Passport and enable persistent login sessions
app.use(passport.initialize());
app.use(passport.session());

// Mount authentication routes
app.use("/auth", authRoutes);

// Mount job-related routes
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
