import mongoose from "mongoose";

// Define the Job schema with a reference to the user owner.
const jobSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
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
  followUpDates: { type: Object, default: null }
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
