import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetails from "./pages/JobDetails";
import AddJobManual from "./pages/AddJobManual";
import JobLinkInput from "./pages/JobLinkInput";
import Login from "./pages/Login"; // Import the new Login page
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Sidebar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/add-job-link" element={<JobLinkInput />} />
          <Route path="/add-job" element={<AddJobManual />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
);
