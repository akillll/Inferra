# Inferra

LLM inference logging and observability platform built with React, FastAPI, PostgreSQL, Redis, OpenAI, and SSE streaming.

Inferra provides a small full-stack system for sending chat prompts, streaming model responses, logging inference metadata asynchronously, and visualizing runtime metrics in a dashboard.

## Project Overview

Inferra is designed as a take-home style production prototype for LLM inference observability. The application separates user-facing streaming chat from background log ingestion so response latency is not tightly coupled to metrics persistence.

The system focuses on:

- Real-time token streaming over Server-Sent Events
- Conversation and message persistence in PostgreSQL
- Redis-backed queueing for inference logs
- Background worker ingestion into structured database tables
- A React dashboard for latency, request, token, provider, and error metrics

## Features

- Chat UI with streamed assistant responses
- Conversation history sidebar
- SSE-based token delivery from FastAPI to React
- OpenAI provider abstraction
- PostgreSQL persistence for conversations, messages, and inference logs
- Redis queue for asynchronous log ingestion
- Background worker process
- Metrics dashboard with request volume, latency, token totals, errors, and provider usage
- Docker Compose setup for frontend, backend, worker, Postgres, and Redis
- Health checks and startup dependency handling

## Architecture

```text
┌────────────────────┐
│ React + Vite UI    │
│ Chat + Dashboard   │
└─────────┬──────────┘
          │ HTTP + SSE
          ▼
┌────────────────────┐
│ FastAPI Backend    │
│ Routes + Services  │
└──────┬───────┬─────┘
       │       │
       │       │ enqueue inference log
       │       ▼
       │   ┌──────────────┐
       │   │ Redis Queue  │
       │   └──────┬───────┘
       │          │ consume
       ▼          ▼
┌──────────────┐ ┌──────────────────┐
│ PostgreSQL   │ │ Background Worker │
│ App + Logs   │ └────────┬─────────┘
└──────────────┘          │
                          ▼
                    ┌──────────────┐
                    │ PostgreSQL   │
                    │ Log Records  │
                    └──────────────┘

External:
┌──────────────┐
│ OpenAI API   │
└──────────────┘
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Zustand, Recharts |
| Backend | FastAPI, Uvicorn, SQLAlchemy |
| Database | PostgreSQL |
| Queue/cache | Redis |
| LLM provider | OpenAI |
| Streaming | Server-Sent Events |
| Migrations | Alembic |
| Containers | Docker, Docker Compose |

## System Design Decisions

- **SSE over WebSockets:** SSE fits one-way token streaming from server to browser with simpler browser APIs and fewer moving parts.
- **Background log ingestion:** Inference logging is queued through Redis so chat streaming is not blocked by dashboard persistence.
- **PostgreSQL as source of truth:** Conversations, messages, and structured inference logs are persisted relationally for simple querying and metrics aggregation.
- **Redis for queueing and cache primitives:** Redis keeps the prototype lightweight while still allowing asynchronous ingestion and request-level infrastructure utilities.
- **Provider abstraction:** OpenAI calls are isolated under `llm_sdk/` so additional providers can be added without changing route code.
- **Simple process model:** API and worker run as separate containers but share backend code and configuration.

## Folder Structure

```text
inferra/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── core/                 # FastAPI app and settings
│   ├── db/                   # SQLAlchemy and Redis clients
│   ├── ingestion/            # Background worker logic
│   ├── llm_sdk/              # LLM provider abstraction and logging
│   ├── models/               # SQLAlchemy models
│   ├── routes/               # FastAPI routes
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Application services
│   ├── utils/                # Cache, retry, rate limit, redaction helpers
│   ├── scripts/              # Container startup helpers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # HTTP and SSE clients
│   │   ├── components/       # Chat, sidebar, dashboard
│   │   ├── layouts/          # App shell
│   │   ├── pages/            # Page-level views
│   │   └── store/            # Zustand state
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Docker Setup

