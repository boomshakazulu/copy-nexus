import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";

const PAGE_SIZE = 50;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function AccessLogs() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    actorEmail: "",
    entityId: "",
    from: "",
    to: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (page, nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/access-logs", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: PAGE_SIZE,
          action: "view_id",
          entityType: "order",
          actorEmail: nextFilters.actorEmail || undefined,
          entityId: nextFilters.entityId || undefined,
          from: nextFilters.from || undefined,
          to: nextFilters.to || undefined,
        },
      });
      setItems(res?.data?.data || []);
      setPagination(res?.data?.pagination || {});
    } catch (_err) {
      setError(t("admin.accessLogs.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePrev = () => {
    const nextPage = Math.max(1, (pagination.page || 1) - 1);
    fetchLogs(nextPage);
  };

  const handleNext = () => {
    const nextPage = Math.min(
      pagination.totalPages || 1,
      (pagination.page || 1) + 1
    );
    fetchLogs(nextPage);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const applyFilters = () => {
    fetchLogs(1, filters);
  };

  const clearFilters = () => {
    const next = { actorEmail: "", entityId: "", from: "", to: "" };
    setFilters(next);
    fetchLogs(1, next);
  };

  const csvRows = useMemo(() => {
    const header = [
      "timestamp",
      "admin_email",
      "order_id",
      "ip",
      "user_agent",
    ];
    const rows = items.map((log) => [
      log.createdAt || "",
      log.actorEmail || "",
      log.entityId || "",
      log.ip || "",
      log.userAgent || "",
    ]);
    return [header, ...rows];
  }, [items]);

  const downloadCsv = () => {
    const lines = csvRows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "access-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.accessLogs.title")}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>{t("admin.accessLogs.note")}</span>
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            {t("admin.accessLogs.download")}
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            {t("admin.accessLogs.filterAdmin")}
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={filters.actorEmail}
            onChange={handleFilterChange("actorEmail")}
            placeholder={t("admin.accessLogs.filterAdminPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            {t("admin.accessLogs.filterOrder")}
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={filters.entityId}
            onChange={handleFilterChange("entityId")}
            placeholder={t("admin.accessLogs.filterOrderPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            {t("admin.accessLogs.filterFrom")}
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={filters.from}
            onChange={handleFilterChange("from")}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            {t("admin.accessLogs.filterTo")}
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={filters.to}
            onChange={handleFilterChange("to")}
          />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-md bg-[#00294D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#003B66]"
        >
          {t("admin.accessLogs.apply")}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          {t("admin.accessLogs.clear")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-white font-bold text-left">
            <tr>
              <th className="px-6 py-4">{t("admin.accessLogs.date")}</th>
              <th className="px-6 py-4">{t("admin.accessLogs.actor")}</th>
              <th className="px-6 py-4">{t("admin.accessLogs.orderId")}</th>
              <th className="px-6 py-4">{t("admin.accessLogs.ip")}</th>
              <th className="px-6 py-4">{t("admin.accessLogs.userAgent")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.accessLogs.loading")}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.accessLogs.empty")}
                </td>
              </tr>
            ) : (
              items.map((log) => (
                <tr
                  key={log._id}
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-6 py-4">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">{log.actorEmail || "—"}</td>
                  <td className="px-6 py-4">
                    {log.entityId ? String(log.entityId).slice(-6).toUpperCase() : "—"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                    {log.ip || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="line-clamp-2 max-w-sm">
                      {log.userAgent || "—"}
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

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-[#00294D]">
          <button
            onClick={handlePrev}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={pagination.page <= 1}
          >
            {t("admin.accessLogs.previous")}
          </button>
          <span>
            {t("admin.accessLogs.page", {
              current: pagination.page,
              total: pagination.totalPages,
            })}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={!pagination.hasNext}
          >
            {t("admin.accessLogs.next")}
          </button>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative mx-auto flex h-full w-full max-w-2xl items-center justify-center p-4">
            <div
              className="w-full rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-[#00294D]">
                  {t("admin.accessLogs.detailsTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t("admin.accessLogs.close")}
                </button>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">{t("admin.accessLogs.date")}:</span>{" "}
                  {formatDateTime(selectedLog.createdAt)}
                </p>
                <p>
                  <span className="font-semibold">{t("admin.accessLogs.actor")}:</span>{" "}
                  {selectedLog.actorEmail || "—"}
                </p>
                <p>
                  <span className="font-semibold">{t("admin.accessLogs.orderId")}:</span>{" "}
                  {selectedLog.entityId || "—"}
                </p>
                <p>
                  <span className="font-semibold">{t("admin.accessLogs.ip")}:</span>{" "}
                  {selectedLog.ip || "—"}
                </p>
                <p>
                  <span className="font-semibold">{t("admin.accessLogs.userAgent")}:</span>{" "}
                  {selectedLog.userAgent || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
