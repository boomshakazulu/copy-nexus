import { useState } from "react";
import { useI18n } from "../../i18n";

const ordersData = [
  { id: "#10489", name: "Maria Gomez", dateKey: "admin.dashboard.dateToday", status: "shipped" },
  { id: "#10488", name: "John Diaz", dateKey: "admin.dashboard.dateYesterday", status: "pending" },
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
  { id: "#10484", name: "Ana Lopez", dateKey: "admin.dashboard.dateApr19", status: "shipped" },
  {
    id: "#10483",
    name: "Luis Torres",
    dateKey: "admin.dashboard.dateApr18",
    status: "pending",
  },
  {
    id: "#10482",
    name: "Camila Vega",
    dateKey: "admin.dashboard.dateApr17",
    status: "pending",
  },
];

const ITEMS_PER_PAGE = 10;

export default function Orders() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = ordersData.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.orders.title")}
        </h1>
        <input
          type="text"
          placeholder={t("admin.orders.searchPlaceholder")}
          className="border px-4 py-2 rounded text-sm w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
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
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.orders.noOrders")}
                </td>
              </tr>
            ) : (
              currentOrders.map((order, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{order.name}</td>
                  <td className="px-6 py-4">{t(order.dateKey)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-semibold px-3 py-1 rounded-full inline-block
                        ${
                          order.status === "shipped"
                            ? "bg-[#003B66]"
                            : "bg-[#E53935]"
                        }
                      `}
                    >
                      {order.status === "shipped"
                        ? t("admin.dashboard.statusShipped")
                        : t("admin.dashboard.statusPending")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-[#00294D]">
          <button
            onClick={handlePrev}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            {t("admin.orders.previous")}
          </button>
          <span>
            {t("admin.orders.page", {
              current: currentPage,
              total: totalPages,
            })}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            {t("admin.orders.next")}
          </button>
        </div>
      )}
    </div>
  );
}
