import { motion } from 'framer-motion';
import { MapPin, Briefcase, Banknote } from 'lucide-react';
import { SAMPLE_JOB_OFFERS } from '../../data/sampleJobOffers';
import { useAuthModal } from '../../context/AuthModalContext';

export default function JobOffersGrid() {
  const { openRegister } = useAuthModal();
  const offers = SAMPLE_JOB_OFFERS.slice(0, 4);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {offers.map((job, i) => (
        <motion.article
          key={job.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl overflow-hidden auth-card flex flex-col"
        >
          <div className="aspect-[4/3] overflow-hidden bg-primary-soft">
            <img
              src={job.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <span className="text-xs font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-full w-fit">
              {job.type}
            </span>
            <h3 className="font-semibold text-text-dark mt-2 leading-snug">{job.titre}</h3>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              {job.entreprise}
            </p>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {job.ville}
            </p>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              {job.salaire}
            </p>
            <p className="text-xs text-text-secondary mt-3 leading-relaxed flex-1">
              {job.description}
            </p>
            <button
              type="button"
              onClick={() => openRegister('candidat')}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Postuler
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
