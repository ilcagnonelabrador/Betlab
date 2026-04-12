// pages/api/analyze.js
import Anthropic from "@anthropic-ai/sdk";
import { calcGoalProbability } from "../../lib/matches";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { matches } = req.body;
  if (!matches || !Array.isArray(matches)) {
    return res.status(400).json({ error: "Missing matches array" });
  }

  const summaries = matches
    .map((m) => {
      const prob = calcGoalProbability(m.stats);
      return (
        `${m.home} vs ${m.away} (${m.league}): ` +
        `punteggio ${m.score.home}-${m.score.away}, minuto ${m.minute}', ` +
        `probabilità gol ${prob}%. ` +
        `Tiri in porta: ${(m.stats.shotsOnTarget?.home ?? 0) + (m.stats.shotsOnTarget?.away ?? 0)}, ` +
        `attacchi pericolosi: ${(m.stats.dangerousAttacks?.home ?? 0) + (m.stats.dangerousAttacks?.away ?? 0)}, ` +
        `corner: ${(m.stats.corners?.home ?? 0) + (m.stats.corners?.away ?? 0)}.`
      );
    })
    .join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system:
        "Sei un analista di calcio esperto e conciso. " +
        "Analizza le partite live e indica quale è più vicina a un gol nei prossimi 5-10 minuti e perché. " +
        "Usa emoji calcistiche. Massimo 3 frasi. Sii diretto e incisivo.",
      messages: [
        {
          role: "user",
          content: `Analizza queste partite live:\n${summaries}\n\nQuale è più pericolosa e perché?`,
        },
      ],
    });

    const text =
      message.content.find((b) => b.type === "text")?.text ??
      "Analisi non disponibile.";

    return res.status(200).json({ analysis: text });
  } catch (err) {
    console.error("Anthropic error:", err);
    return res
      .status(500)
      .json({ error: "Errore durante l'analisi AI.", detail: err.message });
  }
}
