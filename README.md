# Career Compass 🧭

A coaching companion web app built around the **Career Compass Map** — a flexible multi-dimensional framework for mapping career identity, diagnosing coherence gaps, and generating a clear professional narrative.

## What it does

Career Compass helps a coach (or individual) structure a career across multiple dimensions — between 3 and 6 — and uses AI analysis to surface:

- How coherent the dimensions are with each other
- Where the personal brand "hub" is strong or fractured
- Key tensions, gaps, and opportunities
- Reflection questions for coaching conversations
- A narrative thread the client can own
- A radar chart visualising career shape across all dimensions
- A PDF export of the full analysis

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
| PDF Export | ReportLab |
| Profiles | JSON (local, per-profile files) |

## Project Structure

```
career-compass/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/        # Home, ProfileForm, Analysis
│   │   └── hooks/
│   ├── index.html
│   └── package.json
├── backend/           # Flask API
│   ├── app.py            # API routes
│   ├── coach.py          # Career Compass Map logic + Claude calls
│   ├── export.py         # PDF generation via ReportLab
│   ├── config.py         # Config and env vars
│   └── prompts/
│       └── analysis_prompt.txt
├── profiles/          # Stored coach/client profiles (JSON, not committed)
├── docs/
│   └── career-compass-map.md
├── start.sh           # Start both servers + open browser
├── stop.sh            # Stop both servers
├── requirements.txt
└── README.md
```

## Getting Started

### First time setup

**1. Install Python dependencies**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

**2. Add your Anthropic API key**

Create `backend/.env` and add:
```
ANTHROPIC_API_KEY=your_key_here
```

**3. Install frontend dependencies**
```bash
cd frontend
npm install
```

### Running the app

From the project root:
```bash
./start.sh
```

This starts both servers in the background and opens `http://localhost:5173` in your browser automatically.

To stop:
```bash
./stop.sh
```

### Optional: shell aliases

Add to `~/.zshrc` for one-word launch from anywhere:
```bash
alias compass='~/Documents/career-compass/start.sh'
alias compassstop='~/Documents/career-compass/stop.sh'
```

Then just type `compass` to start and `compassstop` to stop.

## The Career Compass Map

The framework maps a career across 3 to 6 independently defined dimensions — each representing a distinct aspect of professional identity. A central **hub** holds them together as the personal brand.

| Element | Description |
|---|---|
| Dimensions | 3–6 career dimensions, each independently scored 1–10 |
| Hub | The personal brand — the narrative thread across all dimensions |
| Coherence Score | How well the dimensions connect and reinforce each other |
| Radar Chart | Visual shape of the career — balanced = coherent, lopsided = opportunity |
| PDF Export | Full analysis report for sharing with clients |

The radar chart is the key diagnostic tool: a balanced polygon means strong coherence across all dimensions. A lopsided shape immediately flags where coaching energy is needed.

---

*Built by subh-c-ydv*