import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";
import OrderDetailsModal from "../../components/admin/OrderDetailsModal";

const ITEMS_PER_PAGE = 20;

export default function Orders() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: searchTerm || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      setItems(res.data);
    } catch (_err) {
      setError(t("admin.orders.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  const currentOrders = items?.data || [];
  const totalPages = items?.pagination?.totalPages || 1;

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleSaveOrder = async (payload) => {
    try {
      setSaving(true);
      setSaveError("");
      const token = auth.getToken();
      const res = await http.put("/admin/orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data;
      setItems((prev) => ({
        ...prev,
        data: (prev?.data || []).map((order) =>
          order._id === updated._id ? updated : order
        ),
      }));
      setSelectedOrder(null);
    } catch (_err) {
      setSaveError(t("admin.orders.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusLabel = (status) => {
    if (status === "shipped") return t("admin.orders.statusShipped");
    if (status === "completed") return t("admin.orders.statusCompleted");
    return t("admin.orders.statusPending");
  };

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
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.orders.loading")}
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.orders.noOrders")}
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4">
                    {order?._id?.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{order?.customer?.name}</td>
                  <td className="px-6 py-4">
                    {formatDate(order?.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-semibold px-3 py-1 rounded-full inline-block
                        ${
                          order.status === "shipped"
                            ? "bg-[#003B66]"
                            : order.status === "completed"
                            ? "bg-[#1B5E20]"
                            : "bg-[#E53935]"
                        }
                      `}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
      )}

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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setSaveError("");
          }}
          onSave={handleSaveOrder}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
}
