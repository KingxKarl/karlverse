// Load environment variables FIRST before anything else
import dotenv from "dotenv";
const ENV = process.env.NODE_ENV || "development"; // Default to development
dotenv.config({ path: `.env.${ENV}` });

// Debugging logs
console.log(`Running in ${ENV} mode`);
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");

// Import required modules AFTER dotenv loads
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Express app and port
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to allow dynamic origins via an env variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
? process.env.ALLOWED_ORIGINS.split(",") // Comma-separated list in .env files
: [
    "http://localhost:5173", // Dev frontend fallback
    "https://karlverse-bfdbcsbge7f5e6bh.eastus2-01.azurewebsites.net" // Production frontend fallback
  ];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection (Use local DB in dev, Azure in production)
const mongoURI = ENV === "development"
    ? "mongodb://localhost:27017/karlverse-dev" // Local MongoDB for development
    : process.env.MONGO_URI; // Production CosmosDB

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB (${ENV})`))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Register Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Example API for tracking job applications
app.get("/api/streak-goals", (req, res) => {
    res.json({ streak: 0, applicationsThisWeek: 0, goal: 10 });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
