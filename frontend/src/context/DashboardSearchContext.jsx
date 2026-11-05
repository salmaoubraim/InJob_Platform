import { createContext, useContext, useState } from 'react';

const DashboardSearchContext = createContext(null);

export function DashboardSearchProvider({ children, placeholder = 'Rechercher une offre...' }) {
  const [query, setQuery] = useState('');

  return (
    <DashboardSearchContext.Provider value={{ query, setQuery, placeholder }}>
      {children}
    </DashboardSearchContext.Provider>
  );
}

export function useDashboardSearch() {
  const ctx = useContext(DashboardSearchContext);
  if (!ctx) {
    return {
      query: '',
      setQuery: () => {},
      placeholder: 'Rechercher une offre...',
      enabled: false,
    };
  }
  return { ...ctx, enabled: true };
}
