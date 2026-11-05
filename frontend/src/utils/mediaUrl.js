/** Préfixe public de l'API (chemin relatif, même origine que la page). */

export function getApiPublicPrefix() {

  const apiBase = import.meta.env.VITE_API_URL || '/injob-api/api';

  const withoutApi = apiBase.replace(/\/api\/?$/, '');



  if (withoutApi.startsWith('/')) {

    return withoutApi.replace(/\/$/, '') || '/injob-api';

  }



  try {

    const parsed = new URL(withoutApi);

    return parsed.pathname.replace(/\/$/, '') || '/injob-api';

  } catch {

    return '/injob-api';

  }

}



/** Origine absolue Laravel (sans /api) — fallback téléchargements. */

export function getApiOrigin() {

  const prefix = getApiPublicPrefix();

  if (typeof window !== 'undefined') {

    return `${window.location.origin}${prefix}`;

  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost/injob-api/api';

  return apiBase.replace(/\/api\/?$/, '');

}



/** Convertit photo_profil ou photo_url API en chemin affichable par <img>. */

export function toPublicPhotoSrc(pathOrUrl) {

  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;



  const value = pathOrUrl.trim();

  if (!value) return null;

  if (value.startsWith('blob:') || value.startsWith('data:')) return value;



  const prefix = getApiPublicPrefix();



  if (value.startsWith('http://') || value.startsWith('https://')) {

    try {

      const parsed = new URL(value);

      const avatarIdx = parsed.pathname.indexOf('/avatars/');

      if (avatarIdx !== -1) {

        return `${prefix}${parsed.pathname.slice(avatarIdx)}${parsed.search}`;

      }

      if (parsed.pathname.startsWith(prefix)) {

        return `${parsed.pathname}${parsed.search}`;

      }

    } catch {

      return value;

    }

  }



  let path = value;

  if (!path.startsWith('/')) {

    path = `/avatars/${path}`;

  }



  if (path.startsWith('/avatars/')) {

    return `${prefix}${path}`;

  }



  if (path.startsWith(`${prefix}/`)) {

    return path;

  }



  return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;

}



/** URL absolue pour photo ou fichier public Laravel. */

export function resolveStorageUrl(path) {

  const src = toPublicPhotoSrc(path);

  if (!src) return null;

  if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {

    return src;

  }

  if (typeof window !== 'undefined') {

    return `${window.location.origin}${src.startsWith('/') ? src : `/${src}`}`;

  }

  return `${getApiOrigin()}${src.startsWith('/') ? src : `/${src}`}`;

}



/** Photo de profil : chemin relatif prioritaire (même hôte que l'app). */

export function getUserPhotoUrl(user) {

  if (!user) return null;

  return toPublicPhotoSrc(user.photo_profil) || toPublicPhotoSrc(user.photo_url);

}


