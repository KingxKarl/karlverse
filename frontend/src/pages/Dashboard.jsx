import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClipboardList, FaExclamationTriangle, FaFire } from "react-icons/fa";
import { set } from "mongoose";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [jobUrl, setJobUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState(0);
  const [interviewingJobs, setInterviewingJobs] = useState(0);
  const [offersReceived, setOffersReceived] = useState(0);
  const [followUps, setFollowUps] = useState(0);
  const [applicationStreak, setApplicationStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [weeklyApplications, setWeeklyApplications] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    calculateDashboardMetrics(jobs);
  }, [jobs]);

  // 🔹 Fetch jobs & calculate metrics
  const fetchDashboardData = () => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        if (data.jobs && Array.isArray(data.jobs)){
          setJobs(data.jobs);
        } else {
          console.error("Unexpected API response format:", data);
          setJobs([]);
        }
        calculateDashboardMetrics(data.jobs);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setJobs([]);
      });
  };

  // 🔹 Function to calculate dashboard metrics dynamically
  const calculateDashboardMetrics = (jobs) => {
    setTotalJobs(jobs.length);
    setAppliedJobs(jobs.filter((job) => job.status === "Applied").length);
    setInterviewingJobs(jobs.filter((job) => job.status === "Interviewing").length);
    setOffersReceived(jobs.filter((job) => job.status === "Job Offer").length);
    setFollowUps(jobs.filter((job) => job.status === "Applied" && job.followUpDates && Object.values(job.followUpDates).some((date) => new Date(date) <= new Date())).length);

    // 🔥 Application Streak Calculation
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const appliedDates = jobs
      .filter((job) => job.dateApplied)
      .map((job) => job.dateApplied.split("T")[0])
      .sort((a, b) => new Date(b) - new Date(a)); // Sort in descending order

    let streak = 0;
    for (let i = 0; i < appliedDates.length; i++) {
      const streakDate = new Date();
      streakDate.setDate(streakDate.getDate() - i);
      if (appliedDates.includes(streakDate.toISOString().split("T")[0])) {
        streak++;
      } else {
        break; // Streak ends if a day is missing
      }
    }
    setApplicationStreak(streak);

    // 🎯 Weekly Goal Calculation
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week (Sunday)
    setWeeklyApplications(jobs.filter((job) => job.dateApplied && new Date(job.dateApplied) >= weekStart).length);
  };

  // 🔹 Handle job addition and refresh UI
  const handleAddJob = async () => {
    if (!jobUrl.trim()) return;
    setIsAdding(true);

    try {
      const response = await fetch("http://localhost:5000/api/jobs/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await response.json();
      if (data.success) {
        setJobs((prevJobs) => [...prevJobs, data.job]);
      }
    } catch (error) {
      console.error("Error adding job:", error);
    } finally {
      setIsAdding(false);
      setJobUrl("");
    }
  };

  // 🔹 Categorize Jobs
  const needToApplyJobs = jobs.filter((job) => job.status === "Need to Apply");
  const recentlyAddedJobs = [...jobs].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);
  const followUpJobs = jobs.filter(
    (job) =>
      job.status === "Applied" &&
      job.followUpDates &&
      Object.values(job.followUpDates).some((date) => new Date(date) <= new Date())
  );

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark p-8 pt-20 transition-all">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        
        {/* 🔹 Job URL Input Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-highlight mb-4">Dashboard</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste Job Posting URL..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleAddJob}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isAdding ? "Adding Job..." : "Add Job"}
            </button>
          </div>
        </div>

        {/* 🔹 Job Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Jobs</h3>
            <p className="text-xl font-bold text-primary dark:text-highlight">{totalJobs}</p>
          </div>
          <div className="p-4 bg-yellow-200 dark:bg-yellow-700 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applied</h3>
            <p className="text-xl font-bold">{appliedJobs}</p>
          </div>
          <div className="p-4 bg-green-200 dark:bg-green-700 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offers</h3>
            <p className="text-xl font-bold">{offersReceived}</p>
          </div>
          <div className="p-4 bg-red-200 dark:bg-red-700 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Follow-Ups</h3>
            <p className="text-xl font-bold">{followUps}</p>
          </div>
          <div className="p-4 bg-orange-200 dark:bg-orange-700 rounded-md flex items-center">
            <FaFire className="text-orange-500 text-2xl mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Streak</h3>
              <p className="text-xl font-bold">{applicationStreak} Days</p>
            </div>
          </div>
        </div>

        {/* 🔹 Recently Added Jobs */}
        <div className="mb-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FaExclamationTriangle className="mr-2 text-gray-700 dark:text-gray-400" /> Recently Added
          </h2>
          <ul className="mt-2 text-gray-800 dark:text-gray-300">
            {recentlyAddedJobs.map((job) => (
              <li key={job._id} className="flex justify-between border-b border-gray-300 py-2">
                <Link to={`/jobs/${job._id}`} className="text-blue-500 hover:underline">
                  {job.jobTitle} @ {job.companyName}
                </Link>
                <span>{new Date(job.dateAdded).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
