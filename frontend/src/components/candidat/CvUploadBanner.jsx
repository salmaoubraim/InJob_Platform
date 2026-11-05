import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUser, Upload, Download, Loader2, CheckCircle } from 'lucide-react';
import { deleteCv, fetchMyCv, uploadCv } from '../../services/cvService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../ui/Card';

/** Bandeau CV sur la page offres : upload + téléchargement avant de postuler. */
export default function CvUploadBanner() {
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
      toast.success('CV enregistré — vous pouvez postuler aux offres.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (cv) => {
    try {
      const res = await api.get(`/cv/${cv.id_cv}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.nom_fichier;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Téléchargement impossible.');
    }
  };

  const cv = cvs[0];

  return (
    <Card
      title="Mon CV — obligatoire pour postuler"
      className={cv ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/40'}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleUpload}
      />
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      ) : cv ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-text-dark">{cv.nom_fichier}</p>
              <p className="text-sm text-text-secondary mt-1">
                CV actif — envoyé au recruteur lors de chaque candidature.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownload(cv)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-bg-page"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark cursor-pointer ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Remplacer
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                disabled={uploading}
                onClick={(e) => {
                  e.currentTarget.value = '';
                }}
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="text-center sm:text-left">
          <p className="text-sm text-text-secondary mb-4">
            Selon le cahier des charges, vous devez téléverser votre CV (PDF, DOC, DOCX) avant de
            postuler. Le recruteur pourra le télécharger depuis votre candidature.
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Téléverser mon CV
          </button>
          <Link
            to="/candidat/cv"
            className="block sm:inline-block sm:ml-4 mt-3 text-sm text-primary font-medium hover:underline"
          >
            Page Mon CV →
          </Link>
        </div>
      )}
    </Card>
  );
}
