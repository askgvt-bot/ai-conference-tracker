# Conference Tracker API + CLI + OpenClaw Skill

## What to Build

### 1. FastAPI Backend (`api/`)
A standalone Python FastAPI service (port 8450 is taken, use **8460**) that serves the conference data from `data/conferences.json` and `data/speakers.json`.

#### Endpoints:
- `GET /api/conferences` — list all, with query params:
  - `?days=30` — upcoming in next N days
  - `?type=industry|academic|executive` — filter by type
  - `?region=Europe|Asia|...` — filter by region
  - `?focus=video,AI` — filter by focus areas (comma-separated, any match)
  - `?min_score=80` — minimum relevance score
  - `?sort=date|score|attendees` — sort order (default: date)
  - `?limit=10` — max results
- `GET /api/conferences/{id}` — single conference detail
- `GET /api/speakers` — list speakers, optional `?conference_id=X`
- `GET /api/speakers/{id}` — single speaker + their conferences
- `GET /api/upcoming` — shortcut: next 30 days, sorted by score
- `GET /api/recommend` — conferences recommended for a user profile
  - Reads `data/user-profile.json` for preferences
  - Returns scored+ranked results with reasoning
- `GET /health` — health check

#### Data:
- Load from existing JSON files in `data/` directory
- Use the existing TypeScript interfaces as reference (see `lib/data.ts`)
- Include region mapping and country flags

### 2. CLI Tool (`cli/confctl`)
A Python CLI (using click or argparse) installed as `confctl`:

```bash
confctl upcoming                    # Next 30 days
confctl upcoming --days 60          # Next 60 days  
confctl search --focus "video AI"   # Search by focus
confctl search --region Europe      # Search by region
confctl show nvidia-gtc-2026        # Show conference detail
confctl recommend                   # Personal recommendations
confctl speakers --conference nvidia-gtc-2026  # Speakers at event
confctl list --type industry --min-score 85    # Filtered list
```

Output should be clean text, suitable for terminal and for an AI agent to parse.
JSON output with `--json` flag.

### 3. OpenClaw Skill (`skill/`)
Create an OpenClaw skill at `~/.openclaw/workspace/skills/conference-tracker/SKILL.md`

The skill should:
- Describe when to use it (conference questions, event lookups, recommendations)
- Document the CLI commands
- Reference the API for more complex queries
- Be concise per skill-creator guidelines

## Technical Details
- Python 3.14 (use `python3`)
- FastAPI + uvicorn for the API
- Use a venv at `api/.venv/`
- The API should auto-reload in dev
- Conference data path: relative to project root `data/conferences.json`
- Keep it simple — no database, just JSON files

## File Structure
```
ai-conference-tracker/
├── api/
│   ├── main.py          # FastAPI app
│   ├── models.py         # Pydantic models
│   ├── routes.py         # API routes
│   ├── data_loader.py    # JSON loading + filtering
│   └── requirements.txt  # fastapi, uvicorn
├── cli/
│   ├── confctl.py        # CLI entry point
│   └── requirements.txt  # click, requests, rich
├── data/                 # existing JSON files (don't modify)
└── BUILD_SPEC.md         # this file
```

## Don't Forget
- Test the API starts and serves data
- Test the CLI works against the API
- Create the skill at the correct path
- Use existing data structures — don't reinvent
