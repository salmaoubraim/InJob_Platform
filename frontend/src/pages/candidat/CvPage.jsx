import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Download, Loader2 } from 'lucide-react';
import { deleteCv, fetchMyCv, uploadCv } from '../../services/cvService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { downloadApiFile } from '../../utils/downloadFile';
import PageShell from '../../components/ui/PageShell';
import Card from '../../components/ui/Card';

export default function CvPage() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setCvs(await fetchMyCv());
    } catch {
      setCvs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadCv(file);
      toast.success('CV téléversé avec succès.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce CV ?')) return;
    try {
      await deleteCv(id);
      toast.success('CV supprimé.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDownload = async (cv) => {
    try {
      await downloadApiFile(`/cv/${cv.id_cv}/download`, cv.nom_fichier);
    } catch (err) {
      toast.error(err.message || 'Téléchargement impossible.');
    }
  };

  const cv = cvs[0];

  return (
    <PageShell
      title="Mon CV"
      subtitle="Téléversez votre CV (PDF, DOC, DOCX — max 5 Mo). Les recruteurs le consultent lors de vos candidatures."
    >
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : cv ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-text-dark">{cv.nom_fichier}</p>
              <p className="text-sm text-text-secondary mt-1">CV actif sur votre profil</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload(cv)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-bg-page"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cv.id_cv)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-error text-sm font-medium hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <p className="text-text-secondary text-center py-6">Aucun CV — téléversez le vôtre ci-dessous.</p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          {cv ? 'Remplacer le CV' : 'Téléverser mon CV'}
        </button>
      </Card>
    </PageShell>
  );
}
