import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const starSize = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';

  return (
    <div className="flex gap-1" role={readOnly ? 'img' : 'group'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n;
        if (readOnly) {
          return (
            <Star
              key={n}
              className={`${starSize} ${filled ? 'text-amber-500 fill-amber-400' : 'text-gray-300'}`}
            />
          );
        }
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className={`p-1 rounded transition-colors hover:scale-105 ${
              filled ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'
            }`}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <Star className={`${starSize} ${filled ? 'fill-amber-400' : ''}`} />
          </button>
        );
      })}
    </div>
  );
}
