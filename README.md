# NERI (நெறி)

NERI is a full-stack AI-powered learning and exam preparation platform. "NERI" translates to Path, Guidance, or Direction.
The platform allows users to take dynamically generated tests, chat with an AI for doubt clearance, and track their analytics.

## Tech Stack
* **Frontend:** React + TypeScript, Vite, Tailwind CSS
* **Backend:** Golang (Fiber framework)
* **Database:** PostgreSQL with GORM
* **Authentication:** JWT & bcrypt
* **AI Provider:** Google Gemini API
* **Deployment:** Docker & Docker Compose

## Features Implemented So Far
- **Project Scaffold:** Complete setup of the `frontend/` (React+Vite) and `backend/` (Golang Fiber) directories.
- **Dockerization:** Configured `docker-compose.yml` to run PostgreSQL, the Go backend, and the React frontend. Created multi-stage Dockerfiles.
- **Database Architecture:** Created GORM models for users, tests, questions, test attempts, scheduled tests, user answers, and chat history.
- **Authentication:** Built register, login, logout, and forgot-password API endpoints with secure JWT cookie handling and password hashing.
- **Security & Best Practices:** Configured CORS, structured the code with a clean separation of concerns (controllers, models, routes, database).

## Running the Application Locally
Make sure you have Docker installed on your machine.
1. Create a `.env` file in the root directory (or use your system environment variables) and configure your `GEMINI_API_KEY`.
2. Run the application:
   ```bash
   docker-compose up --build
   ```
3. The frontend will be available on `http://localhost:3000` and the backend on `http://localhost:8080`.
