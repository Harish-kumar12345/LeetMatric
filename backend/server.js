const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend/public"));

// Rate limiter: max 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many requests, slow down." },
});
app.use("/api/", limiter);

// ── GraphQL Queries ──────────────────────────────────────────────────────────
const LEETCODE_URL = "https://leetcode.com/graphql/";

const STATS_QUERY = `
  query userSessionProgress($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      profile { realName userAvatar ranking }
      submitStats {
        acSubmissionNum { difficulty count submissions }
        totalSubmissionNum { difficulty count submissions }
      }
    }
  }
`;

const RECENT_QUERY = `
  query recentSubmissions($username: String!) {
    recentSubmissionList(username: $username, limit: 8) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

// ── Helper ───────────────────────────────────────────────────────────────────
async function leetcodeQuery(query, variables) {
  const res = await fetch(LEETCODE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`LeetCode returned ${res.status}`);
  return res.json();
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/user/:username  → stats + profile
app.get("/api/user/:username", async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_-]{1,25}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }
  try {
    const data = await leetcodeQuery(STATS_QUERY, { username });
    if (!data?.data?.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(data.data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Failed to reach LeetCode" });
  }
});

// GET /api/user/:username/recent  → last 8 submissions
app.get("/api/user/:username/recent", async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_-]{1,25}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }
  try {
    const data = await leetcodeQuery(RECENT_QUERY, { username });
    res.json(data.data?.recentSubmissionList || []);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Failed to reach LeetCode" });
  }
});

// GET /api/user/:username/calendar  → streak + heatmap
app.get("/api/user/:username/calendar", async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_-]{1,25}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }
  const year = new Date().getFullYear();
  try {
    const data = await leetcodeQuery(CALENDAR_QUERY, { username, year });
    const cal = data?.data?.matchedUser?.userCalendar;
    if (!cal) return res.status(404).json({ error: "Calendar not found" });
    res.json(cal);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Failed to reach LeetCode" });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  LeetMatric server running → http://localhost:${PORT}`);
});
