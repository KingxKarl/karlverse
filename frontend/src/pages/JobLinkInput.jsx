import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JobLinkInput() {
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrapeJob = async () => {
    if (!jobUrl) return;
    setLoading(true);

    try {
      const response = await fetch("https://karlverse-backend-h4c8csewhye0hzda.eastus2-01.azurewebsites.net/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add job: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Job Added:", result.job);

      // Redirect to job list after adding
      navigate("/job-list");
    } catch (error) {
      alert("Error adding job.");
      console.error("Scraping error:", error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark p-8 pt-20 transition-all">
      <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-md">
        <h1 className="text-3xl font-bold text-primary dark:text-highlight">Paste Job Posting URL</h1>
        
        <input
          className="w-full p-2 border border-gray-300 rounded-md mt-4"
          type="url"
          placeholder="Paste job posting URL here..."
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
        />
        <button
          onClick={handleScrapeJob}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Job"}
        </button>
      </div>
    </div>
  );
}

export default JobLinkInput;
