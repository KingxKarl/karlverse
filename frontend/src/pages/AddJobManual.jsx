import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddJobManual() {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    companyName: "",
    jobTitle: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    preferredQualifications: "",
    certifications: "",
    aiSummary: "",
    status: "Need to Apply",
    jobUrl: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format fields that are expected to be arrays
    const formattedData = {
      ...jobData,
      responsibilities: jobData.responsibilities
        ? jobData.responsibilities.split("\n").map((line) => line.trim())
        : [],
      qualifications: jobData.qualifications
        ? jobData.qualifications.split("\n").map((line) => line.trim())
        : [],
      preferredQualifications: jobData.preferredQualifications
        ? jobData.preferredQualifications.split("\n").map((line) => line.trim())
        : [],
      certifications: jobData.certifications
        ? jobData.certifications.split("\n").map((line) => line.trim())
        : [],
      dateAdded: new Date().toISOString()
    };

    try {
      const response = await fetch("https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error("Failed to add job.");
      }

      navigate("/");
    } catch (error) {
      console.error("Error adding job:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark p-8 pt-20 transition-all">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold text-primary dark:text-highlight">Manually Add Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={jobData.jobTitle}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={jobData.companyName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Job Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Responsibilities (one per line)</label>
            <textarea
              name="responsibilities"
              value={jobData.responsibilities}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Qualifications (one per line)</label>
            <textarea
              name="qualifications"
              value={jobData.qualifications}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Preferred Qualifications (one per line)</label>
            <textarea
              name="preferredQualifications"
              value={jobData.preferredQualifications}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Certifications (one per line)</label>
            <textarea
              name="certifications"
              value={jobData.certifications}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">AI-Generated Summary (Optional)</label>
            <textarea
              name="aiSummary"
              value={jobData.aiSummary}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Job Status</label>
            <select
              name="status"
              value={jobData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="Need to Apply">Need to Apply</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Hired">Hired</option>
              <option value="Ghosted">Ghosted</option>
              <option value="Not Moving Forward">Not Moving Forward</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Job Posting URL (Optional)</label>
            <input
              type="url"
              name="jobUrl"
              value={jobData.jobUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-primary text-white rounded-md hover:bg-primaryHover transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddJobManual;
