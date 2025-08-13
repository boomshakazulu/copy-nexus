import { useEffect, useState } from "react";
import { DollarSign, FileText, Tag } from "lucide-react";
import { formatCOP } from "../../utils/helpers";

const toneMap = {
  yellow: "bg-[#FEEFC3]",
  red: "bg-[#FFE3E3]",
  amber: "bg-[#FFF6D9]",
};

export default function KpiCard({ label, value, tone = "yellow", isMoney }) {
  const Icon =
    label === "Total Sales" ? DollarSign : label === "Orders" ? FileText : Tag;

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
    <div className="bg-white border rounded-lg p-5 flex items-center gap-4">
      <div className={`rounded-lg ${toneMap[tone]} p-2.5 text-[#00294D]`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0">
        <div className="text-sm text-[#00294D]">{label}</div>

        {/* Responsive size + prevent wrap */}
        <div
          className="font-extrabold text-[#00294D] leading-tight whitespace-nowrap
                     text-[clamp(1rem,2.8vw,1.5rem)]"
          title={isMoney ? formatCOP(value, false) : display}
        >
          {display}
        </div>
      </div>
    </div>
  );
}
