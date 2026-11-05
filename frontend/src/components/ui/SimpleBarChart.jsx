export default function SimpleBarChart({ data = [], maxValue, barClassName = 'bg-primary' }) {
  if (!data.length) {
    return <p className="text-sm text-text-secondary py-4 text-center">Aucune donnée.</p>;
  }

  const max = maxValue ?? Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-40 pt-2">
      {data.map((item) => {
        const pct = Math.max(8, (item.count / max) * 100);
        return (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-2 min-w-0"
            title={`${item.label}: ${item.count}`}
          >
            <span className="text-xs font-semibold text-text-dark">{item.count}</span>
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ${barClassName}`}
              style={{ height: `${pct}%` }}
            />
            <span className="text-[10px] sm:text-xs text-text-secondary text-center truncate w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
