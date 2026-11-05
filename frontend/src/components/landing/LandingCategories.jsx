import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Loader2 } from 'lucide-react';
import { fetchCategories } from '../../services/offreService';
import { useAuth } from '../../context/AuthContext';
import { landingHash } from '../../utils/paths';

export default function LandingCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.slice(0, 8)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const offresLink = isAuthenticated && user?.role === 'candidat'
    ? '/candidat/offres'
    : landingHash('offres');

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-bg-page scroll-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-text-dark text-center flex items-center justify-center gap-2">
          <FolderTree className="w-7 h-7 text-primary" />
          Catégories métiers
        </h2>
        <p className="text-text-secondary text-center mt-2 mb-8">
          Peinture, coiffure, santé, commerce, informatique et plus encore.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id_categorie}
              to={offresLink}
              className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-text-dark border border-gray-100 hover:border-primary/40 hover:shadow-md transition-all text-center"
            >
              {cat.nom_categorie}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
