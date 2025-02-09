import "dotenv/config"; // Loads environment variables
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ 
    origin: "https://karlverse-bfdbcsbge7f5e6bh.eastus2-01.azurewebsites.net",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());

const mongoURI = process.env.COSMOSDB_CONNECTION_STRING;

mongoose
    .connect(mongoURI)
    .then(() => console.log("Connected to CosmosDB"))
    .catch((err) => console.error("CosmosDB Connection Error:", err));

// Register routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Example endpoint for application streak (if needed)
let lastApplicationDate = null;
let applicationStreak = 0;
let weeklyApplications = 0;
const weeklyGoal = 10;

app.get("/api/streak-goals", (req, res) => {
    res.json({ streak: applicationStreak, applicationsThisWeek: weeklyApplications, goal: weeklyGoal });
});

app.listen(PORT, () => {
    console.log("Backend running on http://localhost:" + PORT);
});
