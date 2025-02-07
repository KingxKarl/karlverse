import Job from "../models/Job.js";

// Middleware to ensure the user is authenticated
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure that the job being accessed belongs to the user (or user is admin)
export async function ensureJobOwner(req, res, next) {
  const jobId = req.params.id;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    // Allow if the user is admin; otherwise, check ownership.
    if (req.user.role !== "admin" && job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this job." });
    }
    // Attach the job document for later use
    req.job = job;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
