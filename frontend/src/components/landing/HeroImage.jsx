import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { publicAsset } from '../../utils/assets';

const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

function buildCandidates() {
  return EXTENSIONS.map((ext) => publicAsset(`images/hero.${ext}`));
}

export default function HeroImage({ className = '' }) {
  const candidates = buildCandidates();
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`rounded-3xl auth-card border-2 border-dashed border-primary/30 bg-primary-soft flex flex-col items-center justify-center text-center p-8 min-h-[280px] sm:min-h-[360px] ${className}`}
      >
        <ImageIcon className="w-12 h-12 text-primary/50 mb-4" />
        <p className="font-semibold text-text-dark">Image introuvable</p>
        <p className="text-sm text-text-secondary mt-2 max-w-xs">
          Fichier attendu :{' '}
          <code className="text-primary text-xs bg-white px-1.5 py-0.5 rounded block mt-1">
            public/images/hero.png
          </code>
        </p>
        <p className="text-xs text-text-secondary mt-2">
          URL : {candidates[0]}
        </p>
      </div>
    );
  }

  return (
    <img
      src={candidates[srcIndex]}
      alt="InJob — Plateforme d'emploi au Maroc"
      onError={handleError}
      className={`w-full h-auto object-contain object-center bg-transparent ${className}`}
      style={{ maxHeight: '480px', minHeight: '280px' }}
    />
  );
}
