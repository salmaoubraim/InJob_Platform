export default function AuthDivider({ text = 'ou continuer avec' }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-4 bg-white text-sm text-text-secondary">──── {text} ────</span>
      </div>
    </div>
  );
}
