export default function SimpleLineChart({ data = [], strokeClass = 'stroke-primary', fillClass = 'fill-primary/10' }) {
  if (!data.length) {
    return <p className="text-sm text-text-secondary py-4 text-center">Aucune donnée.</p>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 100;
  const height = 40;
  const points = data.map((item, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - (item.count / max) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`;
  const linePoints = points.join(' ');

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" preserveAspectRatio="none">
        <polygon points={areaPoints} className={fillClass} />
        <polyline
          points={linePoints}
          fill="none"
          className={`${strokeClass} stroke-[0.6]`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between gap-2 text-[10px] sm:text-xs text-text-secondary">
        {data.map((item) => (
          <span key={item.label} className="truncate text-center flex-1">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
