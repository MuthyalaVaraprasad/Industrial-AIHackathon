# INDUSTRIA AI — Unified Asset & Operations Brain

AI-powered Industrial Knowledge Intelligence Platform for ET AI Hackathon (Problem Statement 8).

## Phase 1

- Landing page with 3D brain animation
- Firebase authentication (demo mode included)
- Operations dashboard with live charts
- Document Intelligence Center with drag-and-drop upload
- OCR & document processing pipeline view

## Phase 2 (Current)

All 19 application modules are live:

| Module | Route |
|--------|-------|
| Knowledge Graph Explorer | `/app/knowledge-graph` |
| AI Copilot | `/app/copilot` |
| P&ID Intelligence | `/app/pid` |
| Predictive Maintenance | `/app/maintenance` |
| Compliance Dashboard | `/app/compliance` |
| Lessons Learned Engine | `/app/lessons` |
| Root Cause Analysis | `/app/rca` |
| Digital Twin | `/app/digital-twin` |
| Executive Decision Center | `/app/executive` |
| QR Asset Scanner | `/app/qr-scanner` |
| AI Impact Simulator | `/app/simulator` |
| Team Collaboration Notes | `/app/collaboration` |
| Voice Assistant | `/app/voice` |
| Report Generator | `/app/reports` |
| Alerts & Notifications | `/app/alerts` |
| Admin Panel | `/app/admin` |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion, React Query, Recharts, Three.js |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (ready), in-memory store for demo |
| AI | Gemini API, LangChain (integration ready) |
| Auth | Firebase Authentication |

## Quick Start

```bash
# Install dependencies
npm run install:all
npm install

# Start both frontend and backend
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Mode

Demo mode is enabled by default (`VITE_DEMO_MODE=true`). Sign in with any email/password — no Firebase setup required.

## Environment Variables

Copy `.env.example` files in `client/` and `server/` and configure:

- **client/.env** — Firebase keys, API URL
- **server/.env** — MongoDB URI, Gemini API key, port

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI & shared components
│       ├── features/       # Feature modules (Phase 2+)
│       ├── pages/          # Route pages
│       ├── hooks/          # Custom hooks
│       ├── services/       # API & Firebase
│       ├── store/          # Auth context
│       ├── layouts/        # App & auth layouts
│       ├── types/          # TypeScript types
│       └── utils/          # Helpers
├── server/                 # Express backend
│   └── src/
│       ├── routes/         # API routes
│       └── services/       # Business logic
└── package.json            # Root scripts
```

## Phase 3 (Current)

Live service integration layer with automatic fallbacks:

| Service | Purpose | Fallback |
|---------|---------|----------|
| **MongoDB Atlas** | Persist notes, alerts, settings, knowledge chunks | In-memory store |
| **Gemini API** | Copilot RAG answers, document entity extraction | Mock AI responses |
| **Neo4j** | Live knowledge graph queries | Mock graph data |
| **Pinecone** | Vector similarity search for RAG | MongoDB/text search |
| **Firebase Admin** | Production JWT verification | Client demo mode |

Configure credentials in `server/.env` — the platform runs fully in demo mode without them.

**Admin Panel → System Integrations** shows live connection status for all services.
