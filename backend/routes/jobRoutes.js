import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import mongoose from "mongoose";
import Job from "../models/Job.js";

const router = express.Router();

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "MISSING");

// Helper function to add follow-up dates only on Tue/Wed/Thu
const addFollowUpDate = (startDate, daysAhead) => {
  let date = new Date(startDate);
  date.setDate(date.getDate() + daysAhead);

  // Ensure the date falls on Tuesday (2), Wednesday (3), or Thursday (4)
  while (![2, 3, 4].includes(date.getDay())) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString();
};

// POST /scrape-job
// This route scrapes a job posting, sends the raw text to the AI for structured data,
// processes the response, and saves the new job to the database.
router.post("/scrape-job", async (req, res) => {
  const { jobUrl } = req.body;
  console.log("Received job URL:", jobUrl);

  try {
    const { data } = await axios.get(jobUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(data);
    const rawText = $("body").text().replace(/\s+/g, " ").trim();

    // Get AI response for structured job details
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that extracts job postings and returns structured data. Always return a valid JSON object."
        },
        {
          role: "user",
          content: `Extract structured job details from the following job posting. 
              Get as much information as possible. 
              Get salary as a number or range in USD. 
              For the job description, responsibilities, and qualifications get them exactly as they are in the raw data and make sure no raw html is left over. Add spacing and paragraphs for readability. 
              The AI generated summary of the job should tell the user what the company is looking for in that role as far as experience or qualifications, and what they can expect from the role. As well as what the tech stack is if it is mentioned in the description or any skills, tech stack and skills should be in skills. Skills are different than qualifications or certifications and could be something the AI thinks is a skill based on the context of the job description:
          
${rawText}

Return a JSON object with these fields:
{
  "jobTitle": "Job Title Here",
  "companyName": "Company Name Here",
  "salary": "Salary Here",
  "description": "Job Description Here",
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "qualifications": ["Qualification 1", "Qualification 2"],
  "preferredQualifications": ["Preferred Qualification 1"],
  "certifications": ["Certification 1"],
  "skills": ["Skill 1"],
  "aiSummary": "AI-Generated Job Summary Here"
}

VERY IMPORTANT: ONLY return a valid JSON object formatted above. Do NOT include any other text before or after the JSON. Under no circumstances should you return invalid JSON or a JSON that doesn't match the format.`
        }
      ]
    });

    // Remove markdown code fences if present
    let aiContent = response.choices[0].message.content;
    if (aiContent.startsWith("```json")) {
      aiContent = aiContent.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    let extractedData;
    try {
      extractedData = JSON.parse(aiContent);
    } catch (error) {
      console.error("Error parsing AI response:", error.message);
      return res.status(500).json({ error: "Failed to process AI-generated job details." });
    }

    const newJob = new Job({
      jobUrl,
      ...extractedData
    });

    await newJob.save();
    console.log("Added new job:", newJob);
    res.json({ success: true, job: newJob });
  } catch (error) {
    console.error("Error adding job:", error.message);
    res.status(500).json({ error: "Failed to process job details" });
  }
});

// GET /job-metrics
// Returns metrics calculated from all jobs in the database.
router.get("/job-metrics", async (req, res) => {
  try {
    const jobs = await Job.find();
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalJobs: jobs.length,
      appliedJobs: statusCounts["Applied"] || 0,
      interviews: statusCounts["Interviewing"] || 0,
      jobOffers: statusCounts["Job Offer"] || 0,
      followUps: jobs.filter(
        job =>
          job.followUpDates &&
          Object.values(job.followUpDates).some(date => new Date(date) <= new Date())
      ).length,
      statusCounts
    });
  } catch (error) {
    console.error("Error getting job metrics:", error.message);
    res.status(500).json({ error: "Failed to get job metrics" });
  }
});

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error("Error getting jobs:", error.message);
    res.status(500).json({ error: "Failed to get jobs" });
  }
});

// GET a job by ID (with ObjectId validation)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job id." });
  }
  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ success: true, job });
  } catch (error) {
    console.error("Error retrieving job:", error.message);
    res.status(500).json({ error: "Failed to get job" });
  }
});

// DELETE a job by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job id." });
  }
  try {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ success: true, message: "Job deleted." });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// UPDATE Job Status & Schedule Follow-Ups
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job id." });
  }
  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (status === "Applied" && !job.dateApplied) {
      let appliedDate = new Date();
      job.dateApplied = appliedDate.toISOString();
      job.followUpDates = {
        FirstFollowUp: addFollowUpDate(appliedDate, 5),
        SecondFollowUp: addFollowUpDate(appliedDate, 10),
        FinalFollowUp: addFollowUpDate(appliedDate, 15)
      };
    }
    job.status = status;
    await job.save();
    console.log("Updated job status:", job);
    res.json({ success: true, updatedJob: job });
  } catch (error) {
    console.error("Error updating job status:", error.message);
    res.status(500).json({ error: "Failed to update job status" });
  }
});

// UPDATE job notes
router.patch("/:id/notes", async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job id." });
  }
  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    job.notes = notes;
    await job.save();
    console.log("Updated job notes:", job);
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Error updating job notes:", error.message);
    res.status(500).json({ error: "Failed to update job notes" });
  }
});

export default router;
