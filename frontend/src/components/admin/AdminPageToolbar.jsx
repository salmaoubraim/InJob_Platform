import { Search, SlidersHorizontal } from 'lucide-react';

const INPUT_CLASS =
  'h-11 w-full pl-10 pr-4 rounded-xl border border-gray-200 text-sm bg-white text-text-dark placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const BTN_CLASS =
  'h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-sm font-semibold shrink-0 transition-colors';

export default function AdminPageToolbar({
  value,
  onChange,
  placeholder = 'Rechercher…',
  filter,
  onFilterChange,
  filterOptions = [],
  actionLabel,
  onAction,
  children,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-5 ${className}`}>
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={INPUT_CLASS}
          />
        </div>
        {filterOptions.length > 0 && onFilterChange && (
          <div className="relative shrink-0">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className={`${INPUT_CLASS} pl-10 pr-8 min-w-[140px] w-auto appearance-none cursor-pointer`}
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`${BTN_CLASS} bg-primary text-white hover:bg-primary-dark shadow-sm`}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export { INPUT_CLASS, BTN_CLASS };
