export function EmptyState({
  icon,
  message,
  subMessage,
}: {
  icon?: React.ReactNode;
  message: string;
  subMessage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {icon && <div className="mb-5 text-[#7A756B]/50">{icon}</div>}
      <p className="text-[#7A756B] text-base font-medium tracking-wide">{message}</p>
      {subMessage && (
        <p className="text-[#7A756B]/60 text-sm mt-2 tracking-wide">{subMessage}</p>
      )}
    </div>
  );
}
