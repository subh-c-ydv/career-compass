# Career Compass 🧭

A coaching companion web app built around the **Career Compass Map** — a flexible multi-dimensional framework for mapping career identity, diagnosing coherence gaps, and generating a clear professional narrative.

## What it does

Career Compass helps a coach (or individual) structure a career across multiple dimensions — between 3 and 6 — and uses AI analysis to surface:

- How coherent the dimensions are with each other
- Where the personal brand "hub" is strong or fractured
- Key tensions, gaps, and opportunities
- Reflection questions for coaching conversations
- A narrative thread the client can own

## Who it's for

- Primary: the coach running sessions with clients
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
│   ├── coach.py          # Career Compass Map logic + Claude calls
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
python3 app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` with the API at `http://localhost:5001`.

## The Career Compass Map

The framework maps a career across 3 to 6 independently defined dimensions — each representing a distinct aspect of professional identity. A central **hub** holds them together as the personal brand.

| Element | Description |
|---|---|
| Dimensions | 3–6 career dimensions, each independently scored |
| Hub | The personal brand — the narrative thread across all dimensions |
| Coherence Score | How well the dimensions connect and reinforce each other |
| Radar Chart | Visual shape of the career — balanced = coherent, lopsided = opportunity |

The radar chart is the key diagnostic tool: a balanced polygon means strong coherence across all dimensions. A lopsided shape immediately flags where coaching energy is needed.

---

*Built by subh-c-ydv*