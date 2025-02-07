import { useEffect, useState } from "react";
import { fetchJobs, addJob } from "./services/api";

function App() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ company: "", role: "", status: "Applied" });

  useEffect(() => {
    fetchJobs().then(setJobs);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addedJob = await addJob(newJob);
    setJobs([...jobs, addedJob]);
    setNewJob({ company: "", role: "", status: "Applied" });
  };

  return (
    <div>
      <h1>Job Tracking App</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Company Name" 
          value={newJob.company} 
          onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} 
        />
        <input 
          type="text" 
          placeholder="Job Role" 
          value={newJob.role} 
          onChange={(e) => setNewJob({ ...newJob, role: e.target.value })} 
        />
        <button type="submit">Add Job</button>
      </form>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            {job.company} - {job.role} ({job.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
