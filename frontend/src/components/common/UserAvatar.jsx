import { useEffect, useMemo, useState } from 'react';
import { getUserPhotoUrl, toPublicPhotoSrc } from '../../utils/mediaUrl';
import { getUserInitials } from '../../utils/profileMenu';

const SIZE = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-24 h-24 text-2xl',
};

export default function UserAvatar({ user, photoOverride, size = 'sm', className = '' }) {
  const photoUrl = useMemo(() => {
    if (photoOverride) return toPublicPhotoSrc(photoOverride);
    return getUserPhotoUrl(user);
  }, [user, photoOverride]);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const sizeClass = SIZE[size] || SIZE.sm;
  const showPhoto = photoUrl && !failed;

  return (
    <div
      className={`rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${sizeClass} ${className}`}
    >
      {showPhoto ? (
        <img
          src={photoUrl}
          alt=""
          className="w-full h-full object-cover block"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        getUserInitials(user)
      )}
    </div>
  );
}
