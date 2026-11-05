/** Chemin public correct (ex: /injob/images/hero.png sous XAMPP) */
export function publicAsset(path) {
  const base = import.meta.env.BASE_URL || '/';
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
