import { FileText, DollarSign, Users } from "lucide-react";
import { useI18n } from "../../i18n";

export default function Dashboard() {
  const { t } = useI18n();
  return (
    <div className="bg-white p-6 rounded shadow-md w-full h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border rounded-lg p-5 shadow flex items-center gap-4">
          <FileText className="text-[#00294D] w-6 h-6" />
          <div>
            <div className="text-sm text-[#00294D]">
              {t("admin.dashboard.totalOrders")}
            </div>
            <div className="text-2xl font-bold text-[#00294D]">275</div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow flex items-center gap-4">
          <DollarSign className="text-[#00294D] w-6 h-6" />
          <div>
            <div className="text-sm text-[#00294D]">
              {t("admin.dashboard.totalSales")}
            </div>
            <div className="text-2xl font-bold text-[#00294D]">$19,550</div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow flex items-center gap-4">
          <Users className="text-[#00294D] w-6 h-6" />
          <div>
            <div className="text-sm text-[#00294D]">
              {t("admin.dashboard.totalRenters")}
            </div>
            <div className="text-2xl font-bold text-[#00294D]">--</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-[#00294D] mb-4">
          {t("admin.dashboard.recentOrders")}
        </h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-white font-bold text-left">
            <tr>
              <th className="px-6 py-4">{t("admin.dashboard.orderId")}</th>
              <th className="px-6 py-4">{t("admin.dashboard.customer")}</th>
              <th className="px-6 py-4">{t("admin.dashboard.date")}</th>
              <th className="px-6 py-4">{t("admin.dashboard.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              {
                id: "#10489",
                name: "Maria Gomez",
                dateKey: "admin.dashboard.dateToday",
                status: "shipped",
              },
              {
                id: "#10488",
                name: "John Diaz",
                dateKey: "admin.dashboard.dateYesterday",
                status: "pending",
              },
              {
                id: "#10487",
                name: "Laura Perez",
                dateKey: "admin.dashboard.dateApr21",
                status: "pending",
              },
              {
                id: "#10486",
                name: "Carlos Jimenez",
                dateKey: "admin.dashboard.dateApr20",
                status: "pending",
              },
              {
                id: "#10485",
                name: "Sofia Reyes",
                dateKey: "admin.dashboard.dateApr20",
                status: "pending",
              },
            ].map((order, idx) => (
              <tr key={idx} className="bg-white">
                <td className="px-6 py-4">{order.id}</td>
                <td className="px-6 py-4">{order.name}</td>
                <td className="px-6 py-4">{t(order.dateKey)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-white text-xs font-semibold px-3 py-1 rounded-full inline-block
                ${order.status === "shipped" ? "bg-[#003B66]" : "bg-[#E53935]"}
              `}
                  >
                    {order.status === "shipped"
                      ? t("admin.dashboard.statusShipped")
                      : t("admin.dashboard.statusPending")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
