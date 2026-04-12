// components/GaugeMeter.js
export default function GaugeMeter({ value }) {
  const r = 52;
  const cx = 64, cy = 64;
  const circumference = Math.PI * r;
  const dashOffset    = circumference * (1 - value / 100);

  const color =
    value >= 75 ? "var(--danger)" :
    value >= 50 ? "var(--warn)"   :
    value >= 25 ? "var(--blue)"   : "var(--accent)";

  return (
    <svg width={128} height={80} viewBox="0 0 128 80" style={{ overflow: "visible" }}>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="var(--border)" strokeWidth={10} strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
        style={{ fontSize: 24, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
        {value}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--muted)"
        style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 2 }}>
        GOAL PROB
      </text>
    </svg>
  );
}
