// components/StatBar.js
export default function StatBar({ label, home, away }) {
  const total   = (home + away) || 1;
  const homePct = (home / total) * 100;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: "var(--muted)", marginBottom: 3, fontFamily: "monospace",
      }}>
        <span style={{ color: "var(--text)" }}>{home}</span>
        <span style={{ letterSpacing: 1 }}>{label}</span>
        <span style={{ color: "var(--text)" }}>{away}</span>
      </div>
      <div style={{
        height: 4, background: "var(--border)", borderRadius: 2,
        display: "flex", overflow: "hidden",
      }}>
        <div style={{
          width: `${homePct}%`, background: "var(--blue)",
          transition: "width 0.8s ease",
        }} />
        <div style={{ flex: 1, background: "var(--warn)" }} />
      </div>
    </div>
  );
}
