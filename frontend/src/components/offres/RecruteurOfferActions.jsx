import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteOffre } from '../../services/offreService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function RecruteurOfferActions({ job, onEdit, onChanged }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer l'offre « ${job.titre} » ?`)) return;
    setLoading(true);
    try {
      await deleteOffre(job.id_offre);
      toast.success('Offre supprimée.');
      onChanged?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        type="button"
        onClick={() => onEdit?.(job)}
        className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 text-xs font-medium hover:bg-bg-page"
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifier
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-error text-xs font-medium hover:bg-red-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
