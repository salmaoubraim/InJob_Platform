import { Loader2 } from 'lucide-react';

export default function SubmitButton({
  children,
  loading,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'btn-primary-solid hover:-translate-y-px',
    accent:
      'bg-accent text-text-dark hover:opacity-90 shadow-md shadow-accent/25',
    light:
      'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/25',
  };

  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  );
}
