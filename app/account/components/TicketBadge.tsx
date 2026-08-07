interface TicketBadgeProps {
  number: number;
}

export default function TicketBadge({
  number,
}: TicketBadgeProps) {
  return (
    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#ffb800] px-3 text-sm font-black text-black shadow-md">
      #{number}
    </div>
  );
}