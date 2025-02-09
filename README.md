# HiredSoon: Job Tracking Application

HiredSoon is a full-stack web application designed to help job seekers manage and track their job applications. The project features both a robust backend API and a modern, responsive frontend. It supports local authentication (with JWT-based security) as well as social logins (Google—with a stub for Microsoft). Additionally, it leverages AI (via the OpenAI API) to scrape job postings and generate structured job details.

## Features

### User Authentication:
- Local registration and login with email and password.
- Social authentication via Google (Microsoft integration is stubbed for future implementation).
- Secure JWT-based authentication with industry-standard token expiration.

### Job Management:
- Scrape job postings using AI to extract detailed, structured information.
- Create, update, and delete job records.
- Update job status with automated follow-up scheduling.
- Add notes to each job for extra context and tracking.

### Dashboard & Metrics:
- Overview of key metrics (total jobs, applied jobs, interviews, job offers, follow-ups, and application streak).
- Visual presentation of job data with filtering, sorting, and search capabilities.

### User Experience Enhancements:
- Responsive design with dark mode support.
- Clean, modern UI built with React and Tailwind CSS.

## Tech Stack

### Backend:
- Node.js
- Express
- MongoDB (via Mongoose; compatible with CosmosDB)
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Axios and Cheerio for web scraping
- OpenAI API integration for AI-driven job detail extraction

### Frontend:
- React with React Router
- Tailwind CSS for styling
- Context API for authentication state management

## Project Structure

\`\`\`
project_root/
├── backend/
│   ├── models/
│   │   ├── Job.js
│   │   └── User.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── jobRoutes.js
│   │   └── authRoutes.js
│   ├── index.js
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   └── DarkModeToggle.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── JobDetails.jsx
│       │   ├── JobList.jsx
│       │   ├── AddJobManual.jsx
│       │   ├── JobLinkInput.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
├── .gitignore
├── README.md
└── LICENSE
\`\`\`

## Installation

### Backend Setup

Navigate to the backend directory:

\`\`\`bash
cd project_root/backend
\`\`\`

Install dependencies:

\`\`\`bash
npm install
\`\`\`

Configure Environment Variables:

Create a \`.env\` file in the backend directory with the following variables:

\`\`\`env
PORT=8080
MONGO_URI=your_cosmosdb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
\`\`\`

Start the Backend Server:

\`\`\`bash
npm start
\`\`\`

### Frontend Setup

Navigate to the frontend directory:

\`\`\`bash
cd project_root/frontend
\`\`\`

Install dependencies:

\`\`\`bash
npm install
\`\`\`

Start the Frontend Development Server:

\`\`\`bash
npm start
\`\`\`

The frontend should now be accessible (by default at [http://localhost:3000](http://localhost:3000)).

## Usage

### User Authentication:
- Register or log in to access job management features. Social login via Google is available.

### Job Management:
- After logging in, you can add a job by scraping a job posting URL or manually entering job details.
- Manage job statuses, add follow-up dates, and update notes.

### Dashboard:
- View an overview of your job applications, including metrics such as the number of jobs applied to, interview counts, and more.

### Dark Mode:
- Toggle between light and dark themes using the dark mode switch in the sidebar.

## API Endpoints

### Authentication
- **POST** `/api/auth/register` — Register a new user.
- **POST** `/api/auth/login` — Log in with email and password.
- **POST** `/api/auth/google` — Authenticate using a Google token.
- **POST** `/api/auth/microsoft` — (Stubbed for future implementation).

### Job Management
- **POST** `/api/jobs/scrape-job` — Scrape a job posting and create a job record.
- **GET** `/api/jobs/` — Retrieve jobs for the authenticated user.
- **GET** `/api/jobs/:id` — Get detailed information for a specific job.
- **PATCH** `/api/jobs/:id/status` — Update a job’s status and schedule follow-ups.
- **PATCH** `/api/jobs/:id/notes` — Update job notes.
- **DELETE** `/api/jobs/:id` — Delete a job.

## Deployment

For production deployments, consider the following:

### Backend:
- Use a process manager (e.g., PM2) to manage the Node.js server.
- Ensure environment variables are correctly set.
- Deploy the backend to a cloud provider (e.g., Azure, AWS, Heroku).

### Frontend:
- Build the React app for production using:

\`\`\`bash
npm run build
\`\`\`

- Host the static files on a CDN or a static site hosting service (e.g., Vercel, Netlify).

### CORS:
- Update the CORS configuration in the backend as necessary to allow requests from your production frontend domain.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure the code passes all tests.
4. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the **MIT License**. See the LICENSE file for details.

## Contact
For questions or support, please contact **[your email or contact information]**.
