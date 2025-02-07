import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaPaperPlane,
  FaComments,
  FaBriefcase,
  FaGhost,
  FaTimes,
  FaCalendarAlt,
  FaTrash
} from "react-icons/fa";

const STATUS_OPTIONS = {
  "Need to Apply": { color: "bg-red-500", icon: <FaClipboardList />, label: "Need to Apply" },
  "Applied": { color: "bg-yellow-500", icon: <FaPaperPlane />, label: "Applied" },
  "Interviewing": { color: "bg-blue-500", icon: <FaComments />, label: "Interviewing" },
  "Job Offer": { color: "bg-green-500", icon: <FaBriefcase />, label: "Job Offer" },
  "Ghosted": { color: "bg-gray-500", icon: <FaGhost />, label: "Ghosted" },
  "Not Moving Forward": { color: "bg-black", icon: <FaTimes />, label: "Not Moving Forward" }
};

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [jobNotes, setJobNotes] = useState([]);

  const fetchJobDetails = () => {
    fetch(`https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data.job);
        setStatus(data.job.status);
        setJobNotes(data.job.notes || []);
      })
      .catch(() => navigate("/"));
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, navigate]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  const checkFollowUpStatus = (date) => {
    const today = new Date();
    const followUpDate = new Date(date);
    return followUpDate < today ? "text-red-500 font-bold" : "text-gray-700 dark:text-gray-300";
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    await fetch(`https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/jobs/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchJobDetails();
  };

  const handleNoteChange = (e) => {
    setNotes(e.target.value);
  };

  const saveNote = async () => {
    if (!notes.trim()) return;
    const newNote = { text: notes, date: new Date().toLocaleString() };
    const updatedNotes = [...jobNotes, newNote];
    await fetch(`https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/jobs/${id}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: updatedNotes })
    });
    setJobNotes(updatedNotes);
    setNotes("");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await fetch(`https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/jobs/${id}`, {
          method: "DELETE"
        });
        navigate("/");
      } catch (error) {
        console.error("Error deleting job:", error.message);
      }
    }
  };

  if (!job) return <p className="text-center text-gray-500">Loading job...</p>;

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark p-8 pt-20 transition-all">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-highlight transition"
          >
            &larr; Back to Job List
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition"
            title="Delete Job"
          >
            <FaTrash size={20} />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-primary dark:text-highlight">{job.jobTitle}</h1>
        <h2 className="text-lg text-gray-700 dark:text-gray-300 mb-4">{job.companyName}</h2>
        <h2 className="text-lg text-gray-700 dark:text-gray-300 mb-4">{job.salary}</h2>
        {job.followUpDates && Object.keys(job.followUpDates).length > 0 && (
          <div className="mt-6 bg-gray-200 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaCalendarAlt className="mr-2" /> Follow-Up Schedule
            </h3>
            <ul className="mt-2 text-gray-700 dark:text-gray-300">
              {Object.entries(job.followUpDates).map(([key, date]) => (
                <li key={key} className={checkFollowUpStatus(date)}>
                  📅 {key.replace(/([A-Z])/g, " $1").trim()}: {new Date(date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Original Job Posting
          </a>
        </div>
        <div className="mt-4 text-gray-700 dark:text-gray-300">
          <p><strong>Date Added:</strong> {formatDate(job.dateAdded)}</p>
          <p><strong>Date Applied:</strong> {formatDate(job.dateApplied)}</p>
        </div>
        <div className="flex justify-between items-center mt-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-md">
          {Object.entries(STATUS_OPTIONS).map(([statusKey, { color, icon, label }]) => (
            <div key={statusKey} className="flex flex-col items-center">
              <button
                onClick={() => handleStatusChange(statusKey)}
                className={`p-2 rounded-full text-white transition-all ${
                  job.status === statusKey ? color + " scale-110" : "bg-gray-400 hover:scale-110"
                }`}
              >
                {icon}
              </button>
              <span className="text-xs mt-1 text-gray-700 dark:text-gray-300 hidden md:block">{label}</span>
            </div>
          ))}
        </div>
        {job.aiSummary && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Generated Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{job.aiSummary}</p>
          </div>
        )}
        {job.responsibilities?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Responsibilities</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {job.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {job.qualifications?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Qualifications</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {job.qualifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {job.preferredQualifications?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Preferred Qualifications</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {job.preferredQualifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {job.certifications?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Certifications</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {job.certifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Skills</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              {job.skills.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <details className="mt-6 bg-gray-200 dark:bg-gray-700 p-4 rounded-md">
          <summary className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer">
            Job Overview
          </summary>
          <div className="mt-2 text-gray-700 dark:text-gray-300">
            <p>{job.description}</p>
          </div>
        </details>
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Job Notes</h3>
          <textarea
            value={notes}
            onChange={handleNoteChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            rows="3"
            placeholder="Add a note..."
          />
          <button
            onClick={saveNote}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-highlight transition"
          >
            Save Note
          </button>
          {jobNotes.length > 0 && (
            <ul className="mt-4 list-disc list-inside text-gray-700 dark:text-gray-300">
              {jobNotes.map((note, index) => (
                <li key={index}>
                  <strong>{note.date}:</strong> {note.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
