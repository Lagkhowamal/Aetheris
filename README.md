# Medi-Chart-AI – AI-Powered Medical Charting System

A full-stack healthcare application with AI-driven diagnosis support using Google Gemini API, PostgreSQL, and React.

## 🎯 Overview

**Medi-Chart-AI** is a medical charting platform that enables doctors to:
- Register and manage patient profiles
- Create detailed encounter charts with symptoms, vitals, and medical history
- Receive AI-powered diagnostic suggestions via Google Gemini
- Access real-time clinical insights including red flags and recommended tests
- Engage in clinical chat with an AI assistant for decision support
- Approve patient diagnoses for medical records

The system prioritizes **security** and **privacy**—all sensitive configuration (API keys, database credentials) is kept local and never committed to the repository.

## 🏗 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js, Express.js, TypeScript |
| **Frontend** | React 18, Wouter routing, TailwindCSS |
| **Database** | PostgreSQL 18, Drizzle ORM |
| **AI** | Google Gemini API (gemini-2.5-flash) |
| **Build** | Vite (client), esbuild (server) |
| **Package Manager** | npm |

## 📋 Prerequisites

- **Node.js** v18+ with npm
- **PostgreSQL** 13+ (local or remote)
- **Google Gemini API Key** (free tier available at [ai.google.dev](https://ai.google.dev))
- **Git** v2.0+

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone git@github.com:Lagkhowamal/Aetheris.git
cd Aetheris
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/medi_chart_ai

# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Optional
NODE_ENV=development
```

**⚠️ NEVER commit `.env` to Git.** It's in `.gitignore` by default.

### 4. Initialize Database
```bash
npm run db:push
```

This runs Drizzle migrations and creates the schema (patients, charts, users, sessions).

### 5. Seed Test Data (Optional)
```bash
npx tsx seed-test-patient.ts
```

This creates a test patient (John Doe) and default provider user for development.

### 6. Start Development Server
```bash
npm run dev
```

Open http://localhost:5000 in your browser.

## 📚 Project Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (tsx + Vite hot reload) |
| `npm run build` | Build for production (client + server bundle) |
| `npm start` | Run compiled production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Apply Drizzle schema migrations |

## 🔐 Security & Privacy

### Environment Variables
All sensitive configuration **must** be in `.env`:
- Database credentials
- API keys (Gemini, OpenAI, etc.)
- JWTs or secrets

### .gitignore Configuration
The `.gitignore` file excludes:
```
.env           # Never commit secrets
*.local        # Local environment overrides
node_modules/  # Dependencies
dist/          # Build output
.env.production.local
.DS_Store      # macOS files
```

### Best Practices
✅ **DO:**
- Create `.env.example` with placeholder values for collaborators
- Rotate API keys if accidentally committed
- Use strong database passwords
- Keep `.env` files local only

❌ **DON'T:**
- Commit `.env` files
- Share API keys in messages or PRs
- Use test credentials in production
- Log sensitive values

## 📂 Project Structure

```
medi-chart-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (doctor, patient, diagnostics)
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # React hooks (queries, mutations)
│   │   └── lib/           # Utilities
│   ├── index.html         # Entry point
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── db.ts              # Drizzle connection
│   └── index.ts           # Server entry
├── shared/                 # Shared types & schemas
│   ├── schema.ts          # Drizzle ORM schema
│   └── routes.ts          # API route definitions
├── .env                    # ⚠️ NOT committed
├── .gitignore             # Excludes secrets & build files
└── package.json           # Dependencies & scripts
```

## 🤖 AI Features

### Chart Analysis (Real-time Diagnosis)
- Analyzes patient vitals, symptoms, and history
- Generates differential diagnoses
- Recommends diagnostic tests
- Flags critical red flags
- Uses Gemini 2.5-flash model

**Endpoint:** `POST /api/charts/:id/analyze`

### Clinical Chat
- Real-time streaming responses
- Maintains conversation history
- Provides clinical decision support
- Medical-focused system prompts

**Endpoint:** `POST /api/conversations/:id/messages`

See [GEMINI_AI_GUIDE.md](GEMINI_AI_GUIDE.md) for detailed AI usage.

## 📊 Database Schema

### Users Table
```sql
- id (UUID)
- email
- firstName, lastName
- profileImageUrl
- createdAt, updatedAt
```

### Patients Table
```sql
- id (serial)
- userId (FK → users)
- firstName, lastName, dateOfBirth, gender
- medicalHistory, currentMedications, allergies
- isApprovedByDoctor (boolean)
- createdAt
```

### Charts Table (Encounters)
```sql
- id (serial)
- patientId (FK → patients)
- userId (FK → users)
- date, chiefComplaint, symptoms
- vitals (JSON)
- aiAnalysis (JSON)
- doctorNotes, status ('draft' | 'completed')
- createdAt
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure password is correct
- Confirm database `medi_chart_ai` exists

### TypeScript Errors
```bash
npm run check
```
Fixes most issues; ensure all file imports are correct.

### Gemini API Errors
- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key has active quota
- Use supported model: `gemini-2.5-flash`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment for Production
Create `.env.production`:
```env
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/medi_chart_ai
GEMINI_API_KEY=sk-...your-key...
NODE_ENV=production
```

### Hosting Recommendations
- **Backend:** Render, Heroku, Railway, AWS EC2
- **Database:** AWS RDS, Supabase, Railway
- **Frontend:** Vercel, Netlify (if decoupled)

## 📝 Contributing

1. Pull latest changes: `git pull origin main`
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -am "Add feature"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Open Pull Request on GitHub

**Remember:** Don't commit `.env` or other secrets!

## 📄 License

MIT License – see LICENSE file for details.

## 👨‍⚕️ Use Cases

- **Solo Practitioners:** Manage patient records with AI-assisted diagnosis
- **Clinics:** Multiple doctors, shared database, audit trails
- **Research:** Collect anonymized diagnostic data with AI insights
- **Education:** Learn medical decision-making with AI support

## 🤝 Support

For issues, questions, or feature requests, open an issue on GitHub or contact the maintainer.

---

**Last Updated:** February 26, 2026  
**Status:** Active Development
