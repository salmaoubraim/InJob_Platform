import { Briefcase } from 'lucide-react';

export default function InJobLogo({ size = 'md', centered = false }) {
  const sizes = {
    sm: { box: 'w-9 h-9', icon: 'w-4 h-4', text: 'text-lg' },
    md: { box: 'w-11 h-11', icon: 'w-5 h-5', text: 'text-xl' },
    lg: { box: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`flex items-center gap-2.5 ${centered ? 'justify-center' : ''}`}
    >
      <div
        className={`${s.box} bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/25 shrink-0`}
      >
        <Briefcase className={`${s.icon} text-white`} />
      </div>
      <span className={`${s.text} font-bold text-text-dark tracking-tight`}>InJob</span>
    </div>
  );
}
