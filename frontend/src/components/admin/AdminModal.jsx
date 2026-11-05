export default function AdminModal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-white rounded-2xl w-full auth-card border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <h3 id="admin-modal-title" className="text-lg font-bold text-text-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-text-secondary hover:bg-bg-page transition-colors"
          >
            Fermer
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
