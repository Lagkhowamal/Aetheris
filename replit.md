# Aetheris - AI-Powered Medical Intelligence Platform

## Overview

Aetheris is a full-stack medical charting and clinical AI assistant application. It allows healthcare providers to manage patients, create clinical encounter charts, get AI-powered analysis of patient symptoms, and consult with an AI chat assistant for diagnosis support. The application uses a React frontend with a Node.js/Express backend, PostgreSQL database, and OpenAI integration for AI features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; local React state for UI
- **UI Components**: Shadcn UI (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS custom properties for theming. The theme uses a calming medical aesthetic with a Teal/Slate color palette. Two display fonts: Inter (body) and Plus Jakarta Sans (headings)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages & Routes
- `/` — Dashboard with patient list and creation
- `/patients/:id` — Patient detail with charts
- `/charts/:id` — Individual chart/encounter detail with AI analysis
- `/chat` — AI conversation list
- `/chat/:id` — Individual AI chat with streaming responses

### Backend Architecture
- **Runtime**: Node.js with Express, using `tsx` for TypeScript execution
- **Entry Point**: `server/index.ts` creates an HTTP server, registers routes, and sets up Vite dev middleware or static serving
- **API Design**: RESTful JSON API under `/api/` prefix. Route definitions are shared between client and server via `shared/routes.ts`
- **Build**: Custom build script (`script/build.ts`) uses Vite for client and esbuild for server, outputting to `dist/`

### Replit Integrations (server/replit_integrations/)
These are modular integration packages:
- **auth/**: Replit OpenID Connect authentication with Passport.js, session management via `connect-pg-simple`. Currently authentication is commented out in routes but infrastructure exists.
- **chat/**: AI chat with OpenAI streaming (SSE). Manages conversations and messages in PostgreSQL. Uses OpenAI API via Replit's AI Integrations proxy.
- **image/**: Image generation using `gpt-image-1` model via OpenAI API
- **audio/**: Voice chat with speech-to-text and text-to-speech capabilities, includes client-side AudioWorklet for streaming playback
- **batch/**: Generic batch processing utility with rate limiting and retries for bulk AI operations

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: `server/db.ts` creates a connection pool using `DATABASE_URL` environment variable
- **Schema**: Defined in `shared/schema.ts` with re-exports from `shared/models/`
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)

### Database Schema
- **users** — Replit Auth user profiles (id, email, name, profile image)
- **sessions** — Express session storage for auth (required by Replit Auth)
- **patients** — Patient records linked to a provider user (demographics, medical history, medications, allergies)
- **charts** — Clinical encounter records linked to patients (chief complaint, symptoms, vitals as JSONB, AI analysis as JSONB, doctor notes, status)
- **conversations** — AI chat conversation threads
- **messages** — Individual messages within conversations (role: user/assistant, content)

### Key Design Decisions

1. **Shared schema and route definitions**: The `shared/` directory contains both database schema and API route contracts, ensuring type safety across the full stack. Zod schemas are derived from Drizzle tables via `drizzle-zod`.

2. **Default user ID**: Authentication is currently bypassed with a hardcoded `DEFAULT_USER_ID` in routes. The auth infrastructure exists and can be re-enabled.

3. **AI streaming via SSE**: Chat responses stream from OpenAI through the server to the client using Server-Sent Events, providing real-time token-by-token display.

4. **JSONB for flexible data**: Vitals and AI analysis are stored as JSONB columns, allowing flexible structured data without rigid column requirements.

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required, must be provisioned)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key via Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL via Replit AI Integrations proxy
- `SESSION_SECRET` — Secret for express-session (needed when auth is enabled)
- `ISSUER_URL` — OIDC issuer URL for Replit Auth (defaults to `https://replit.com/oidc`)
- `REPL_ID` — Replit environment identifier (set automatically)

### Third-Party Services
- **PostgreSQL**: Primary data store for all application data
- **OpenAI API** (via Replit AI Integrations): Powers AI chat, chart analysis, image generation, and voice features
- **Replit Auth (OIDC)**: User authentication via OpenID Connect (infrastructure present, currently disabled)

### Key npm Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` + `express-session` — HTTP server and session management
- `openai` — OpenAI API client
- `passport` + `openid-client` — Authentication
- `@tanstack/react-query` — Client-side data fetching and caching
- `wouter` — Client-side routing
- `zod` — Schema validation (shared between client and server)
- `react-hook-form` — Form state management
- Shadcn UI ecosystem (Radix UI, Tailwind CSS, class-variance-authority)