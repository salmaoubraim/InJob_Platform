const PARTNERS = [
  { name: 'Déco Maroc SARL', ville: 'Casablanca', secteur: 'Peinture' },
  { name: 'Salon Élégance Rabat', ville: 'Rabat', secteur: 'Coiffure' },
  { name: 'CleanPro Services', ville: 'Agadir', secteur: 'Ménage' },
  { name: 'Boutique Atlas', ville: 'Marrakech', secteur: 'Commerce' },
  { name: 'Clinique Santé Plus', ville: 'Fès', secteur: 'Santé' },
  { name: 'Cabinet Juridica', ville: 'Tanger', secteur: 'Juridique' },
];

export default function LandingPartners() {
  return (
    <section className="py-16 bg-white scroll-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-text-dark text-center">Entreprises partenaires</h2>
        <p className="text-text-secondary text-center mt-2 mb-8">
          Des recruteurs actifs sur InJob à travers le Maroc.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl p-5 border border-gray-100 auth-card hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-text-dark">{p.name}</p>
              <p className="text-sm text-primary mt-1">{p.secteur}</p>
              <p className="text-xs text-text-secondary mt-2">{p.ville}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
