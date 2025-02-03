import "dotenv/config"; // Only needed for local development
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Read environment variables from Azure

app.use(cors({ 
    origin: "https://karlverse-bfdbcsbge7f5e6bh.eastus2-01.azurewebsites.net",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());

const mongoURI = process.env.COSMOSDB_CONNECTION_STRING;
const dbName = process.env.COSMOSDB_DATABASE_NAME;

mongoose
    .connect( mongoURI )
    .then(() => console.log("Connected to CosmosDB"))
    .catch((err) => console.error("CosmosDB Connection Error:", err));

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

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
