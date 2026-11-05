import api from '../services/api';

/** Télécharge un fichier API (blob) avec gestion d'erreur JSON. */
export async function downloadApiFile(path, filename) {
  const res = await api.get(path, {
    responseType: 'blob',
    headers: { Accept: 'application/octet-stream, application/pdf, */*' },
  });

  const blob = res.data;
  if (blob?.type?.includes('json')) {
    const text = await blob.text();
    let message = 'Téléchargement impossible.';
    try {
      const json = JSON.parse(text);
      message = json.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'fichier';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
