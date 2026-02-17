import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";

const formatMoney = (value, currency = "COP") => {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function RentalPaymentsPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchPayments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/rental-payments", {
        headers: { Authorization: `Bearer ${token}` },
        params: { rentalId: id },
      });
      setPayments(res?.data?.data || []);
    } catch (_err) {
      setError(t("admin.rentals.paymentsLoadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [id]);

  const totalPaid = useMemo(
    () =>
      (payments || []).reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
      ),
    [payments]
  );

  const handleSavePayment = async () => {
    if (!selected?._id) return;
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");
      const token = auth.getToken();
      const res = await http.put(
        "/admin/rental-payment",
        { ...selected, id: selected._id },
        {
        headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updated = res?.data;
      if (updated?._id) {
        setPayments((prev) =>
          (prev || []).map((p) => (p._id === updated._id ? updated : p))
        );
        setSelected(updated);
        setSaveSuccess(t("admin.rentals.paymentUpdated"));
      }
    } catch (_err) {
      setSaveError(t("admin.rentals.paymentFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!selected?._id) return;
    if (!window.confirm(t("admin.rentals.paymentDeleteConfirm"))) {
      return;
    }
    try {
      setSaving(true);
      setDeleteError("");
      const token = auth.getToken();
      await http.delete("/admin/rental-payment", {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: selected._id },
      });
      setPayments((prev) => (prev || []).filter((p) => p._id !== selected._id));
      setSelected(null);
    } catch (_err) {
      setDeleteError(t("admin.rentals.paymentDeleteFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.rentals.paymentHistory")}
        </h1>
        <button
          type="button"
          onClick={fetchPayments}
          className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          {t("admin.rentals.refresh")}
        </button>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        {t("admin.rentals.paymentTotal")}:{" "}
        <span className="font-semibold text-[#00294D]">
          {formatMoney(totalPaid)}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">{t("admin.rentals.paymentsLoading")}</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !payments.length ? (
        <p className="text-sm text-gray-500">{t("admin.rentals.paymentsEmpty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <button
              type="button"
              key={payment._id}
              onClick={() =>
                setSelected({
                  ...payment,
                  items: Array.isArray(payment.items) ? payment.items : [],
                })
              }
              className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md"
            >
              <div className="text-xs text-gray-500">
                {formatDateTime(payment.paidAt)}
              </div>
              <div className="mt-2 text-lg font-semibold text-[#00294D]">
                {formatMoney(payment.amount)}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {payment._id?.slice(-6)?.toUpperCase()}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative mx-auto flex h-full w-full max-w-3xl items-center justify-center p-4">
            <div
              className="max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-[#00294D]">
                  {t("admin.rentals.paymentDetails")}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t("admin.rentals.close")}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {formatDateTime(selected.paidAt)}
              </p>

              <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.rentals.paymentAmount")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={Number(selected.amount) || 0}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.orders.discountLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={Number(selected.discount) || 0}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, discount: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {t("admin.rentals.calculatedTotal")}:{" "}
                <span className="font-semibold text-[#00294D]">
                  {formatMoney(
                    (selected.items || []).reduce((sum, item) => {
                      const base =
                        (Number(item.monthlyPrice) || 0) *
                        (Number(item.qty) || 1);
                      const usage =
                        (Number(item.copies) || 0) *
                          (Number(item.ratePerPrint) || 0) +
                        (Number(item.scans) || 0) *
                          (Number(item.ratePerScan) || 0);
                      return sum + base + usage;
                    }, 0) - (Number(selected.discount) || 0)
                  )}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      amount:
                        (prev.items || []).reduce((sum, item) => {
                          const base =
                            (Number(item.monthlyPrice) || 0) *
                            (Number(item.qty) || 1);
                          const usage =
                            (Number(item.copies) || 0) *
                              (Number(item.ratePerPrint) || 0) +
                            (Number(item.scans) || 0) *
                              (Number(item.ratePerScan) || 0);
                          return sum + base + usage;
                        }, 0) - (Number(prev.discount) || 0),
                    }))
                  }
                  className="ml-2 text-xs font-semibold text-[#00294D] underline"
                >
                  {t("admin.rentals.useCalculated")}
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                {t("admin.rentals.paymentMonthly")}:{" "}
                <span className="font-semibold text-[#00294D]">
                  {formatMoney(selected.monthlyBase || 0)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(selected.items || []).map((item, index) => {
                  const perPrint = Number(item.ratePerPrint) || 0;
                  const perScan = Number(item.ratePerScan) || 0;
                  const monthlyBase = (Number(item.monthlyPrice) || 0) * (Number(item.qty) || 1);
                  const copies = Number(item.copies) || 0;
                  const scans = Number(item.scans) || 0;
                  const usageTotal = copies * perPrint + scans * perScan;
                  const lineTotal = monthlyBase + usageTotal;
                  return (
                    <div key={`${item.orderItemIndex}-${index}`} className="rounded-md border border-gray-200 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-[#00294D]">
                          {item.name || t("admin.rentals.itemIndex", { index: item.orderItemIndex })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.model || ""}
                        </div>
                      </div>
                      <div className="mt-2 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.rentals.baseMonthly")}
                          </label>
                          <div className="mt-1 text-sm font-semibold text-[#00294D]">
                            {formatMoney(monthlyBase)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.orders.rentCostPerPrint")}
                          </label>
                          <div className="mt-1 text-sm font-semibold text-[#00294D]">
                            {formatMoney(perPrint)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.orders.rentCostPerScan")}
                          </label>
                          <div className="mt-1 text-sm font-semibold text-[#00294D]">
                            {formatMoney(perScan)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.rentals.usageTotal")}
                          </label>
                          <div className="mt-1 text-sm font-semibold text-[#00294D]">
                            {formatMoney(usageTotal)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.rentals.lineTotal")}
                          </label>
                          <div className="mt-1 text-sm font-semibold text-[#00294D]">
                            {formatMoney(lineTotal)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.rentals.paymentCopies")}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            value={Number(item.copies) || 0}
                            onChange={(e) =>
                            setSelected((prev) => ({
                              ...prev,
                              items: (prev.items || []).map((p, i) =>
                                i === index ? { ...p, copies: e.target.value } : p
                              ),
                            }))
                          }
                        />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.rentals.paymentScans")}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                            value={Number(item.scans) || 0}
                            onChange={(e) =>
                            setSelected((prev) => ({
                              ...prev,
                              items: (prev.items || []).map((p, i) =>
                                i === index ? { ...p, scans: e.target.value } : p
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {saveError && (
                <p className="mt-3 text-sm font-semibold text-red-600">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="mt-3 text-sm font-semibold text-green-700">{saveSuccess}</p>
              )}
              {deleteError && (
                <p className="mt-3 text-sm font-semibold text-red-600">{deleteError}</p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t("admin.rentals.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDeletePayment}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  {t("admin.rentals.paymentDelete")}
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  disabled={saving}
                  className="rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? t("admin.rentals.saving") : t("admin.rentals.paymentSave")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
