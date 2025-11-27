'use client';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  'in progress': 'bg-blue-100 text-blue-800',
  'work order': 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  quote: 'bg-purple-100 text-purple-800',
};

const SIZES = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-1 text-sm' };

export default function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const color = STATUS_STYLES[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  return <span className={`font-medium rounded-full ${SIZES[size]} ${color}`}>{status}</span>;
}

