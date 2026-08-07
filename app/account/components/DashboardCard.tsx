interface DashboardCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="rounded-[28px] border border-white/5 bg-zinc-950 p-6 transition-all duration-300 hover:border-[#ffb800]/30">
      <div className="text-[11px] uppercase tracking-[2px] text-zinc-500 font-bold">
        {title}
      </div>

      <div className="mt-4 text-5xl font-black text-[#ffb800]">
        {value}
      </div>

      {subtitle && (
        <div className="mt-3 text-sm text-zinc-500">
          {subtitle}
        </div>
      )}
    </div>
  );
}