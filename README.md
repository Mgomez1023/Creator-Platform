# creator-intel

Production-ready MVP monorepo for Creator Intelligence draft scoring.

## Stack

- `apps/api`: FastAPI + SQLAlchemy + Postgres/SQLite
- `apps/web`: React + Vite + TypeScript + Tailwind
- Local database via Docker Compose (`postgres` service)

## Repository Tree

```text
creator-intel/
├── .gitignore
├── docker-compose.yml
├── README.md
└── apps/
    ├── api/
    │   ├── .env.example
    │   ├── README.md
    │   ├── requirements.txt
    │   └── app/
    │       ├── __init__.py
    │       ├── analyzer.py
    │       ├── config.py
    │       ├── db.py
    │       ├── main.py
    │       ├── models.py
    │       ├── schemas.py
    │       └── simulation.py
    └── web/
        ├── .env.example
        ├── README.md
        ├── index.html
        ├── package.json
        ├── postcss.config.js
        ├── tailwind.config.ts
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        └── src/
            ├── App.tsx
            ├── index.css
            ├── main.tsx
            ├── vite-env.d.ts
            ├── components/
            │   ├── AppShell.tsx
            │   └── MetricCard.tsx
            ├── lib/
            │   ├── api.ts
            │   ├── format.ts
            │   └── schemas.ts
            └── pages/
                ├── AnalysisDetailPage.tsx
                ├── DashboardPage.tsx
                └── NewAnalysisPage.tsx
```

## 1) Start Postgres (optional, recommended)

```bash
cd creator-intel
docker compose up -d postgres
```

## 2) Run API

```bash
cd creator-intel/apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Choose DB mode in `.env`:

- SQLite fallback (default):
  - `DATABASE_URL=sqlite:///./creator_intel.db`
- Postgres via Docker:
  - `DATABASE_URL=postgresql+psycopg://creator:creator@localhost:5432/creator_intel`

Then run:

```bash
uvicorn app.main:app --reload --port 8000
```

## 3) Run Web

```bash
cd creator-intel/apps/web
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`
API docs: `http://localhost:8000/docs`

## API Endpoints

- `POST /analyze`
  - Input: `platform`, `caption`, optional `transcript`
  - Flow: validates input, runs AI analyzer (OpenAI JSON mode or deterministic fallback), simulates stage probabilities, stores analysis row, returns stored row.
- `GET /analyses`
  - Returns newest-first list.
- `GET /analyses/{id}`
  - Returns detail for one analysis.

## Analyze Output Shape

```json
{
  "id": 1,
  "platform": "tiktok",
  "caption": "...",
  "transcript": "...",
  "predicted_score": 6.8,
  "stage1_pass_prob": 0.73,
  "stage2_pass_prob": 0.57,
  "viral_prob": 0.12,
  "top_recommendations": ["..."],
  "rewritten_caption": "...",
  "hook_options": ["...", "...", "..."],
  "why_this_score": "...",
  "created_at": "2026-03-05T00:00:00"
}
```

## OpenAI Analyzer Behavior

- If `OPENAI_API_KEY` is set, API requests a strict JSON object from the model and validates it with Pydantic.
- If missing (or provider call fails), API falls back to deterministic heuristics based on hook markers, CTA keywords, caption/transcript structure, and length.
