# Conference Tracker

Use this skill for questions about AI conferences, upcoming events, speakers, and personalized recommendations.

## When to use
- Find conferences by date range, region, type, or focus area
- Look up a specific conference or speaker
- Recommend conferences based on the user profile in `data/user-profile.json`

## CLI commands (preferred)
- `confctl upcoming --days 30`
- `confctl search --focus "video AI"`
- `confctl search --region Europe`
- `confctl show nvidia-gtc-2026`
- `confctl recommend`
- `confctl speakers --conference nvidia-gtc-2026`
- `confctl list --type industry --min-score 85`
- Add `--json` for machine-readable output

## API (for advanced queries)
Base URL: `http://127.0.0.1:8460`
- `GET /api/conferences` with filters: `days`, `type`, `region`, `focus`, `min_score`, `sort`, `limit`
- `GET /api/conferences/{id}`
- `GET /api/speakers` with optional `conference_id`
- `GET /api/speakers/{id}`
- `GET /api/upcoming`
- `GET /api/recommend`
- `GET /health`
