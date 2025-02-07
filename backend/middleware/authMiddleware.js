import jwt from "jsonwebtoken";
import Job from "../models/Job.js";

// Middleware to ensure the user is authenticated via JWT
export function ensureAuthenticated(req, res, next) {
  // Try to extract token from the Authorization header or from cookies.
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded; // Expected payload: { id, email, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

// Middleware to ensure that the job belongs to the authenticated user (unless admin)
export async function ensureJobOwner(req, res, next) {
  const jobId = req.params.id;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    // If the user is not an admin, check if they own the job.
    if (req.user.role !== "admin" && job.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You do not own this job." });
    }
    req.job = job;
    next();
  } catch (err) {
    console.error("Error in ensureJobOwner:", err);
    res.status(500).json({ message: "Server error" });
  }
}
