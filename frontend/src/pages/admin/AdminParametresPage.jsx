import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Info,
  Loader2,
  Monitor,
  Save,
  Shield,
  User,
} from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminProfilForm from '../../components/profil/AdminProfilForm';
import PasswordChangePanel from '../../components/profil/PasswordChangePanel';
import { useAdminSettings } from '../../context/AdminSettingsContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiErrors';

const TAB_IDS = ['general', 'security', 'notifications', 'profil'];

export default function AdminParametresPage() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const { settings, loading, save, setDarkMode } = useAdminSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab = urlTab === 'appearance' || !TAB_IDS.includes(urlTab) ? 'general' : urlTab;
  const [tab, setTab] = useState(initialTab);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'appearance') {
      setTab('general');
      setSearchParams({}, { replace: true });
      return;
    }
    if (currentTab && TAB_IDS.includes(currentTab) && currentTab !== tab) {
      setTab(currentTab);
    }
  }, [searchParams, tab, setSearchParams]);

  useEffect(() => {
    if (settings) setDraft({ ...settings });
  }, [settings]);

  const selectTab = (id) => {
    setTab(id);
    setSearchParams(id === 'general' ? {} : { tab: id }, { replace: true });
  };

  const TABS = [
    { id: 'general', label: t('settings.tabs.general'), icon: Info },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'profil', label: t('settings.tabs.profile'), icon: User },
  ];

  const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save({
        site_name: draft.site_name,
        default_language: 'fr',
        dark_mode: draft.dark_mode,
        notify_inscriptions: draft.notify_inscriptions,
        notify_offres: draft.notify_offres,
        notify_candidatures: draft.notify_candidatures,
        notify_avis: draft.notify_avis,
        notify_security: draft.notify_security,
        maintenance_mode: draft.maintenance_mode,
        session_timeout_minutes: draft.session_timeout_minutes,
      });
      toast.success(t('common.saveSuccess'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminPageShell title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        <nav className="admin-settings-nav bg-white rounded-2xl border border-gray-100 auth-card p-2 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`settings-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                tab === id ? 'settings-tab-active' : 'settings-tab-idle'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {tab === 'general' && (
            <div className="space-y-4">
              <SettingCard icon={Info} title={t('settings.general.siteInfo')}>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {t('settings.general.siteName')}
                  </span>
                  <input
                    value={draft.site_name}
                    onChange={(e) => patch('site_name', e.target.value)}
                    className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm"
                  />
                </label>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {t('settings.general.version')}
                  </p>
                  <p className="text-lg font-semibold text-text-dark mt-1">v1.0.0</p>
                </div>
                <div>
                  <ToggleRow
                    label={t('settings.general.darkMode')}
                    checked={draft.dark_mode}
                    onChange={async (v) => {
                      patch('dark_mode', v);
                      await setDarkMode(v);
                    }}
                  />
                  <p className="text-sm text-text-secondary mt-1">{t('settings.general.darkModeHint')}</p>
                </div>
              </SettingCard>
              <SettingCard icon={Monitor} title={t('settings.general.maintenance')}>
                <p className="text-sm text-text-secondary">{t('settings.general.maintenanceHint')}</p>
                <ToggleSwitch
                  checked={draft.maintenance_mode}
                  onChange={(v) => patch('maintenance_mode', v)}
                  label={draft.maintenance_mode ? t('common.enabled') : t('common.disabled')}
                />
              </SettingCard>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <SettingCard icon={Shield} title={t('settings.security.title')}>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>{t('settings.security.sanctum')}</li>
                  <li>{t('settings.security.bcrypt')}</li>
                  <li>{t('settings.security.adminOnly')}</li>
                </ul>
                <label className="block mt-4">
                  <span className="text-sm font-medium text-text-dark">
                    {t('settings.security.sessionTimeout')}
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={draft.session_timeout_minutes ?? ''}
                    onChange={(e) => patch('session_timeout_minutes', e.target.value ? Number(e.target.value) : null)}
                    placeholder="—"
                    className="mt-2 w-full max-w-xs rounded-xl border px-3 py-2.5 text-sm"
                  />
                </label>
              </SettingCard>
              <PasswordChangePanel title={t('settings.security.passwordTitle')} />
            </div>
          )}

          {tab === 'notifications' && (
            <SettingCard icon={Bell} title={t('settings.notifications.title')}>
              <ToggleRow label={t('settings.notifications.inscriptions')} checked={draft.notify_inscriptions} onChange={(v) => patch('notify_inscriptions', v)} />
              <ToggleRow label={t('settings.notifications.offres')} checked={draft.notify_offres} onChange={(v) => patch('notify_offres', v)} />
              <ToggleRow label={t('settings.notifications.candidatures')} checked={draft.notify_candidatures} onChange={(v) => patch('notify_candidatures', v)} />
              <ToggleRow label={t('settings.notifications.avis')} checked={draft.notify_avis} onChange={(v) => patch('notify_avis', v)} />
              <ToggleRow label={t('settings.notifications.security')} checked={draft.notify_security} onChange={(v) => patch('notify_security', v)} />
            </SettingCard>
          )}

          {tab === 'profil' && <AdminProfilForm />}

          {tab !== 'profil' && tab !== 'security' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('common.save')}
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('common.save')}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}

function SettingCard({ icon: Icon, title, children }) {
  return (
    <div className="admin-settings-card bg-white rounded-2xl p-6 border border-gray-100 auth-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-text-dark text-sm tracking-wide">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`mt-3 relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-text-dark">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
