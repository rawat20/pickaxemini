# Pickaxe Mini — AI Agent Builder

A full-stack platform to create, configure, and chat with custom AI agents powered by Google Gemini. Users define an agent's name and purpose; the system generates a tailored system prompt and deploys a persistent chat interface.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Key Design Decisions](#key-design-decisions)
- [Known Limitations](#known-limitations)

---

## Architecture

```
Browser
  │
  ├─ tRPC calls ──────────► Next.js API Route (/api/trpc)
  │                              │
  │                              ├─ agents.create ──► POST /api/v1/agents/generate-prompt
  │                              ├─ agents.list/get      (FastAPI + Gemini)
  │                              └─ conversations.*
  │
  └─ SSE stream ──────────► Next.js Route (/api/chat/stream)
                                 │
                                 └─ pipes ──────────► POST /api/v1/chat/stream
                                                       (FastAPI + Gemini streaming)
```

**Two-service design:**
- **Next.js** handles the frontend, tRPC RPC layer, and acts as a proxy for streaming.
- **FastAPI** owns all Gemini interactions — prompt generation and streaming chat.
- **LowDB** persists agents and conversations as a flat JSON file (`db.json`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 + React 19 |
| Language | TypeScript 5 |
| RPC | tRPC 11 |
| Server State | TanStack React Query 5 |
| UI | Shadcn/UI + Radix UI + Tailwind CSS 4 |
| Validation | Zod |
| Database | LowDB 7 (JSON file) |
| Backend Framework | FastAPI 0.115 |
| Backend Runtime | Python 3.11+, Uvicorn |
| AI Provider | Google Gemini (`gemini-2.5-flash`) |
| Streaming | Server-Sent Events (SSE) |

---

## Project Structure

```
pickaxe-mini/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Dashboard — agent grid
│   │   ├── layout.tsx                  # Root layout with sidebar
│   │   ├── providers.tsx               # tRPC + React Query providers
│   │   ├── create/page.tsx             # Standalone agent creation page
│   │   ├── agent/[id]/page.tsx         # Chat interface + agent details
│   │   └── api/
│   │       ├── trpc/[trpc]/route.ts    # tRPC fetch adapter
│   │       └── chat/stream/route.ts    # SSE proxy to FastAPI
│   ├── components/
│   │   ├── layout/                     # Sidebar, CreateAgentDrawer
│   │   ├── dashboard/                  # AgentsGrid, AgentCard
│   │   ├── agent/                      # ChatPanel, AgentDetailsPanel
│   │   └── ui/                         # Shadcn primitives
│   ├── server/
│   │   ├── trpc.ts                     # tRPC initializer
│   │   └── routers/
│   │       ├── agent.ts                # CRUD for agents
│   │       └── conversation.ts         # Message history management
│   ├── schemas/
│   │   ├── agent.ts                    # Agent type + Zod schema
│   │   └── conversation.ts             # Message + Conversation types
│   └── services/
│       └── db.ts                       # LowDB wrapper (read/write helpers)
│
├── backend/
│   └── app/
│       ├── main.py                     # FastAPI app factory + CORS
│       ├── core/
│       │   ├── config.py               # Pydantic Settings (env vars)
│       │   └── exceptions.py           # LLMException + handlers
│       ├── api/v1/routes/
│       │   ├── agents.py               # POST /agents/generate-prompt
│       │   └── chat.py                 # POST /chat/stream (SSE)
│       ├── services/
│       │   ├── llm.py                  # Gemini generate_text + stream_chat
│       │   └── prompt.py               # Meta-prompt for system prompt generation
│       └── schemas/
│           ├── agent.py                # GeneratePromptRequest/Response
│           └── chat.py                 # ChatMessage, ChatRequest
│
├── db.json                             # Runtime database (gitignored in prod)
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **Google Gemini API key** — [get one here](https://aistudio.google.com/app/apikey)

---

## Local Development

### 1. Clone and install frontend dependencies

```bash
git clone <repo-url>
cd pickaxe-mini
npm install
```

### 2. Set up frontend environment

```bash
cp .env.local.example .env.local
# Fill in FASTAPI_URL (see Environment Variables section)
```

### 3. Set up the Python backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in GEMINI_API_KEY
```

### 4. Run both services

**Terminal 1 — FastAPI backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Next.js frontend:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Frontend (`/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `FASTAPI_URL` | Yes | `http://localhost:8000` | Base URL of the FastAPI backend |

### Backend (`/backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model to use |

---

## API Reference

### FastAPI Backend (`http://localhost:8000`)

#### `GET /health`
Returns `{ "status": "ok" }`. Use for readiness checks.

---

#### `POST /api/v1/agents/generate-prompt`
Generates a system prompt and greeting for a new agent.

**Request:**
```json
{
  "name": "Tennis Coach",
  "description": "Helps intermediate players improve their serve technique"
}
```

**Response:**
```json
{
  "system_prompt": "You are an expert tennis coach specializing in...",
  "suggested_greeting": "Ready to work on your serve? Let's start with your toss."
}
```

---

#### `POST /api/v1/chat/stream`
Streams a Gemini chat response as Server-Sent Events.

**Request:**
```json
{
  "system_prompt": "You are an expert tennis coach...",
  "agent_name": "Tennis Coach",
  "messages": [
    { "role": "user", "content": "My serve keeps going into the net." }
  ]
}
```

**Response:** `text/event-stream`
```
data: {"text": "That"}
data: {"text": "'s a common issue — "}
data: {"text": "usually caused by..."}
data: {"done": true}
```

---

### tRPC Endpoints (`/api/trpc`)

All called via the tRPC client; types are inferred end-to-end.

| Procedure | Type | Description |
|---|---|---|
| `agents.list` | query | All agents with message counts |
| `agents.get` | query | Single agent by ID |
| `agents.create` | mutation | Create agent (calls FastAPI internally) |
| `agents.delete` | mutation | Delete agent and its conversation |
| `conversations.getByAgent` | query | Full conversation for an agent |
| `conversations.addMessage` | mutation | Append a message |
| `conversations.clear` | mutation | Clear message history |

---

## Data Models

```typescript
type Agent = {
  id: string           // UUID v4
  name: string
  description: string
  systemPrompt: string
  greeting: string
  createdAt: string    // ISO 8601
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

type Conversation = {
  id: string
  agentId: string      // FK → Agent.id
  messages: Message[]
  createdAt: string
  updatedAt: string
}
```

**Storage:** Both arrays live in `/db.json` as a single JSON file managed by LowDB.

---

## Key Design Decisions

**tRPC for CRUD, direct SSE for streaming**
tRPC does not support server-sent event responses, so the chat stream is a plain `fetch` call to `/api/chat/stream`, which proxies the FastAPI SSE stream. All other operations go through tRPC for full type safety.

**Next.js as SSE proxy**
The frontend never calls FastAPI directly. Next.js API routes act as the single origin, avoiding CORS issues in the browser and centralizing any future auth middleware.

**Gemini prompt generation at creation time**
System prompts are generated once when an agent is created, not on every request. This keeps chat latency low and makes the prompt editable in future iterations.

**One conversation per agent**
Each agent has a single persistent thread. The data model supports extension to multiple threads per agent (`agentId` FK is already on `Conversation`).

**LowDB for persistence**
Chosen for zero-config local development. The `db.ts` service abstracts reads/writes so swapping to a real database (Postgres, SQLite) only requires changing that file.

---

## Known Limitations

| Limitation | Impact | Path to fix |
|---|---|---|
| LowDB JSON file | No concurrent writes; data loss on crash | Replace `db.ts` with Prisma + SQLite/Postgres |
| No authentication | All agents visible to everyone | Add NextAuth or Clerk |
| Gemini free tier (20 req/day) | Rate limit errors under heavy use | Add API key rotation or paid tier |
| Single conversation per agent | No chat history isolation | Add conversation list UI + multiple threads |
| No message persistence during stream | Crash mid-stream loses assistant reply | Write partial responses to DB on chunk |
| No horizontal scaling | Single-process LowDB | Replace file DB, add Redis for sessions |
