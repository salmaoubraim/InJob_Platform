/** Message lisible pour les erreurs axios / Laravel */
export function getApiErrorMessage(err, fallback) {
  if (!err.response) {
    if (err.message?.includes('API')) return err.message;
    return (
      'Impossible de joindre l\'API Laravel. Démarrez Apache + MySQL, exécutez ' +
      'E:\\inJob\\scripts\\link-injob-api.bat (admin), puis testez : http://localhost/injob-api/api/login'
    );
  }
  if (err.response.status === 404) {
    return 'API introuvable (404). Lancez link-injob-api.bat et redémarrez Apache.';
  }
  const data = err.response.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    const msg = Array.isArray(first) ? first[0] : String(first);
    if (msg.includes('validation.required')) return 'Ce champ est obligatoire.';
    return msg;
  }
  if (data?.message?.includes?.('validation.required')) return 'Ce champ est obligatoire.';
  return data?.message || fallback;
}
