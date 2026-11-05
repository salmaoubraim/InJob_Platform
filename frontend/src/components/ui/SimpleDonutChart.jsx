const COLORS = ['#4361EE', '#6B8CFF', '#A8C4FF', '#06D6A0'];

export default function SimpleDonutChart({ data = [], size = 160 }) {
  if (!data.length) return null;

  const total = data.reduce((s, d) => s + (d.pct ?? d.count), 0) || 100;
  let offset = 0;
  const r = 40;
  const c = 2 * Math.PI * r;

  const segments = data.map((item, i) => {
    const pct = (item.pct ?? item.count) / total;
    const dash = pct * c;
    const seg = { dash, gap: c - dash, offset, color: COLORS[i % COLORS.length], label: item.label, pct: item.pct ?? Math.round(pct * 100) };
    offset -= dash;
    return seg;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E8E8F5" strokeWidth="12" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <ul className="space-y-2 text-sm min-w-0">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-text-dark font-medium">{s.label}</span>
            <span className="text-text-secondary ml-auto">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
