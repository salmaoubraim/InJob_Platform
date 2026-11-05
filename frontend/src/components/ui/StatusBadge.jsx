const VARIANTS = {
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-soft text-primary',
};

export default function StatusBadge({ label, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
    >
      {label}
    </span>
  );
}
