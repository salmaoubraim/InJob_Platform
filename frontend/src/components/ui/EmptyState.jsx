import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="bg-white rounded-2xl p-10 sm:p-12 text-center auth-card border border-gray-100">
      <Inbox className="w-12 h-12 text-text-secondary/30 mx-auto" />
      <p className="font-semibold text-text-dark mt-4">{title}</p>
      {description && (
        <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
