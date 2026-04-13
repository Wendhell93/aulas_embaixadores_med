interface StatCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

export default function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <p className="text-muted text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  );
}
