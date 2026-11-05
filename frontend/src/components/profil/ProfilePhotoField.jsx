import { useRef } from 'react';
import { Camera } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

export default function ProfilePhotoField({
  user,
  photoPreview,
  onPhotoChange,
  removePhoto,
  onRemovePhotoChange,
  showRemoveOption = false,
  helperText = 'JPG, PNG ou WebP — 2 Mo max.',
}) {
  const fileRef = useRef(null);

  return (
    <div>
      <label className="block text-sm font-medium text-text-dark mb-3">Photo de profil</label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative shrink-0">
          <UserAvatar user={user} photoOverride={photoPreview} size="lg" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
            aria-label="Changer la photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-bg-page file:text-text-dark file:font-medium hover:file:bg-primary-soft"
            onChange={onPhotoChange}
          />
          <p className="text-xs text-text-secondary">{helperText}</p>
          {showRemoveOption && (
            <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={removePhoto}
                onChange={(e) => onRemovePhotoChange?.(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary/30"
              />
              Retirer la photo
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
