// pages/index.js
import { useState, useEffect, useCallback } from "react";
import Head      from "next/head";
import MatchCard from "../components/MatchCard";
import { calcGoalProbability } from "../lib/matches";

// ── AI Insight panel ─────────────────────────────────────────────────────────
function AIInsight({ matches }) {
  const [insight, setInsight]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");

  const analyze = useCallback(async () => {
    if (loading || !matches.length) return;
    setLoading(true);
    setError("");
    setInsight("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore sconosciuto");
      setInsight(data.analysis);
    } catch (e) {
      setError("⚠️ " + e.message);
    } finally {
      setLoading(false);
    }
  }, [matches, loading]);

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--surface) 0%, #0a1a2a 100%)",
      border: "1px solid #00ff8844",
      borderRadius: 16, padding: "18px 22px", marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)", boxShadow: "0 0 10px var(--accent)",
            animation: "blink 1.5s infinite",
          }} />
          <span style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 2, fontWeight: 700 }}>
            ANALISI AI IN TEMPO REALE
          </span>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            background: loading ? "var(--border)" : "#00ff8822",
            border: `1px solid ${loading ? "var(--muted)" : "var(--accent)"}`,
            color: loading ? "var(--muted)" : "var(--accent)",
            borderRadius: 8, padding: "5px 14px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 11, letterSpacing: 1, transition: "all 0.3s",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {loading ? "ANALIZZANDO..." : "↺ AGGIORNA"}
        </button>
      </div>

      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, minHeight: 40 }}>
        {loading && (
          <span style={{ color: "var(--muted)" }}>
            <span style={{ animation: "blink 0.8s infinite" }}>▋</span> Elaborazione dati in corso...
          </span>
        )}
        {!loading && error   && <span style={{ color: "var(--danger)" }}>{error}</span>}
        {!loading && insight && insight}
        {!loading && !insight && !error && (
          <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
            Clicca "Aggiorna" per ricevere un&apos;analisi AI delle partite più pericolose.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [matches,    setMatches]    = useState([]);
  const [source,     setSource]     = useState("demo");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [loading,    setLoading]    = useState(true);

  // Fetch from /api/matches
  const loadMatches = useCallback(async () => {
    try {
      const res  = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data.matches ?? []);
      setSource(data.source ?? "demo");
      setLastUpdate(new Date());
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    const id = setInterval(loadMatches, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, [loadMatches]);

  // Simulate stat drift in demo mode
  useEffect(() => {
    if (source !== "demo") return;
    const id = setInterval(() => {
      setMatches((prev) =>
        prev.map((m) => ({
          ...m,
          minute: Math.min(m.minute + 1, 90),
          stats: {
            ...m.stats,
            minute: Math.min((m.stats.minute ?? 0) + 1, 90),
            shotsOnTarget: {
              home: m.stats.shotsOnTarget.home + (Math.random() > 0.85 ? 1 : 0),
              away: m.stats.shotsOnTarget.away + (Math.random() > 0.87 ? 1 : 0),
            },
            dangerousAttacks: {
              home: m.stats.dangerousAttacks.home + (Math.random() > 0.6 ? 1 : 0),
              away: m.stats.dangerousAttacks.away + (Math.random() > 0.62 ? 1 : 0),
            },
            corners: {
              home: m.stats.corners.home + (Math.random() > 0.93 ? 1 : 0),
              away: m.stats.corners.away + (Math.random() > 0.93 ? 1 : 0),
            },
            recentGoalEvent: Math.random() > 0.92,
          },
        }))
      );
      setLastUpdate(new Date());
    }, 7_000);
    return () => clearInterval(id);
  }, [source]);

  const sorted = [...matches]
    .map((m) => ({ ...m, prob: calcGoalProbability(m.stats) }))
    .sort((a, b) => b.prob - a.prob);

  const filtered =
    filter === "hot"    ? sorted.filter((m) => m.prob >= 50) :
    filter === "danger" ? sorted.filter((m) => m.prob >= 75) : sorted;

  const topMatch   = sorted[0];
  const alertCount = sorted.filter((m) => m.prob >= 75).length;

  return (
    <>
      <Head>
        <title>GoalRadar — Rilevatore Probabilità Gol</title>
        <meta name="description" content="Statistiche live per prevedere i prossimi gol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        minHeight: "100vh",
        padding: "24px 16px",
        backgroundImage: `radial-gradient(ellipse at 20% 20%, #001a3322 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 80%, #00ff8808 0%, transparent 50%)`,
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: 4, marginBottom: 6 }}>
              ⚽ FOOTBALL ANALYTICS
            </div>
            <h1 style={{
              fontSize: "clamp(36px, 10vw, 56px)",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 4, color: "var(--text)", lineHeight: 1,
              textShadow: "0 0 40px #00ff8855",
            }}>
              GOAL<span style={{ color: "var(--accent)" }}>RADAR</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: 2, marginTop: 6 }}>
              RILEVAZIONE PROBABILITÀ GOL IN TEMPO REALE
            </p>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 16px", marginBottom: 20,
            fontSize: 10, color: "var(--muted)", letterSpacing: 1, flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span>
                🔴 <span style={{ color: "var(--text)" }}>{sorted.length}</span> LIVE
              </span>
              <span style={{ color: alertCount > 0 ? "var(--danger)" : "var(--muted)" }}>
                ⚡ <span style={{ color: "var(--text)" }}>{alertCount}</span> PERICOLO
              </span>
              <span style={{
                color: source === "live" ? "var(--accent)" : "var(--warn)",
                textTransform: "uppercase",
              }}>
                {source === "live" ? "🟢 DATI REALI" : "🟡 DEMO"}
              </span>
            </div>
            {lastUpdate && (
              <div>
                SYNC {lastUpdate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            )}
          </div>

          {/* Top danger banner */}
          {topMatch && topMatch.prob >= 60 && (
            <div style={{
              background: "linear-gradient(90deg, #ff3d5a22, #ffb30022)",
              border: "1px solid #ff3d5a88",
              borderRadius: 12, padding: "12px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
              animation: "pulseGlow 2s ease-in-out infinite",
            }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--danger)", fontWeight: 700, letterSpacing: 1 }}>
                  PARTITA PIÙ PERICOLOSA
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", marginTop: 2 }}>
                  <strong style={{ color: "var(--warn)" }}>{topMatch.home} vs {topMatch.away}</strong>
                  {" "}— Probabilità gol:{" "}
                  <strong style={{ color: "var(--danger)" }}>{topMatch.prob}%</strong>
                  {" "}al minuto <strong>{topMatch.minute}&apos;</strong>
                </div>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <AIInsight matches={sorted} />

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              ["all",    "TUTTE"],
              ["hot",    "⚡ CALDE (50%+)"],
              ["danger", "🔥 PERICOLO (75%+)"],
            ].map(([val, lab]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                background: filter === val ? "#00ff8822" : "transparent",
                border: `1px solid ${filter === val ? "var(--accent)" : "var(--border)"}`,
                color: filter === val ? "var(--accent)" : "var(--muted)",
                borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1, transition: "all 0.2s",
              }}>
                {lab}
              </button>
            ))}
          </div>

          {/* Match list */}
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 60 }}>
              <div style={{
                width: 32, height: 32, border: "3px solid var(--border)",
                borderTopColor: "var(--accent)", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              Caricamento partite...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: 40, fontSize: 13 }}>
                  Nessuna partita corrisponde al filtro selezionato.
                </div>
              ) : (
                filtered.map((m) => <MatchCard key={m.id} match={m} />)
              )}
            </div>
          )}

          {/* Legend */}
          <div style={{
            marginTop: 28, background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px",
          }}>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, marginBottom: 10 }}>
              LEGENDA INDICATORI
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
              {[
                ["var(--danger)", "75–100%", "Pericolo imminente"],
                ["var(--warn)",   "50–74%",  "Alta tensione"],
                ["var(--blue)",   "25–49%",  "Da monitorare"],
                ["var(--accent)", "0–24%",   "Situazione calma"],
              ].map(([color, range, desc]) => (
                <div key={range} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ color: "var(--muted)" }}>
                    <span style={{ color }}>{range}</span> {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", color: "var(--border)", fontSize: 10, marginTop: 20, letterSpacing: 2 }}>
            GOALRADAR • {source === "live" ? "API-FOOTBALL LIVE" : "MODALITÀ DEMO"} • AUTO-REFRESH 30s
          </div>
        </div>
      </main>
    </>
  );
}
