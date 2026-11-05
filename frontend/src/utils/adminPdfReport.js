import { jsPDF } from 'jspdf';

export function generateAdminDashboardPdf(stats, locale = 'fr') {
  const doc = new jsPDF();
  const cards = stats?.cards || {};
  const date = new Date().toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR');

  doc.setFontSize(18);
  doc.text('InJob — Rapport administrateur', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le ${date}`, 14, 28);

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Indicateurs clés', 14, 40);

  const rows = [
    ['Utilisateurs', cards.utilisateurs ?? 0],
    ['Candidats', cards.candidats ?? 0],
    ['Recruteurs', cards.recruteurs ?? 0],
    ['Offres actives', cards.offres_actives ?? 0],
    ['Offres expirées', cards.offres_expirees ?? 0],
    ['Candidatures', cards.candidatures ?? 0],
    ['Messages', cards.messages ?? 0],
    ['Avis', cards.avis ?? 0],
    ['Note moyenne', cards.note_moyenne != null ? `${cards.note_moyenne} / 5` : '—'],
  ];

  let y = 50;
  rows.forEach(([label, value]) => {
    doc.text(`${label} : ${value}`, 18, y);
    y += 8;
  });

  const system = stats?.system || {};
  y += 6;
  doc.setFontSize(12);
  doc.text('État système', 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Base de données : ${system.database_connected ? 'Connectée' : 'Déconnectée'}`, 18, y);
  y += 7;
  doc.text(`Temps de réponse : ${system.response_time_ms != null ? `${system.response_time_ms} ms` : '—'}`, 18, y);
  y += 7;
  doc.text(`Sessions actives : ${system.active_sessions ?? '—'}`, 18, y);

  doc.save(`injob-rapport-${new Date().toISOString().slice(0, 10)}.pdf`);
}
