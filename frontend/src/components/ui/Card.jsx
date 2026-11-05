export default function Card({ title, action, children, className = '', padding = 'p-6' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 auth-card ${padding} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && <h2 className="font-semibold text-text-dark">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
