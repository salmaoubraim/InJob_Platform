export default function AdminIconBtn({
  title,
  onClick,
  children,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'text-text-secondary hover:text-primary hover:bg-primary-soft/50',
    danger: 'text-text-secondary hover:text-error hover:bg-red-50',
    success: 'text-text-secondary hover:text-emerald-700 hover:bg-emerald-50',
    warning: 'text-text-secondary hover:text-amber-700 hover:bg-amber-50',
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
}
