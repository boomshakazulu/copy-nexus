export default function DateRangePill({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  isAllTime,
  onToggleAllTime,
  allTimeLabel,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0B2A4A] shadow-sm">
      <button
        type="button"
        onClick={() => onToggleAllTime?.(!isAllTime)}
        className={`rounded-full px-3 py-1 text-xs font-semibold border ${
          isAllTime
            ? "bg-[#0B2A4A] text-white border-[#0B2A4A]"
            : "border-slate-200 text-[#0B2A4A] hover:bg-slate-50"
        }`}
      >
        {allTimeLabel || "All time"}
      </button>
      <input
        type="date"
        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
        value={from || ""}
        onChange={(e) => onChangeFrom?.(e.target.value)}
        disabled={isAllTime}
      />
      <span className="opacity-50">→</span>
      <input
        type="date"
        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
        value={to || ""}
        onChange={(e) => onChangeTo?.(e.target.value)}
        disabled={isAllTime}
      />
    </div>
  );
}