One-command startup:

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The Docker setup includes:

- Frontend hot reload through Vite
- Backend hot reload through Uvicorn
- Persistent PostgreSQL volume
- Persistent Redis data volume
- Dedicated worker container
- Service health checks
- Startup wait script for Postgres and Redis
- Automatic Alembic migration on backend startup

## Environment Variables

Copy `.env.example` to `.env`.

Important:

- Inside Docker, backend services use `postgres` and `redis` hostnames.
- In the browser, `VITE_API_BASE_URL` should usually be `http://localhost:8000`.


## Local Setup

Prerequisites:

- Node.js 20+
- Python 3.12+
- PostgreSQL
- Redis

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Worker:

```bash
cd backend
source venv/bin/activate
python run_worker.py
```

## Database Schema

Core tables:

### `conversations`

- `id`
- `title`
- `created_at`
- `updated_at`

### `messages`

- `id`
- `conversation_id`
- `role`
- `content`
- `created_at`

### `inference_logs`

- `id`
- `request_id`
- `conversation_id`
- `provider`
- `model`
- `latency_ms`
- `prompt_tokens`
- `completion_tokens`
- `total_tokens`
- `status`
- `error_message`
- `request_preview`
- `response_preview`
- `created_at`

## Streaming Architecture

Chat streaming uses Server-Sent Events.

Flow:

1. React opens an `EventSource` to `/chat-stream`.
2. FastAPI creates or resolves the conversation.
3. The user message is persisted.
4. Backend calls the OpenAI streaming API.
5. Tokens are emitted as typed JSON SSE events.
6. React appends tokens to the active assistant message.
7. The final assistant response is persisted if non-empty.

SSE event types:

- `stream`: returns the unique stream id
- `conversation`: returns the conversation id
- `token`: sends a response token/chunk
- `done`: marks stream completion
- `stream-error`: reports stream failure

Cancellation uses `stream_id`, not `conversation_id`, to avoid collisions when multiple streams exist for the same conversation.

## Ingestion Pipeline

Inference metadata is not written directly from the chat request path. Instead:

1. LLM SDK builds a log payload after success or failure.
2. Payload is redacted for basic PII patterns.
3. Payload is pushed to Redis.
4. Worker consumes the Redis queue.
5. Worker writes `InferenceLog` rows to PostgreSQL.

This keeps chat streaming responsive while still supporting observability metrics.

## Observability Dashboard

The dashboard reads from `/metrics` and displays:

- Total requests
- Average latency
- Total errors
- Total tokens
- Requests per minute
- Provider usage

Metrics are currently computed from PostgreSQL using direct aggregate queries. This is intentionally simple for the take-home scope.

## API Flow Explanation

```text
User sends prompt
  ↓
Frontend opens EventSource
  ↓
FastAPI persists user message
  ↓
FastAPI streams OpenAI chunks
  ↓
Frontend renders assistant tokens incrementally
  ↓
Backend queues inference log in Redis
  ↓
Worker persists log to PostgreSQL
  ↓
Dashboard polls metrics endpoint
```

