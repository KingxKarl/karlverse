import mongoose from "mongoose";

// Define Job schema
const jobSchema = new mongoose.Schema({
  jobUrl: String,
  jobTitle: String,
  companyName: String,
  salary: String,
  description: String,
  responsibilities: [String],
  qualifications: [String],
  preferredQualifications: [String],
  certifications: [String],
  skills: [String],
  aiSummary: String,
  status: { type: String, default: "Need to Apply" },
  dateAdded: { type: Date, default: Date.now },
  dateApplied: Date,
  notes: { type: Array, default: [] },
  followUpDates: { type: Object, default: null },
  // Reference to the user who created the job
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

// Create and export Job model
const Job = mongoose.model("Job", jobSchema);
export default Job;
