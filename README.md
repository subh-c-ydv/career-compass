# Career Compass 🧭

A coaching companion web app built around the **Mercedes Model** — a three-domain framework for mapping career identity, diagnosing coherence gaps, and generating a clear professional narrative.

## What it does

Career Compass helps a coach (or individual) structure a career across three interconnected domains — like the three points of the Mercedes star — and uses AI analysis to surface:

- How coherent the three domains are with each other
- Where the personal brand "hub" is strong or fractured
- Key tensions, gaps, and opportunities
- Reflection questions for coaching conversations
- A narrative summary the client can own

## Who it's for

- Primary: the coach (you) running sessions with clients
- Secondary: individuals doing structured self-reflection
- Profile #1 is always the coach's own career — the reference implementation

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Python + Flask |
| AI | Anthropic Claude API |
| Profiles | JSON (local, per-profile files) |

## Project Structure

```
career-compass/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   └── hooks/        # Custom React hooks
│   ├── index.html
│   └── package.json
├── backend/           # Flask API
│   ├── app.py            # API routes
│   ├── coach.py          # Mercedes Model logic + Claude calls
│   ├── config.py         # Config and env vars
│   └── prompts/          # Prompt templates
│       └── analysis_prompt.txt
├── profiles/          # Stored coach/client profiles (JSON)
├── docs/              # Design notes, framework reference
├── requirements.txt
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
export ANTHROPIC_API_KEY=your_key_here
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` with the API at `http://localhost:5000`.

## The Mercedes Model

The framework maps a career across three points:

1. **Domain A** — Current core (where you operate today)
2. **Domain B** — Aspirational direction (where you're heading)
3. **Domain C** — Methodological identity (how you work / your craft)

The **hub** — the centre of the star — is your personal brand: the narrative that holds all three together. Career Compass evaluates coherence between the three points and the strength of the hub.

---

*Built by subh-c-ydv*