Primary endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/chat-stream` | SSE chat streaming |
| `POST` | `/cancel/{stream_id}` | Cancel active stream |
| `GET` | `/conversations` | List conversations |
| `GET` | `/conversation/{conversation_id}` | Load conversation messages |
| `GET` | `/metrics` | Dashboard metrics |

## Reliability Features

- Postgres and Redis health checks in Docker Compose
- Backend startup waits for dependencies before serving
- Worker waits for dependencies before consuming queue messages
- Backend migrations run automatically in Docker startup
- Redis queue decouples inference logging from the streaming response path
- Worker rolls back and closes DB sessions on failure
- Failed worker inserts are requeued
- SSE events are JSON encoded to avoid token formatting corruption
- Streams use unique stream ids for safer cancellation
- Empty assistant messages are not persisted
- Frontend closes `EventSource` on completion, cancellation, and unmount

## Failure Handling Assumptions

- If OpenAI fails, the stream emits `stream-error` and the log path records an error payload when possible.
- If Redis is temporarily unavailable, logging may fail for that request. The application prioritizes chat response availability.
- If the worker fails after reading a queue item but before committing to PostgreSQL, it requeues the item.
- If PostgreSQL is unavailable at startup, backend and worker wait until the configured retry limit is reached.
- Dashboard metrics are eventually consistent because logs are ingested asynchronously.

## Tradeoffs

- Redis list queue is simple and sufficient for this scope, but it is not a full durable job system.
- Metrics are queried directly from PostgreSQL. This is simple but may need rollups for high-volume traffic.
- SSE is ideal for one-way streaming but not bidirectional collaboration.
- The OpenAI provider is the only implemented provider, though the code is structured to allow more.
- Basic PII redaction is regex-based and intentionally limited.
- Docker Compose is optimized for local development, not multi-host deployment.

## Scaling Considerations

Practical next steps before higher traffic:

- Add indexes on `messages.conversation_id`, `messages.created_at`, and `inference_logs.created_at`.
- Add request pagination for conversation history.
- Add metrics time windows instead of querying all historical logs.
- Move queue handling to a stronger job primitive if strict delivery guarantees are required.
- Add per-user or per-api-key scoping before multi-tenant use.
- Add structured application logging and request ids across API, SDK, and worker.


## Future Improvements

- Authentication and workspace scoping
- Model/provider selection in the UI
- Prompt and response search
- Cost estimation per inference
- Exportable logs
- Better token usage visualization
- Integration tests for SSE streaming and worker ingestion
- Dead-letter queue for repeatedly failing log payloads
- Dashboard date-range filters

## Demo Instructions

1. Start the stack:

   ```bash
   cp .env.example .env
   docker compose up --build
   ```

2. Open the frontend:

   ```text
   http://localhost:5173
   ```

3. Verify backend health:

   ```text
   http://localhost:8000/health
   ```

4. Send a prompt in the chat UI.

5. Watch the response stream into the assistant message.

6. Confirm logs are ingested by checking the dashboard after the worker processes the Redis queue.

## Development Approach

The project was built iteratively in phases rather than attempting a fully designed system upfront.

Development process:
1. Defined architecture and system boundaries first
2. Implemented core chat + streaming flow
3. Added inference logging and ingestion
4. Added observability and reliability features
5. Performed architecture and code review passes
6. Hardened streaming, queue handling, and frontend state management

AI-assisted tooling (Codex/LLM tools) was used for:
- project scaffolding
- repetitive boilerplate generation
- implementation acceleration
- code review assistance
- docker compose setup
- README drafting

All architectural decisions, debugging, integration, system design, and final implementation validation were handled manually.

The focus was on building a practical, production-oriented MVP while keeping the system intentionally lightweight and easy to reason about.

## Common Troubleshooting

### Frontend cannot reach backend

Check:

- `VITE_API_BASE_URL=http://localhost:8000`
- Backend container is healthy
- Browser can open `http://localhost:8000/health`

### Backend cannot connect to Postgres

Check:

- `DATABASE_URL=postgresql+psycopg://inferra:inferra@postgres:5432/inferra`
- `postgres` container is healthy
- Migrations completed successfully

### Backend cannot connect to Redis

Check:

- `REDIS_URL=redis://redis:6379/0`
- `redis` container is healthy

### OpenAI requests fail

Check:

- `OPENAI_API_KEY` is set in `.env`
- The key has access to the configured model
- Backend logs for upstream API errors

### Dashboard shows no data

Possible causes:

- No successful or failed inference logs have been queued yet
- Worker is not running
- Redis queue is not reachable
- Worker cannot write to PostgreSQL

### Port already in use

Change ports in `.env`:

```env
FRONTEND_PORT=5174
BACKEND_PORT=8001
POSTGRES_PORT=5433
REDIS_PORT=6380
```
