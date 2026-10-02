// Dependency-free SVG charts for the admin dashboard.

const PALETTE = ['#FFC400', '#E50914', '#4ade80', '#60a5fa', '#c084fc', '#22d3ee', '#fb923c', '#f472b6'];

export function BarChart({ data, height = 180, formatY }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 100 / Math.max(data.length, 1);
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} role="img" aria-label="Bar chart">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2="100" y1={height - f * (height - 20)} y2={height - f * (height - 20)} stroke="var(--yumbite-chart-grid)" strokeWidth="0.3" />
        ))}
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / max) * (height - 30));
          const x = i * barW + barW * 0.2;
          return (
            <g key={d.label}>
              <rect x={x} y={height - 16 - h} width={barW * 0.6} height={h} rx="1" fill={PALETTE[i % PALETTE.length]}>
                <title>{`${d.label}: ${formatY ? formatY(d.value) : d.value}`}</title>
              </rect>
              <text x={i * barW + barW / 2} y={height - 4} fontSize="3" fill="var(--yumbite-chart-label)" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DonutChart({ data, size = 170 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 25;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Distribution chart" className="flex-shrink-0">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--yumbite-chart-grid)" strokeWidth="18" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const el = (
            <circle
              key={d.label}
              cx="70" cy="70" r={R} fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="18"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-offset * C / 100 + C / 4}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset += frac * 100;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fill="var(--yumbite-chart-text)" fontSize="20" fontWeight="bold">{total}</text>
        <text x="70" y="82" textAnchor="middle" fill="var(--yumbite-chart-label)" fontSize="9">total</text>
      </svg>
      <ul className="space-y-1.5 text-body-sm flex-1 w-full">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-yumbite-white/70 truncate">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
              {d.label}
            </span>
            <span className="text-yumbite-white font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
