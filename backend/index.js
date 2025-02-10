import express from "express";
import cors from "cors"; // NEW: Import the cors package
import mongoose from "mongoose";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();
const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

// Define allowed origins from environment variable or default to local and your production frontend URLs.
// (In production, set ALLOWED_ORIGINS in your Azure Application Settings, e.g. "https://your-prod-frontend.com")
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:5173", "https://karlverse-bfdbcsbge7f5e6bh.eastus2-01.azurewebsites.net"];

const app = express();

// Configure CORS to allow requests from the specified origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow credentials if needed (cookies, authorization headers, etc.)
}));

// Handle preflight OPTIONS requests for all routes
app.options("*", cors());

// Use JSON middleware
app.use(express.json());

// MongoDB Connection
const mongoURI = ENV === "development"
  ? "mongodb://localhost:27017/karlverse-dev" // Local DB in dev
  : process.env.MONGO_URI; // Production DB (set via Azure environment variables)

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB (${ENV})`))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Register Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Example endpoint for job metrics
app.get("/api/streak-goals", (req, res) => {
  res.json({ streak: 0, applicationsThisWeek: 0, goal: 10 });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
