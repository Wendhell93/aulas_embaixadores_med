import { SLOT_STATUS_LABELS, SLOT_STATUS_COLORS, type SlotStatus } from '@/types/database';

interface StatusBadgeProps {
  status: SlotStatus | string;
  size?: 'xs' | 'sm';
}

export default function StatusBadge({ status, size = 'xs' }: StatusBadgeProps) {
  const label = SLOT_STATUS_LABELS[status as SlotStatus] || status;
  const color = SLOT_STATUS_COLORS[status as SlotStatus] || 'bg-muted/20 text-muted';
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-block rounded-full font-semibold ${sizeClass} ${color}`}>
      {label}
    </span>
  );
}
