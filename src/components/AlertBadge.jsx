import { cn } from '@/lib/utils';

const severityConfig = {
  'Thấp': { bg: 'bg-blue-400/10 border-blue-400/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Trung bình': { bg: 'bg-amber-400/10 border-amber-400/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Cao': { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  'Khẩn cấp': { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function AlertBadge({ severity }) {
  const cfg = severityConfig[severity] || severityConfig['Thấp'];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {severity}
    </span>
  );
}