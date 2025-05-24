# 🤖 AI Resume Analyzer (Task 2)

A modern full-stack web application that allows users to upload their resume (PDF/DOCX), optionally paste a job description, and receive instant AI-powered analysis. It provides insights into key skills, job fit, ATS score, formatting suggestions, and keyword alignment with job requirements.
Developed as part of the Altrosyn Internship day 2 task.

## 🚀 Features



- 📄 Upload resume (PDF or DOCX, max 10MB)
- 📝 Optional job description input
- ⚙️ AI-powered analysis using OpenRouter API
- 🧠 Extracts:
  - Key skills and qualifications
  - Best-fit job role
  - ATS score
  - Formatting & content suggestions
  - JD alignment insights (if job description is provided)
- 🌐 Full-stack app with Node.js, Express, Supabase, and modern frontend using Tailwind CSS/React/Next.js

---

## 🧩 How It Works

1. **Upload Your Resume**  
   Upload your resume in PDF or DOCX format (max size: 10MB).

2. **Add Job Description (Optional)**  
   Paste a job description to receive tailored feedback and match analysis.

3. **Get Instant Analysis**  
   Our AI engine processes your resume and provides:
   - ATS optimization suggestions  
   - Formatting and content improvement tips  
   - Skill and qualification extraction  
   - Role fit prediction  
   - JD-keyword alignment (if provided)

---

## 🧱 Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | HTML/CSS/JS, Tailwind/React/Next.js |
| Backend    | Node.js, Express.js         |
| Database   | Supabase (PostgreSQL)       |
| AI Engine  | OpenRouter API (free LLMs)  |
| File Upload| Multer                      |
| Hosting    | Vercel (Frontend), Render/Fly.io (Backend) |

---

## 🗂️ Project Structure

```
ai-resume-analyzer/
│
├── client/                    # Frontend (React/Next.js or plain HTML+Tailwind)
│   ├── public/
│   ├── src/
│   └── ...
│
├── server/                    # Backend (Node.js + Express)
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   ├── uploads/               # Temporary uploaded resumes
│   └── app.js
│
├── .env                       # Environment variables
├── README.md
└── package.json
```

---

## ⚙️ Environment Setup

### 1. Backend Setup

```bash
cd server
npm init -y
npm install express multer cors dotenv openai @supabase/supabase-js
```

Create a `.env` file:

```env
PORT=5000
OPENROUTER_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
```

### 2. Frontend Setup

#### React/Tailwind Option

```bash
npx create-react-app client
cd client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### OR HTML + Tailwind Option

Use plain HTML files with Tailwind CDN for fast prototyping.

---

## 🧠 AI Integration (Day 2)

- Parse PDF/DOCX using `pdf-parse` or `mammoth` (server-side)
- Send extracted text + job description (optional) to OpenRouter API
- Format LLM output and send JSON response to frontend

---

## 🛠 Deployment

- **Frontend:** Deploy to [Vercel](https://vercel.com/)
- **Backend:** Deploy to [Render](https://render.com/) or [Fly.io](https://fly.io/)
- **Supabase:** Automatically hosted PostgreSQL backend

---

## 📜 Dev Log & Tasks

### ✅ Day 1 – Setup + Upload Feature

- [x] Set up project structure (frontend + backend)
- [x] Configure Multer for file upload (PDF/DOCX)
- [x] Create upload form (with optional JD input)
- [x] Connect Supabase and log file uploads

### ⏳ Day 2 – AI Agent + Analysis

- [ ] Parse resume text (PDF/DOCX)
- [ ] Send resume + JD to OpenRouter API
- [ ] Format AI response (skills, job role, ATS score)
- [ ] Display result on frontend

### ⏳ Day 3 – Styling + Deployment

- [ ] Style frontend with Tailwind
- [ ] Add loader and error handling
- [ ] Deploy backend and frontend
- [ ] Final testing & polish

---
## 👤 Author
**Priyanka A**

GitHub: @PriyankaAnantha
LinkedIn: Priyanka Anantha (linkedin.com/in/priyanka-anantha/)

---

## 📎 License

This project is licensed under the MIT License.

---
