const API_URL = import.meta.env.VITE_API_URL;
export default API_URL;

export const fetchJobs = async () => {
  const response = await fetch(`${API_URL}/jobs`);
  return response.json();
};

export const addJob = async (jobData) => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData)
  });
  return response.json();
};

export const scrapeJobDetails = async (jobUrl) => {
  try {
    console.log("Sending request to backend:", jobUrl);
    const response = await fetch(`${API_URL}/jobs/scrape-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobUrl })
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch job details: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Received job details:", data);
    return data;
  } catch (error) {
    console.error("Error in scrapeJobDetails:", error.message);
    throw error;
  }
};

export const updateJobStatus = async (jobId, status) => {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      throw new Error("Failed to update job status");
    }
    return response.json();
  } catch (error) {
    console.error("Error in updateJobStatus:", error.message);
    throw error;
  }
};
