import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../services/adminSettingsService';

const DEFAULTS = {
  site_name: 'InJob',
  default_language: 'fr',
  dark_mode: false,
  notify_inscriptions: true,
  notify_offres: true,
  notify_candidatures: true,
  notify_support: true,
  notify_avis: true,
  notify_security: true,
  maintenance_mode: false,
  session_timeout_minutes: null,
};

const AdminSettingsContext = createContext(null);

export function AdminSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSettings();
      setSettings({ ...DEFAULTS, ...data, default_language: 'fr' });
    } catch {
      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (patch) => {
    const data = await updateAdminSettings({ ...patch, default_language: 'fr' });
    setSettings({ ...DEFAULTS, ...data, default_language: 'fr' });
    return data;
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      darkMode: settings.dark_mode,
      language: 'fr',
      refresh: load,
      save,
      setDarkMode: async (enabled) => save({ dark_mode: enabled }),
    }),
    [settings, loading, load, save]
  );

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    throw new Error('useAdminSettings must be used within AdminSettingsProvider');
  }
  return ctx;
}
