import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

if (!ANTHROPIC_API_KEY) {
  console.warn(
    "[warn] ANTHROPIC_API_KEY is not set. Create server/.env from .env.example and add your key."
  );
}

// Optional fallback: point this at a local/open-source model server (e.g. Ollama).
// If ANTHROPIC_API_KEY is missing or the Anthropic call fails, we try this instead.
const FALLBACK_URL = process.env.FALLBACK_MODEL_URL || "";

async function callAnthropic(system, userPrompt, maxTokens = 1000) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Anthropic API error (${response.status}): ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  return (data.content || []).map((b) => b.text || "").join("\n");
}

async function callFallback(system, userPrompt) {
  if (!FALLBACK_URL) throw new Error("No fallback model URL configured.");
  const response = await fetch(FALLBACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.FALLBACK_MODEL_NAME || "codellama",
      prompt: `${system}\n\n${userPrompt}`,
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`Fallback endpoint error (${response.status})`);
  const data = await response.json();
  return data.response || data.text || JSON.stringify(data);
}

// Single endpoint used for both pipeline steps (issue-scan, then summary).
app.post("/api/review", async (req, res) => {
  const { system, prompt, maxTokens } = req.body || {};
  if (!system || !prompt) {
    return res.status(400).json({ error: "Both 'system' and 'prompt' are required." });
  }

  let usedFallback = false;
  try {
    if (!ANTHROPIC_API_KEY) throw new Error("Server has no ANTHROPIC_API_KEY configured.");
    const text = await callAnthropic(system, prompt, maxTokens);
    return res.json({ text, usedFallback });
  } catch (primaryErr) {
    if (!FALLBACK_URL) {
      return res.status(502).json({ error: primaryErr.message });
    }
    try {
      usedFallback = true;
      const text = await callFallback(system, prompt);
      return res.json({ text, usedFallback });
    } catch (fallbackErr) {
      return res.status(502).json({
        error: `Primary failed: ${primaryErr.message}. Fallback failed: ${fallbackErr.message}`,
      });
    }
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasKey: Boolean(ANTHROPIC_API_KEY), fallbackConfigured: Boolean(FALLBACK_URL) });
});

// Serve the built frontend
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Code Review Agent running at http://localhost:${PORT}`));
