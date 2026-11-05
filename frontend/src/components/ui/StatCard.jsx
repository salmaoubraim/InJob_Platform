import { Link } from 'react-router-dom';

export default function StatCard({ label, value, icon: Icon, to, trend, className = '' }) {
  const displayValue = value ?? 0;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <p className="text-3xl font-bold text-text-dark tabular-nums leading-none">{displayValue}</p>
      </div>
      <p className="text-sm font-medium text-text-dark mt-3">{label}</p>
      {trend && <p className="text-xs text-text-secondary mt-1">{trend}</p>}
    </>
  );

  const cardClass = `bg-white rounded-2xl p-6 border border-gray-100 auth-card transition-all duration-200 hover:shadow-md ${className}`;

  if (to) {
    return (
      <Link to={to} className={`block ${cardClass}`}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
