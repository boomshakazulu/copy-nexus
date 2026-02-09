import { useEffect, useState } from "react";
import { DollarSign, FileText, Tag } from "lucide-react";
import { formatCOP } from "../../utils/helpers";

const toneMap = {
  yellow: "bg-[#FEEFC3]",
  red: "bg-[#FFE3E3]",
  amber: "bg-[#FFF6D9]",
};

const iconMap = {
  sales: DollarSign,
  orders: FileText,
  aov: Tag,
};

export default function KpiCard({
  label,
  value,
  tone = "yellow",
  isMoney,
  kind = "sales",
}) {
  const Icon = iconMap[kind] || Tag;

  // --- Decide when to use short notation (K / MM) ---
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)"); // tailwind 'sm'
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Count integer digits (no separators) to detect very large amounts
  const intDigits =
    typeof value === "number"
      ? String(Math.floor(Math.abs(value))).length
      : String(value ?? "").replace(/\D/g, "").length;

  // Use short on narrow screens OR if 8+ digits (>= 10.000.000)
  const useShortMoney = isNarrow || intDigits >= 8;

  const display = isMoney
    ? formatCOP(value, useShortMoney) // full on desktop until it's huge; short on mobile/huge
    : (value ?? "").toLocaleString?.("es-CO") ?? value;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`rounded-xl ${toneMap[tone]} p-2.5 text-[#00294D]`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </div>

        {/* Responsive size + prevent wrap */}
        <div
          className="font-extrabold text-[#0B2A4A] leading-tight whitespace-nowrap
                     text-[clamp(1.1rem,2.8vw,1.6rem)]"
          title={isMoney ? formatCOP(value, false) : display}
        >
          {display}
        </div>
      </div>
    </div>
  );
}
