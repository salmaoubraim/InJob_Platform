import GoogleIcon from '../common/GoogleIcon';

export default function GoogleAuthButton({
  label = 'Se connecter avec Google',
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border-[1.5px] border-[#E5E7EB] bg-white text-text-dark font-medium text-sm transition-all duration-200 hover:bg-[#F9FAFB] hover:shadow-md hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <GoogleIcon className="w-5 h-5" />
      {label}
    </button>
  );
}
