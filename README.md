# NERI (நெறி) - AI-Powered Learning Platform

NERI is a premium, full-stack learning and exam preparation platform. It allows users to upload previous year question papers, generates interactive mock tests using Gemini AI, and provides detailed analytics on their performance.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Golang (Fiber), GORM
- **Database**: PostgreSQL
- **AI**: Google Gemini API
- **Infrastructure**: Docker, Docker Compose

## 🚀 Quick Start (One-Command Setup)

The entire platform is fully Dockerized for a seamless developer experience.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- A Gemini API Key from Google AI Studio.

### 1. Configure Environment
A `.env` file is required in the root directory. If you haven't already, create one and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start the Platform
Run the following command in the root directory:
```bash
docker compose up --build
```
*This single command will:*
- Build the multi-stage Go Backend.
- Build the multi-stage React Frontend.
- Boot up PostgreSQL, run health checks, and automatically run database migrations on startup.
- Boot up pgAdmin.

### 3. Access the Services
Once the terminal logs show that all containers are healthy, you can immediately access the platform:

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **pgAdmin (Database GUI)**: [http://localhost:5050](http://localhost:5050)
  - *Email*: `admin@neri.local`
  - *Password*: `admin`

## Development Notes
- **Auto-migrations**: The Go backend uses GORM's `AutoMigrate` function. Any changes to the `models/` directory will automatically map to the PostgreSQL tables on startup.
- **Frontend Routing**: The frontend is served via an NGINX container configured to fallback to `index.html` for React Router.
- **Data Persistence**: The PostgreSQL database uses a Docker volume (`pgdata`), ensuring your user accounts and tests persist across container restarts.
