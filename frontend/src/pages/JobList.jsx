import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaPaperPlane, FaComments, FaBriefcase, FaGhost, FaTimes } from "react-icons/fa";

const STATUS_OPTIONS = {
  "Need to Apply": { color: "bg-red-500", icon: <FaClipboardList /> },
  "Applied": { color: "bg-yellow-500", icon: <FaPaperPlane /> },
  "Interviewing": { color: "bg-blue-500", icon: <FaComments /> },
  "Job Offer": { color: "bg-green-500", icon: <FaBriefcase /> },
  "Ghosted": { color: "bg-gray-500", icon: <FaGhost /> },
  "Not Moving Forward": { color: "bg-black", icon: <FaTimes /> }
};

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState("detailed");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetch(`${API_URL}/jobs`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs);
      });
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortField === "dateAdded") {
      return sortOrder === "asc"
        ? new Date(a.dateAdded) - new Date(b.dateAdded)
        : new Date(b.dateAdded) - new Date(a.dateAdded);
    } else if (sortField === "dateApplied") {
      return sortOrder === "asc"
        ? new Date(a.dateApplied || 0) - new Date(b.dateApplied || 0)
        : new Date(b.dateApplied || 0) - new Date(a.dateApplied || 0);
    } else if (sortField === "jobTitle") {
      return sortOrder === "asc"
        ? a.jobTitle.localeCompare(b.jobTitle)
        : b.jobTitle.localeCompare(a.jobTitle);
    } else if (sortField === "companyName") {
      return sortOrder === "asc"
        ? a.companyName.localeCompare(b.companyName)
        : b.companyName.localeCompare(a.companyName);
    } else if (sortField === "status") {
      return sortOrder === "asc"
        ? Object.keys(STATUS_OPTIONS).indexOf(a.status) - Object.keys(STATUS_OPTIONS).indexOf(b.status)
        : Object.keys(STATUS_OPTIONS).indexOf(b.status) - Object.keys(STATUS_OPTIONS).indexOf(a.status);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark p-8 pt-20 transition-all">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary dark:text-highlight">Job List</h1>
          <button
            onClick={() => setViewMode(viewMode === "detailed" ? "list" : "detailed")}
            className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-md"
          >
            Switch to {viewMode === "detailed" ? "List View" : "Detailed View"}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
          />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
          >
            <option value="dateAdded">Sort by Date Added</option>
            <option value="dateApplied">Sort by Date Applied</option>
            <option value="status">Sort by Status</option>
            <option value="jobTitle">Sort by Job Title</option>
            <option value="companyName">Sort by Company</option>
            <option value="salary">Sort by Salary</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 bg-gray-400 dark:bg-gray-700 text-white rounded-md"
          >
            {sortOrder === "asc" ? "▲ Ascending" : "▼ Descending"}
          </button>
        </div>
        {viewMode === "detailed" ? (
          sortedJobs.map((job) => (
            <div key={job._id} className="p-4 border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <Link to={`/jobs/${job._id}`} className="text-lg font-semibold text-blue-500 hover:underline">
                  {job.jobTitle}
                </Link>
                <div className={`px-3 py-1 text-white ${STATUS_OPTIONS[job.status]?.color} rounded-md`}>
                  {job.status}
                </div>
              </div>
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                <p><strong>Company:</strong> {job.companyName}</p>
                <p>
                  <strong>Date Applied:</strong> {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString("en-US") : "N/A"}
                </p>
                <p><strong>Salary:</strong> {job.salary}</p>
                <p><strong>AI Summary:</strong> {job.aiSummary}</p>
              </div>
              <div className="flex items-center mt-4 space-x-4">
                {Object.entries(STATUS_OPTIONS).map(([statusKey, { color, icon }]) => (
                  <div key={statusKey} className="flex items-center">
                    <div className={`p-2 rounded-full text-white transition-all ${
                      job.status === statusKey ? color + " scale-110" : "bg-gray-400 hover:scale-110"
                    }`}>
                      {icon}
                    </div>
                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-300 hidden md:block">
                      {statusKey}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-2">Job Title</th>
                <th className="p-2">Company</th>
                <th className="p-2">Status</th>
                <th className="p-2">Salary</th>
                <th className="p-2">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {sortedJobs.map((job) => (
                <tr key={job._id} className="border-b dark:border-gray-700">
                  <td className="p-2">
                    <Link to={`/jobs/${job._id}`} className="text-blue-500 hover:underline">
                      {job.jobTitle}
                    </Link>
                  </td>
                  <td className="p-2">{job.companyName}</td>
                  <td className="p-2">
                    <div className={`px-2 py-1 text-white ${STATUS_OPTIONS[job.status]?.color} rounded-md`}>
                      {job.status}
                    </div>
                  </td>
                  <td className="p-2">{job.salary || "N/A"}</td>
                  <td className="p-2">{job.dateApplied || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default JobList;
