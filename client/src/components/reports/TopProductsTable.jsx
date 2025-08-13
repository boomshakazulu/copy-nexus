import { formatCOP } from "../../utils/helpers";

export default function TopProductsTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="min-w-full text-sm text-gray-900">
        <thead className="bg-white font-bold text-left">
          <tr>
            <th className="px-6 py-4">Top Products</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Sales</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((p, i) => (
            <tr key={i} className="bg-white">
              <td className="px-6 py-4">{p.name}</td>
              <td className="px-6 py-4">{p.cat}</td>
              <td className="px-6 py-4 font-semibold text-[#00294D]">
                {formatCOP(p.sales)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
