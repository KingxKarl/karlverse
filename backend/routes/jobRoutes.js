import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import Job from "../models/Job.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to add follow-ups only on Tue/Wed/Thu
const addFollowUpDate = (startDate, daysAhead) => {
    let date = new Date(startDate);
    date.setDate(date.getDate() + daysAhead);

    while (![2, 3, 4].includes(date.getDay())) { // 2 = Tue, 3 = Wed, 4 = Thu
        date.setDate(date.getDate() + 1);
    }

    return date.toISOString();
};

// Add a New Job (Scape & Store)
router.post("/scrape-job", async (req, res) => {
    const { jobUrl } = req.body;
    console.log("Received job URL:", jobUrl);

    try {
        const { data } = await axios.get(jobUrl, {headers: {"User-Agent": "Mozilla/5.0"}});

        const $ = cheerio.load(data);
        const rawText = $("body").text().replace(/\s+/g, " ").trim();

        // AI Model for Structuring Job Data
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an AI that extracts job postings and returns structured data. Always return a valid JSON object."
                },
                {
                    role: "user",
                    content: `Extract structured job details from the following job posting. Get as much information as possible. Get salary as a number or range in USD. For the job description, responsibilities, and qualifications get them exactly as they are in the raw data and make sure no raw html is left over. Add spacing and paragraphs for readability  The AI generated summary of the job should tell the user what the company is looking for in that role, and what they can expect from the role, as well as what the tech stack is if it is mentioned in the description:\n\n${rawText}\n\nReturn a JSON object with these fields:
            {
              "jobTitle": "Job Title Here",
              "companyName": "Company Name Here",
              "salary": "Salary Here",
              "description": "Job Description Here",
              "responsibilities": ["Responsibility 1", "Responsibility 2"],
              "qualifications": ["Qualification 1", "Qualification 2"],
              "preferredQualifications": ["Preferred Qualification 1"],
              "certifications": ["Certification 1"],
              "aiSummary": "AI-Generated Job Summary Here"
            }
      
           VERY IMPORTANT TO ONLY return a valid JSON object formatted above. Do NOT include any other text before or after the JSON. Under no circumstances should you return invalid JSON or a JSON that doesn't match the format.`
                }
            ]
        });

        let extractedData;
        try {
            extractedData = JSON.parse(response.choices[0].message.content);
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

// Get all jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json({ 
            success: true, 
            count : jobs.length,
            jobs });
    } catch (error) {
        console.error("Error getting jobs:", error.message);
        res.status(500).json({ error: "Failed to get jobs" });
    }
});

// GET a job by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.json({ success: true, job });
});

// Get job metrics
router.get("/job-metrics", (req, res) => {
    const statusCounts = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
    }, {});

    res.json({
        totalJobs: jobs.length,
        appliedJobs: statusCounts["Applied"] || 0,
        interviews: statusCounts["Interviewing"] || 0,
        jobOffers: statusCounts["Job Offer"] || 0,
        followUps: jobs.filter(job => job.followUpDates && Object.values(job.followUpDates).some(date => new Date(date) <= new Date())).length,
        statusCounts
    });
});

// Delete a job by ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
});

// Update Job Status & Schedule Follow-Ups
router.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

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
});

// Update job notes
router.patch("/:id/notes", async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    job.notes = notes;
    await job.save();

    console.log("Updated job notes:", job);
    res.json({ success: true, notes });
});

export default router;