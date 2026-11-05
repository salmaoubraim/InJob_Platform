import { getPasswordStrength } from '../../utils/validation';

export default function PasswordStrength({ password }) {
  const { level, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${level}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-text-secondary">
          Force : <span className="font-medium text-text-dark">{label}</span>
        </p>
      )}
    </div>
  );
}
