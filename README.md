# LeetMatric 🧠

A full-stack LeetCode stats tracker. No CORS hacks — the Node backend proxies all LeetCode API calls cleanly.

## Project Structure

```
leetmatric/
├── backend/
│   ├── server.js        ← Express API server
│   └── package.json
└── frontend/
    └── public/
        ├── index.html   ← Main page
        ├── style.css    ← All styles
        └── app.js       ← Frontend logic
```

## Setup & Run

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
# Production
node server.js

# Development (auto-restart on changes)
npx nodemon server.js
```

### 3. Open in browser
```
http://localhost:3000
```

The backend serves the frontend from `frontend/public/` automatically.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/:username` | Profile, solved counts, submission stats |
| GET | `/api/user/:username/recent` | Last 8 submissions |
| GET | `/api/user/:username/calendar` | Streak, active days, heatmap data |

## Features

- **Profile card** — avatar, real name, global ranking
- **SVG progress rings** — animated easy / medium / hard rings
- **Submission stats** — totals + acceptance rate per difficulty
- **Activity heatmap** — 6-month submission calendar
- **Streak counter** — current day streak + total active days
- **Recent submissions** — last 8 attempts with status, language, time
- **Skeleton loaders** — smooth loading states
- **Rate limiting** — 30 req/min per IP to protect the proxy
- **Input validation** — both client & server side
- **Enter key support** + debounced error clearing

## Deploy

Works on any Node host: **Railway**, **Render**, **Fly.io**, **VPS**.

Set `PORT` environment variable if needed (defaults to `3000`).
