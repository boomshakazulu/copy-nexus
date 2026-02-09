import { useEffect, useMemo, useState } from "react";
import { FileText, DollarSign, Users } from "lucide-react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";
import { formatCOP } from "../../utils/helpers";
import OrderDetailsModal from "../../components/admin/OrderDetailsModal";

export default function Dashboard() {
  const { t } = useI18n();
  const [data, setData] = useState({
    kpis: { totalSales: 0, orders: 0 },
    recentOrders: [],
    range: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (_err) {
      setError(t("admin.dashboard.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const rangeLabel = useMemo(() => {
    const from = data?.range?.from ? new Date(data.range.from) : null;
    const to = data?.range?.to ? new Date(data.range.to) : null;
    const format = (d) =>
      d
        ? d.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";
    return from && to ? `${format(from)} → ${format(to)}` : "";
  }, [data]);

  const handleSaveOrder = async (payload) => {
    try {
      setSaving(true);
      setSaveError("");
      const token = auth.getToken();
      const res = await http.put("/admin/orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data;
      setData((prev) => ({
        ...prev,
        recentOrders: (prev?.recentOrders || []).map((order) =>
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

  return (
    <div className="bg-white p-6 rounded shadow-md w-full h-full">
      {/* Stats Cards */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.dashboard.dashboard")}
        </h1>
        {rangeLabel && (
          <span className="text-xs font-semibold text-slate-500">
            {rangeLabel}
          </span>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>
      )}

      {loading && (
        <p className="mb-4 text-sm text-gray-500">
          {t("admin.dashboard.loading")}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border rounded-lg p-5 shadow flex items-center gap-4">
          <FileText className="text-[#00294D] w-6 h-6" />
          <div>
            <div className="text-sm text-[#00294D]">
              {t("admin.dashboard.totalOrders")}
            </div>
            <div className="text-2xl font-bold text-[#00294D]">
              {data?.kpis?.orders || 0}
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow flex items-center gap-4">
          <DollarSign className="text-[#00294D] w-6 h-6" />
          <div>
            <div className="text-sm text-[#00294D]">
              {t("admin.dashboard.totalSales")}
            </div>
            <div className="text-2xl font-bold text-[#00294D]">
              {formatCOP(data?.kpis?.totalSales || 0)}
            </div>
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
            {data?.recentOrders?.length ? (
              data.recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4">
                    {order?._id?.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    {order?.customer?.name || "--"}
                  </td>
                  <td className="px-6 py-4">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "--"}
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
                      {order.status === "shipped"
                        ? t("admin.dashboard.statusShipped")
                        : order.status === "completed"
                        ? t("admin.orders.statusCompleted")
                        : t("admin.dashboard.statusPending")}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.dashboard.noRecent")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
