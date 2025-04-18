import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config";

const Dashboard = () => {
  const { auth } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [jobLink, setJobLink] = useState("");

  // Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      /* try {
        const token = auth.token;
        if (!token) {
          console.warn("No auth token available; skipping fetch.");
          return;
        }
      */
        const response = await fetch(`${API_URL}/jobs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      }
    };

    fetchJobs();
  }, [auth.token]);

  // Filter Jobs
  useEffect(() => {
    if (activeTab === "applied") {
      setFilteredJobs(jobs.filter((job) => job.status === "Applied"));
    } else if (activeTab === "saved") {
      setFilteredJobs(jobs.filter((job) => job.status === "Saved"));
    } else {
      setFilteredJobs(jobs);
    }
  }, [activeTab, jobs]);

  // Add Job via Link
  const handleJobLinkSubmit = async () => {
    if (!jobLink.trim()) return;

    try {
      const token = auth.token;
     /* if (!token) {
        console.error("No auth token found; user may not be logged in.");
        return;
      }

*/
      const response = await fetch(`${API_URL}/jobs/scrape-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ jobUrl: jobLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to add job");
      }

      const newJobResponse = await response.json();
      const newJob = newJobResponse.job;
      setJobs((prevJobs) => [...prevJobs, newJob]);
      setJobLink("");
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Job Hunt Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-md shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Total Jobs Added</h3>
          <p className="text-2xl font-bold text-primary">{jobs.length}</p>
        </div>
        <div className="bg-card p-4 rounded-md shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Jobs Applied</h3>
          <p className="text-2xl font-bold text-primary">{jobs.filter((job) => job.status === "Applied").length}</p>
        </div>
        <div className="bg-card p-4 rounded-md shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Job Offers</h3>
          <p className="text-2xl font-bold text-primary">{jobs.filter((job) => job.status === "Offer").length}</p>
        </div>
        <div className="bg-card p-4 rounded-md shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Saved Jobs</h3>
          <p className="text-2xl font-bold text-primary">{jobs.filter((job) => job.status === "Saved").length}</p>
        </div>
      </div>

      {/* Add Job Section */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h3 className="font-semibold text-lg mb-2">Add a Job Posting</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste job posting link..."
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleJobLinkSubmit}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Add Job
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {["all", "applied", "saved"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 text-lg ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
          </button>
        ))}
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job._id} className="bg-card p-4 rounded-md shadow-md">
              <h3 className="font-bold text-lg">{job.jobTitle}</h3>
              <p className="text-gray-600">
                {job.companyName} {job.location ? `• ${job.location}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {job.description ? `${job.description.slice(0, 100)}...` : "No description available."}
              </p>
              <Link to={`/jobs/${job._id}`} className="block mt-3 text-primary hover:underline">
                View Details →
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
