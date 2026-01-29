export default function DateRangePill({ from, to }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#00294D]">
      <span>{from}</span>
      <span className="opacity-50">-&gt;</span>
      <span>{to}</span>
    </div>
  );
}
