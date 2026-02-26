# Medi-Chart-AI

AI-powered medical charting and diagnostics using Google Gemini API.

## Setup

1. Clone repository (private) and `cd` into project:
   ```bash
   git clone git@github.com:<your-username>/medi-chart-ai.git
   cd medi-chart-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your secrets (not committed):
   ```env
   DATABASE_URL=postgresql://postgres:<password>@localhost:5432/medi_chart_ai
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5000 in browser.

## Commands

| Script      | Description |
|-------------|-------------|
| `npm run dev` | Run server in development mode (tsx) |
| `npm run build` | Bundle server + client for production |
| `npm start` | Run compiled production build |
| `npm run db:push` | Apply Drizzle schema to database |

## Notes

- **Do not commit `.env`** or any API keys. They are excluded by `.gitignore`.
- Keep repository **private** on GitHub to protect sensitive information.
- To share with collaborators, give them access and have them create their own `.env`.

Additional documentation is available in `GEMINI_AI_GUIDE.md` for AI-specific guidance.
