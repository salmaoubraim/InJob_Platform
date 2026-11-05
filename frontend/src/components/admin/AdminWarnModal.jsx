import { Loader2 } from 'lucide-react';
import AdminModal from './AdminModal';

export default function AdminWarnModal({ open, onClose, userName, message, onChange, onSubmit, sending }) {
  return (
    <AdminModal open={open} onClose={onClose} title="Envoyer un avertissement">
      <p className="text-sm text-text-secondary mb-4">
        Avertissement pour <strong className="text-text-dark">{userName}</strong>. Le message sera notifié à l&apos;utilisateur.
      </p>
      <textarea
        value={message}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Décrivez le motif de l'avertissement…"
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-sm">
          Annuler
        </button>
        <button
          type="button"
          disabled={sending || !message.trim()}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Envoyer
        </button>
      </div>
    </AdminModal>
  );
}
