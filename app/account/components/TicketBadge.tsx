interface TicketBadgeProps {
  number: number;
}

export default function TicketBadge({
  number,
}: TicketBadgeProps) {
  return (
    <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#ffb800] px-2.5 text-xs font-black text-black shadow-sm">
      #{number}
    </div>
  );
}
