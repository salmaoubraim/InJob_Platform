export default function PageShell({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <header className="page-intro">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark">{title}</h1>
        {subtitle && (
          <p className="text-text-secondary mt-2 leading-relaxed max-w-3xl">{subtitle}</p>
        )}
        {action && <div className="mt-4 flex flex-wrap gap-3">{action}</div>}
      </header>
      {children}
    </div>
  );
}
