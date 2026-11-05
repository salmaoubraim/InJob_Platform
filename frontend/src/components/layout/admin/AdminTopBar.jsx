import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { ADMIN_NAV } from '../../../config/adminNav';
import AdminNotificationsBell from '../../admin/AdminNotificationsBell';

export default function AdminTopBar() {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = ADMIN_NAV.find((item) => t(item.labelKey).toLowerCase().includes(q));
    if (match) navigate(match.to);
  };

  return (
    <header className="admin-topbar h-16 bg-white border-b border-gray-200 flex items-center justify-end gap-4 px-6 shrink-0">
      <form className="flex-1 max-w-xl relative mr-auto" onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('topbar.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-page border border-gray-200 text-sm text-text-dark placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </form>

      <AdminNotificationsBell />
    </header>
  );
}
