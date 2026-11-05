export default function PlaceholderPage({ title, description }) {
  return (
    <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 auth-card">
      <h1 className="text-2xl font-bold text-text-dark">{title}</h1>
      <p className="text-text-secondary mt-3 leading-relaxed">
        {description ||
          'Ce module sera bientôt disponible. Les tables correspondantes sont déjà prévues dans la base de données.'}
      </p>
    </div>
  );
}
