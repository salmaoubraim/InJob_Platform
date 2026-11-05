import { Search, SlidersHorizontal } from 'lucide-react';
import { INPUT_CLASS } from './AdminPageToolbar';

/**
 * Barre de recherche admin (style pill blanc, aligné sur la page Utilisateurs).
 */
function FilterSelect({ value, onChange, options, icon: Icon = SlidersHorizontal, className = '' }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} pl-10 pr-8 w-full appearance-none cursor-pointer`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Rechercher…',
  filter,
  onFilterChange,
  filterOptions = [],
  filterIcon: FilterIcon = SlidersHorizontal,
  secondaryFilter,
  secondaryFilterOptions = [],
  onSecondaryFilterChange,
  tertiaryFilter,
  tertiaryFilterOptions = [],
  onTertiaryFilterChange,
  layout = 'inline',
  trailing = null,
  className = '',
}) {
  const filterCount = [
    filterOptions.length > 0 && onFilterChange,
    secondaryFilterOptions.length > 0 && onSecondaryFilterChange,
    tertiaryFilterOptions.length > 0 && onTertiaryFilterChange,
  ].filter(Boolean).length;

  const useGrid = layout === 'grid' || (layout === 'inline' && filterCount >= 3);
  const useToolbar = layout === 'toolbar';

  const searchField = (
    <div className={`relative min-w-0 ${useToolbar ? 'flex-[2] min-w-[280px]' : ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );

  const fields = (
    <>
      {searchField}
      {filterOptions.length > 0 && onFilterChange && (
        <FilterSelect value={filter} onChange={onFilterChange} options={filterOptions} icon={FilterIcon} />
      )}
      {secondaryFilterOptions.length > 0 && onSecondaryFilterChange && (
        <FilterSelect value={secondaryFilter} onChange={onSecondaryFilterChange} options={secondaryFilterOptions} />
      )}
      {tertiaryFilterOptions.length > 0 && onTertiaryFilterChange && (
        <FilterSelect value={tertiaryFilter} onChange={onTertiaryFilterChange} options={tertiaryFilterOptions} />
      )}
    </>
  );

  const rowClass = useToolbar
    ? 'flex flex-col lg:flex-row lg:items-center gap-3'
    : useGrid
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-center'
      : 'flex flex-col sm:flex-row sm:items-center gap-3';

  return (
    <div className={`mb-5 ${className}`}>
      <div className={rowClass}>
        {useToolbar ? (
          <>
            {searchField}
            {filterOptions.length > 0 && onFilterChange && (
              <FilterSelect value={filter} onChange={onFilterChange} options={filterOptions} icon={FilterIcon} className="lg:w-[170px] shrink-0" />
            )}
            {secondaryFilterOptions.length > 0 && onSecondaryFilterChange && (
              <FilterSelect value={secondaryFilter} onChange={onSecondaryFilterChange} options={secondaryFilterOptions} className="lg:w-[170px] shrink-0" />
            )}
            {tertiaryFilterOptions.length > 0 && onTertiaryFilterChange && (
              <FilterSelect value={tertiaryFilter} onChange={onTertiaryFilterChange} options={tertiaryFilterOptions} className="lg:w-[170px] shrink-0" />
            )}
            {trailing}
          </>
        ) : useGrid ? fields : (
          <div className="flex flex-1 items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
            {fields}
          </div>
        )}
        {!useToolbar && trailing}
      </div>
    </div>
  );
}
