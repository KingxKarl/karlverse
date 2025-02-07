import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import { ensureAuthenticated, ensureJobOwner } from "../middleware/authMiddleware.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "MISSING");

// Helper function to add follow-up dates (same as before)
const addFollowUpDate = (startDate, daysAhead) => {
  let date = new Date(startDate);
  date.setDate(date.getDate() + daysAhead);
  while (![2, 3, 4].includes(date.getDay())) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString();
};

/** POST /scrape-job
 *  Scrapes a job posting, extracts data via the AI, and saves a new job.
 *  Only an authenticated user can add a job.
 */
router.post("/scrape-job", ensureAuthenticated, async (req, res) => {
  const { jobUrl } = req.body;
  console.log("Received job URL:", jobUrl);
  try {
    const { data } = await axios.get(jobUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);
    const rawText = $("body").text().replace(/\s+/g, " ").trim();

    // Get structured job details from the AI model
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
          
${rawText}

Return a JSON object with the fields: jobTitle, companyName, salary, description, responsibilities, qualifications, preferredQualifications, certifications, skills, aiSummary.
          
VERY IMPORTANT: ONLY return valid JSON.`
        }
      ]
    });

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

    // Create a new Job with the current user as the owner.
    const newJob = new Job({
      user: req.user._id,
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

/** GET /api/jobs
 *  Returns jobs for the authenticated user; admins get all jobs.
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let jobs;
    if (req.user.role === "admin") {
      jobs = await Job.find();
    } else {
      jobs = await Job.find({ user: req.user._id });
    }
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error("Error getting jobs:", error.message);
    res.status(500).json({ error: "Failed to get jobs" });
  }
});

/** GET /api/jobs/:id
 *  Returns a single job if the user is its owner (or admin).
 */
router.get("/:id", ensureAuthenticated, ensureJobOwner, async (req, res) => {
  res.json({ success: true, job: req.job });
});

/** DELETE /api/jobs/:id
 *  Deletes a job if the user owns it (or is admin).
 */
router.delete("/:id", ensureAuthenticated, ensureJobOwner, async (req, res) => {
  try {
    await req.job.remove();
    res.json({ success: true, message: "Job deleted." });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

/** PATCH /api/jobs/:id/status
 *  Updates job status (and schedules follow-ups if needed) for an owned job.
 */
router.patch("/:id/status", ensureAuthenticated, ensureJobOwner, async (req, res) => {
  const { status } = req.body;
  try {
    if (status === "Applied" && !req.job.dateApplied) {
      const appliedDate = new Date();
      req.job.dateApplied = appliedDate.toISOString();
      req.job.followUpDates = {
        FirstFollowUp: addFollowUpDate(appliedDate, 5),
        SecondFollowUp: addFollowUpDate(appliedDate, 10),
        FinalFollowUp: addFollowUpDate(appliedDate, 15)
      };
    }
    req.job.status = status;
    await req.job.save();
    console.log("Updated job status:", req.job);
    res.json({ success: true, updatedJob: req.job });
  } catch (error) {
    console.error("Error updating job status:", error.message);
    res.status(500).json({ error: "Failed to update job status" });
  }
});

/** PATCH /api/jobs/:id/notes
 *  Updates job notes for an owned job.
 */
router.patch("/:id/notes", ensureAuthenticated, ensureJobOwner, async (req, res) => {
  const { notes } = req.body;
  try {
    req.job.notes = notes;
    await req.job.save();
    console.log("Updated job notes:", req.job);
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Error updating job notes:", error.message);
    res.status(500).json({ error: "Failed to update job notes" });
  }
});

export default router;
