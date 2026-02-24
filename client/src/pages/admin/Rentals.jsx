import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";
import auth from "../../utils/auth";
import RentalDetailsModal from "../../components/admin/RentalDetailsModal";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 20;

const formatMoney = (value, currency = "COP") => {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
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

export default function Rentals() {
  const { t } = useI18n();
  const [rentalStatusTab, setRentalStatusTab] = useState("active");
  const [rentalPage, setRentalPage] = useState(1);
  const [rentalSearch, setRentalSearch] = useState("");
  const debouncedRentalSearch = useDebounce(rentalSearch, 300);
  const [rentals, setRentals] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRental, setSelectedRental] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const token = auth.getToken();
      const res = await http.get("/admin/rentals", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: debouncedRentalSearch || undefined,
          page: rentalPage,
          limit: ITEMS_PER_PAGE,
          status: rentalStatusTab,
        },
      });
      setRentals(res.data);
    } catch (_err) {
      setError(t("admin.rentals.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [rentalPage, debouncedRentalSearch, rentalStatusTab]);

  const currentRentals = rentals?.data || [];
  const rentalTotalPages = rentals?.pagination?.totalPages || 1;

  const handleRentalPrev = () =>
    setRentalPage((prev) => Math.max(prev - 1, 1));
  const handleRentalNext = () =>
    setRentalPage((prev) => Math.min(prev + 1, rentalTotalPages));

  const handleSaveRental = async (payload) => {
    try {
      setSaving(true);
      setSaveError("");
      const token = auth.getToken();
      const res = await http.put("/admin/rental", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data;
      setRentals((prev) => ({
        ...prev,
        data: (prev?.data || []).map((rental) =>
          rental._id === updated._id ? updated : rental
        ),
      }));
      setSelectedRental(null);
    } catch (_err) {
      setSaveError(t("admin.rentals.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRental = async (payload) => {
    try {
      setCreating(true);
      setCreateError("");
      const token = auth.getToken();
      const res = await http.post("/admin/rental", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const created = res.data;
      setRentals((prev) => ({
        ...prev,
        data: [created, ...(prev?.data || [])],
      }));
      setIsCreateOpen(false);
    } catch (_err) {
      setCreateError(t("admin.rentals.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleAddRentalPayment = async (payload) => {
    try {
      setSaving(true);
      setSaveError("");
      setPaymentSuccess("");
      const token = auth.getToken();
      const res = await http.post("/admin/rental-payment", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res?.data?.rental;
      if (updated) {
        setRentals((prev) => ({
          ...prev,
          data: (prev?.data || []).map((rental) =>
            rental._id === updated._id ? updated : rental
          ),
        }));
        setSelectedRental(updated);
      }
      setPaymentSuccess(t("admin.rentals.paymentSuccess"));
    } catch (_err) {
      setSaveError(t("admin.rentals.paymentFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#00294D]">
          {t("admin.rentals.title")}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#00294D] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003B66]"
          >
            <span className="text-lg leading-none">+</span>
            {t("admin.rentals.createRental")}
          </button>
          <input
            type="text"
            placeholder={t("admin.rentals.searchPlaceholder")}
            className="border px-4 py-2 rounded text-sm w-full max-w-xs"
            value={rentalSearch}
            onChange={(e) => {
              setRentalSearch(e.target.value);
              setRentalPage(1);
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "active", label: t("admin.rentals.tabActive") },
          { key: "ended", label: t("admin.rentals.tabEnded") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setRentalStatusTab(tab.key);
              setRentalPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              rentalStatusTab === tab.key
                ? "bg-[#00294D] text-white"
                : "bg-gray-100 text-[#00294D] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-white font-bold text-left">
            <tr>
              <th className="px-6 py-4">{t("admin.rentals.itemTitle")}</th>
              <th className="px-6 py-4">{t("admin.dashboard.customer")}</th>
              <th className="px-6 py-4">{t("admin.rentals.dueDate")}</th>
              <th className="px-6 py-4">{t("admin.rentals.monthlyPrice")}</th>
              <th className="px-6 py-4">{t("admin.rentals.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.rentals.loading")}
                </td>
              </tr>
            ) : currentRentals.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                  {t("admin.rentals.noRentals")}
                </td>
              </tr>
            ) : (
              currentRentals.map((rental) => (
                <tr
                  key={rental._id}
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRental(rental)}
                >
                  <td className="px-6 py-4">
                    {(rental?.items || []).map((item) => item.name).join(", ") ||
                      "-"}
                  </td>
                  <td className="px-6 py-4">{rental?.customer?.name}</td>
                  <td className="px-6 py-4">{formatDate(rental?.dueDate)}</td>
                  <td className="px-6 py-4">
                    {formatMoney(
                      (rental?.items || []).reduce(
                        (sum, item) =>
                          sum +
                          (Number(item?.monthlyPrice) || 0) *
                            (Number(item?.qty) || 1),
                        0
                      )
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                        rental.status === "ended" ? "bg-[#7B1FA2]" : "bg-[#1B5E20]"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rentalTotalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-[#00294D]">
          <button
            onClick={handleRentalPrev}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={rentalPage === 1}
          >
            {t("admin.orders.previous")}
          </button>
          <span>
            {t("admin.orders.page", {
              current: rentalPage,
              total: rentalTotalPages,
            })}
          </span>
          <button
            onClick={handleRentalNext}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={rentalPage === rentalTotalPages}
          >
            {t("admin.orders.next")}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
      )}

      {selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          onClose={() => {
            setSelectedRental(null);
            setSaveError("");
            setPaymentSuccess("");
          }}
          onSave={handleSaveRental}
          onAddPayment={handleAddRentalPayment}
          paymentSuccess={paymentSuccess}
          saving={saving}
          error={saveError}
        />
      )}

      {isCreateOpen && (
        <RentalDetailsModal
          rental={{
            status: "active",
            items: [
              {
                orderItemIndex: 0,
                name: "",
                model: "",
                qty: 1,
                monthlyPrice: 0,
                rentCostPerPrint: 0,
                rentCostPerScan: 0,
              },
            ],
            customer: {},
            shippingAddress: {},
            notes: "",
          }}
          onClose={() => {
            setIsCreateOpen(false);
            setCreateError("");
          }}
          onSave={handleCreateRental}
          onAddPayment={() => {}}
          paymentSuccess=""
          saving={creating}
          error={createError}
        />
      )}
    </div>
  );
}
