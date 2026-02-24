import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";
import OrderDetailsModal from "../../components/admin/OrderDetailsModal";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 20;

export default function Orders() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [items, setItems] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 },
  });
  const [statusTab, setStatusTab] = useState("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const statusMap = {
        open: "pending",
        completed: "completed,shipped",
        canceled: "canceled",
      };
      const res = await http.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: debouncedSearch || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          status: statusMap[statusTab],
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
  }, [currentPage, debouncedSearch, statusTab]);

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

  const handleCreateOrder = async (payload) => {
    try {
      setCreating(true);
      setCreateError("");
      const token = auth.getToken();
      const res = await http.post("/admin/order", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const created = res.data;
      setItems((prev) => ({
        ...prev,
        data: [created, ...(prev?.data || [])],
      }));
      setIsCreateOpen(false);
    } catch (_err) {
      setCreateError(t("admin.orders.createFailed"));
    } finally {
      setCreating(false);
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
    <div className="bg-white p-4 sm:p-6 rounded w-full h-full">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.orders.title")}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00294D] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003B66]"
          >
            <span className="text-lg leading-none">+</span>
            {t("admin.orders.createOrder")}
          </button>
          <input
            type="text"
            placeholder={t("admin.orders.searchPlaceholder")}
            className="border px-4 py-2 rounded text-sm w-full sm:max-w-xs"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "open", label: t("admin.orders.tabOpen") },
          { key: "completed", label: t("admin.orders.tabCompleted") },
          { key: "canceled", label: t("admin.orders.tabCanceled") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatusTab(tab.key);
              setCurrentPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusTab === tab.key
                ? "bg-[#00294D] text-white"
                : "bg-gray-100 text-[#00294D] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              {t("admin.orders.loading")}
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              {t("admin.orders.noOrders")}
            </div>
          ) : (
            currentOrders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left px-4 py-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {t("admin.dashboard.orderId")}
                    </p>
                    <p className="text-sm font-semibold text-[#00294D]">
                      {order?._id?.slice(-6).toUpperCase()}
                    </p>
                  </div>
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
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">
                      {t("admin.dashboard.customer")}:
                    </span>{" "}
                    {order?.customer?.name || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      {t("admin.dashboard.date")}:
                    </span>{" "}
                    {formatDate(order?.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Desktop table */}
        <table className="min-w-full text-sm text-gray-900 hidden md:table">
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

      {isCreateOpen && (
        <OrderDetailsModal
          mode="create"
          order={{
            status: "pending",
            items: [],
            customer: {},
            shippingAddress: {},
            notes: "",
          }}
          onClose={() => {
            setIsCreateOpen(false);
            setCreateError("");
          }}
          onCreate={handleCreateOrder}
          saving={creating}
          error={createError}
        />
      )}
    </div>
  );
}
