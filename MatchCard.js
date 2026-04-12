// components/MatchCard.js
import GaugeMeter from "./GaugeMeter";
import StatBar    from "./StatBar";
import { calcGoalProbability, getProbLabel } from "../lib/matches";

export default function MatchCard({ match }) {
  const prob        = calcGoalProbability(match.stats);
  const { label, color } = getProbLabel(prob);
  const pulse       = prob >= 75;

  return (
    <div style={{
      background: "var(--card)",
      border: `1px solid ${prob >= 50 ? color : "var(--border)"}`,
      borderRadius: 16,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      boxShadow: pulse ? `0 0 30px ${color}44` : "none",
      transition: "all 0.5s ease",
      animation: "fadeIn 0.4s ease",
    }}>
      {pulse && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)`,
          animation: "pulseGlow 2s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, marginBottom: 4 }}>
            {match.league.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
              {match.home}
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'JetBrains Mono', monospace", minWidth: 60, textAlign: "center" }}>
              {match.score.home} : {match.score.away}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
              {match.away}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
          <div style={{
            background: prob >= 50 ? `${color}22` : "var(--border)",
            border: `1px solid ${prob >= 50 ? color : "var(--border)"}`,
            borderRadius: 8, padding: "4px 10px",
            fontSize: 11, color, fontWeight: 700, letterSpacing: 1,
          }}>
            {match.minute}'
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>LIVE</div>
        </div>
      </div>

      {/* Gauge */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <GaugeMeter value={prob} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: 0.5, lineHeight: 1.4 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            {prob >= 75 && "Pressione massima! Alta probabilità di gol."}
            {prob >= 50 && prob < 75 && "Intensa fase offensiva in corso."}
            {prob >= 25 && prob < 50 && "Partita equilibrata con occasioni sporadiche."}
            {prob < 25  && "Ritmo basso, poche occasioni create."}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "var(--muted)", marginBottom: 8, letterSpacing: 1,
        }}>
          <span style={{ color: "var(--blue)" }}>{match.home}</span>
          <span>STATISTICHE</span>
          <span style={{ color: "var(--warn)" }}>{match.away}</span>
        </div>
        <StatBar label="Tiri in porta"       home={match.stats.shotsOnTarget?.home    ?? 0} away={match.stats.shotsOnTarget?.away    ?? 0} />
        <StatBar label="Attacchi pericolosi" home={match.stats.dangerousAttacks?.home ?? 0} away={match.stats.dangerousAttacks?.away ?? 0} />
        <StatBar label="Possesso %"          home={match.stats.possession?.home       ?? 50} away={match.stats.possession?.away       ?? 50} />
        <StatBar label="Calci d'angolo"      home={match.stats.corners?.home          ?? 0} away={match.stats.corners?.away          ?? 0} />
      </div>
    </div>
  );
}
