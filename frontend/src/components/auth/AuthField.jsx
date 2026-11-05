import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthField({
  label,
  error,
  icon: Icon,
  type = 'text',
  prefix,
  className = '',
  inputClassName = '',
  children,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const fieldBorder = error
    ? 'border-2 border-error focus:border-error focus:ring-2 focus:ring-error/25'
    : inputClassName ||
      'border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-dark">{label}</label>
      )}
      <div className="relative flex">
        {prefix && (
          <div className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-text-secondary shrink-0">
            {prefix}
          </div>
        )}
        <div className={`relative flex-1 ${prefix ? '' : 'w-full'}`}>
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none z-10" />
          )}
          {type === 'select' ? (
            <select
              className={`w-full appearance-none ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 rounded-xl bg-white text-text-dark transition-all duration-200 focus:outline-none ${
                prefix ? 'rounded-l-none' : ''
              } ${fieldBorder}`}
              {...props}
            >
              {children}
            </select>
          ) : (
            <input
              type={inputType}
              className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3 rounded-xl ${
                inputClassName?.includes('bg-white') || !inputClassName ? 'bg-white' : 'bg-bg-page'
              } text-text-dark placeholder:text-text-secondary/50 transition-all duration-200 focus:outline-none ${
                prefix ? 'rounded-l-none rounded-r-xl' : ''
              } ${fieldBorder}`}
              {...props}
            />
          )}
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
