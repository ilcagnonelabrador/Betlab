// pages/api/matches.js
import { fetchLiveMatches, MOCK_MATCHES } from "../../lib/matches";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  const live   = await fetchLiveMatches(apiKey);

  if (live && live.length > 0) {
    return res.status(200).json({ matches: live, source: "live" });
  }

  return res.status(200).json({ matches: MOCK_MATCHES, source: "demo" });
}
