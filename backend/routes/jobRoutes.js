// Ensure environment variables are loaded
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Debugging: Check if OpenAI API Key is loading
console.log("OPENAI_API_KEY in jobRoutes:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { chromium } from "playwright";

const router = express.Router();

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Apply auth middleware to all routes
// Temp disable auth
// router.use(authMiddleware);

// POST /api/jobs/scrape-job - Scrape job posting, generate details via AI, and save job
router.post("/scrape-job", async (req, res) => {

  const { jobUrl } = req.body;
  console.log("Received job URL:", jobUrl);

  if (!jobUrl || typeof jobUrl !== "string" || !jobUrl.trim()) {
    return res.status(400).json({ error: "Invalid job URL" });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(jobUrl, { waitUntil: "networkidle" });
    const data = await page.content(); // Get the complete HTML content after rendering
    await browser.close();


    const $ = cheerio.load(data);
    const rawText = $("body").text().replace(/\s+/g, " ").trim();
    
    // Log the first 500 characters of rawText for debugging
    console.log("Extracted raw text (first 500 chars):", rawText.substring(0, 500));

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
          content: `Extract structured job details from the following job posting. Extract the job title and all information exactly as it appears in the posting; do not return any default or cached value.
Get as much information as possible. 
Get salary as a number or range in USD. 
For the job description, responsibilities, and qualifications get them exactly as they are in the raw data and make sure no raw html is left over. Add spacing and paragraphs for readability. 
The AI generated summary of the job should tell the user what the company is looking for in that role as far as experience or qualifications, and what they can expect from the role. As well as what the tech stack is if it is mentioned in the description or any skills, tech stack and skills should be in skills. Skills are different than qualifications or certifications and could be something the AI thinks is a skill based on the context of the job posting:
          
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

    // Create a new job and associate it with the authenticated user (req.user.id)
    const newJob = new Job({
      jobUrl,
      ...extractedData,
      user: req.user.id
    });

    await newJob.save();
    console.log("Added new job:", newJob);
    res.json({ success: true, job: newJob });
  } catch (error) {
    console.error("Error adding job:", error.message);
    res.status(500).json({ error: "Failed to process job details" });
  }
});

// GET /api/jobs/job-metrics - Returns calculated metrics from jobs (only for current user unless admin)
router.get("/job-metrics", async (req, res) => {
  try {
    // Use empty query for admin, else only user-owned jobs
    const query = req.user.role === "admin" ? {} : { user: req.user.id };
    const jobs = await Job.find(query);
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
        job => job.followUpDates && Object.values(job.followUpDates).some(date => new Date(date) <= new Date())
      ).length,
      statusCounts
    });
  } catch (error) {
    console.error("Error getting job metrics:", error.message);
    res.status(500).json({ error: "Failed to get job metrics" });
  }
});

// GET /api/jobs/ - Get all jobs (only those belonging to the user unless admin)
router.get("/", async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user.id };
    const jobs = await Job.find(query);
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error("Error getting jobs:", error.message);
    res.status(500).json({ error: "Failed to get jobs" });
  }
});

// GET /api/jobs/:id - Get a job by ID (with ownership check)
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
    // If not admin, ensure the job belongs to the user
    if (req.user.role !== "admin" && String(job.user) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({ success: true, job });
  } catch (error) {
    console.error("Error retrieving job:", error.message);
    res.status(500).json({ error: "Failed to get job" });
  }
});

// DELETE /api/jobs/:id - Delete a job by ID (with ownership check)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job id." });
  }
  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (req.user.role !== "admin" && String(job.user) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await Job.findByIdAndDelete(id);
    res.json({ success: true, message: "Job deleted." });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// PATCH /api/jobs/:id/status - Update job status and schedule follow-ups
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
    if (req.user.role !== "admin" && String(job.user) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
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
    res.json({ success: true, updatedJob: job });
  } catch (error) {
    console.error("Error updating job status:", error.message);
    res.status(500).json({ error: "Failed to update job status" });
  }
});

// PATCH /api/jobs/:id/notes - Update job notes
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
    if (req.user.role !== "admin" && String(job.user) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    job.notes = notes;
    await job.save();
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Error updating job notes:", error.message);
    res.status(500).json({ error: "Failed to update job notes" });
  }
});

export default router;
