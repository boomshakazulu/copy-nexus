import { formatCOP } from "../../utils/helpers";

import { useI18n } from "../../i18n";

export default function TopProductsTable({ rows = [] }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm text-gray-900">
        <thead className="bg-slate-50 font-bold text-left text-slate-600">
          <tr>
            <th className="px-6 py-4">{t("admin.reports.topProducts")}</th>
            <th className="px-6 py-4">{t("admin.reports.category")}</th>
            <th className="px-6 py-4 text-right">{t("admin.reports.sales")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((p, i) => (
            <tr key={i} className="bg-white">
              <td className="px-6 py-4">{p.name}</td>
              <td className="px-6 py-4">{p.cat}</td>
              <td className="px-6 py-4 text-right font-semibold text-[#00294D]">
                {formatCOP(p.sales)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
