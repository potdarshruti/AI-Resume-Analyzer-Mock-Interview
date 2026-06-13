# AI Resume Analyzer & Mock Interview

A full-stack web application that uses AI to analyze resumes and conduct personalized mock interviews based on the candidate's profile and target role.

---

## Features

- **Resume Upload and Parsing** - Accepts PDF and DOCX formats, extracts structured candidate data
- **AI-Powered Resume Analysis** - Provides detailed feedback on content, structure, and impact
- **ATS Compatibility Score** - Evaluates how well the resume performs against Applicant Tracking Systems
- **Mock Interview Engine** - Generates role-specific interview questions derived from the uploaded resume
- **Answer Evaluation** - Scores and critiques interview responses in real time
- **Performance Dashboard** - Tracks resume scores and interview history across sessions

---

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### AI / Integrations
![GROQAI](https://img.shields.io/badge/groqai-412991?style=for-the-badge&logo=openai&logoColor=white)

---

## Project Structure

```
ai-resume-analyzer/
|-- .gitignore
|-- README.md
|-- package.json
|
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |   +-- env.js
|   |-- controllers/
|   |   +-- resumeController.js
|   |-- middleware/
|   |   |-- auth.js
|   |   +-- errorHandler.js
|   |-- models/
|   |   |-- User.js
|   |   +-- Resume.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   +-- resumeRoutes.js
|   |-- services/
|   |   |-- aiService.js
|   |   +-- parseService.js
|   |-- uploads/           
|   |-- .env
|   |-- package.json
|   +-- server.js
|
+-- frontend/
    |-- public/
    |-- src/
    |   |-- assets/
    |   |-- components/
    |   |-- hooks/
    |   |-- pages/
    |   |-- services/
    |   |-- store/
    |   |-- styles/
    |   |-- utils/
    |   |-- App.jsx
    |   +-- main.jsx
    |-- package.json
    +-- vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js `v18` or higher
- npm or yarn
- GROQ API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and fill in your credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groqai_api_key
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the App

Navigate to `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `GROQ_API_KEY` | GROQ API key for AI features |
| `JWT_SECRET` | Secret key used for signing JWT tokens |

---

## Screenshots

| Resume Analysis | Mock Interview |
|---|---|
| ![Resume Analysis](https://via.placeholder.com/400x250?text=Resume+Analysis) | ![Mock Interview](https://via.placeholder.com/400x250?text=Mock+Interview) |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive a JWT token |

### Resume

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload and analyze a resume |
| GET | `/api/resume/:id` | Retrieve analysis by resume ID |
| GET | `/api/resume/history` | Retrieve the current user's resume history |

### Interview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/start` | Start a new mock interview session |
| POST | `/api/interview/answer` | Submit an answer and receive feedback |
| GET | `/api/interview/:id` | Retrieve a specific interview session |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## Author

**Shruti Potdar**

- GitHub: [@potdarshruti](https://github.com/potdarshruti)
- LinkedIn: [Shruti Potdar](https://linkedin.com/in/potdarshruti)

---

> If you found this project helpful, please give it a star on GitHub! 
