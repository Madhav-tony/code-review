# Autonomous Code Review Agent

A web app that reviews pasted or uploaded code for **bugs/quality issues** and
**style/convention issues** using the Claude API. It runs two chained model calls per
review (scan → synthesize), producing a risk score, a short summary, and prioritized
issue cards with suggested fixes.

```
autonomous-code-review-agent/
├── server/          Express backend — the ONLY place your API key lives
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── public/          Static frontend (React via CDN, no build step)
│   ├── index.html
│   ├── app.js
│   └── style.css
├── render.yaml       Lets Render auto-configure itself from GitHub
└── package.json
```

Your Anthropic API key must never be shipped to the browser. The frontend calls
`/api/review` on your own server, and the server calls Anthropic using a key that
only it knows.

---

## Deploy straight from GitHub (recommended path)

**1. Get an API key** — https://console.anthropic.com → Settings → API Keys.

**2. Put this project in a GitHub repo**
- Go to github.com → **+** → **New repository** → name it → Create.
- On the empty repo page, click **"uploading an existing file"**.
- Drag in this entire `autonomous-code-review-agent` folder.
- Click **Commit changes**.

**3. Deploy on Render**
- Go to **render.com** → sign in with GitHub → **New +** → **Blueprint**.
- Pick your repo. Because this project includes `render.yaml`, Render reads the
  root directory, build command, and start command automatically — you don't
  type any of that in by hand.
- When prompted for `ANTHROPIC_API_KEY`, paste your real key.
- Click **Apply** / **Create**.

**4. Wait ~1-2 minutes.** Render gives you a live public URL like
`https://autonomous-code-review-agent-xxxx.onrender.com` — open it, that's the app,
live on the web.

(No `render.yaml`/Blueprint support on your host? Use a plain **Web Service** instead
and fill in manually: Root Directory `server`, Build Command `npm install`, Start
Command `npm start`, plus the `ANTHROPIC_API_KEY` env var.)

---

## Run it locally first (optional, good for testing before you deploy)

```bash
cd server
cp .env.example .env      # then paste your key into ANTHROPIC_API_KEY=
npm install
npm start
```
Open **http://localhost:3000**.

To use a different port, set `PORT=xxxx` in `server/.env`.

---

## Notes

- Model used: `claude-sonnet-4-6` (Anthropic Messages API). Change via `ANTHROPIC_MODEL`
  in `.env` / Render's environment variables.
- The two-step pipeline (scan, then synthesize) is what gives the "autonomous agent"
  behavior — real sequential model calls, not a simulation.
- No auth or rate-limiting is included. If your Render URL is public, anyone who finds
  it can trigger reviews (and spend your API credits). Add basic auth or a rate limiter
  before sharing the link widely — ask me if you want this added.
- No build tooling needed for the frontend — React and Babel load from a CDN and JSX
  is transpiled in the browser.
