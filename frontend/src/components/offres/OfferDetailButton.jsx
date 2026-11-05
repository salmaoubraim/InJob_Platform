import { Link } from 'react-router-dom';

export default function OfferDetailButton({ job, basePath = '/offres' }) {
  if (!job?.id_offre) return null;

  return (
    <Link
      to={`${basePath}/${job.id_offre}`}
      state={{ offer: job }}
      className="w-full inline-flex justify-center py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
    >
      Voir détail
    </Link>
  );
}
