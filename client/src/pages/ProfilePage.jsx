import { useEffect, useMemo, useState } from "react";
import { http } from "../utils/axios";
import auth from "../utils/auth";
import { useI18n } from "../i18n";
import OrderDetailsModal from "../components/OrderDetailsModal";

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

export default function ProfilePage() {
  const { t } = useI18n();
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loggedIn = auth.loggedIn();

  useEffect(() => {
    if (!loggedIn) return;
    const profile = auth.getProfile();
    const email = profile?.data?.email || "";
    setUserEmail(email);

    const fetchOrders = async () => {
      if (!email) return;
      try {
        setLoading(true);
        setLoadError("");
        const token = auth.getToken();
        const res = await http.get("/users/user", {
          params: { email },
          headers: { Authorization: `Bearer ${token}` },
        });
        const nextOrders = res?.data?.orders || [];
        setOrders(nextOrders);
      } catch (_err) {
        if (_err?.status === 401) {
          setLoadError(t("profile.sessionExpired"));
          auth.logout();
        } else {
          setLoadError(t("profile.loadFailed"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [loggedIn, t]);

  const visibleOrders = useMemo(
    () => orders.filter((o) => o?.status !== "canceled"),
    [orders]
  );

  const pendingOrders = useMemo(
    () => visibleOrders.filter((o) => o?.status === "pending"),
    [visibleOrders]
  );

  const completedOrders = useMemo(
    () => visibleOrders.filter((o) => o?.status && o.status !== "pending"),
    [visibleOrders]
  );

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSaveError(t("profile.errors.required"));
      return;
    }

    if (newPassword.length < 8) {
      setSaveError(t("profile.errors.passwordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveError(t("profile.errors.passwordMismatch"));
      return;
    }

    try {
      setSaving(true);
      const token = auth.getToken();
      await http.post(
        "/users/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveSuccess(t("profile.passwordSuccess"));
    } catch (err) {
      const msg = err?.message || "";
      const code = err?.code || "";
      if (err?.status === 401) {
        setSaveError(t("profile.sessionExpired"));
        auth.logout();
      } else if (code === "unauthorized" || msg.includes("Invalid credentials")) {
        setSaveError(t("profile.errors.invalidCurrent"));
      } else {
        setSaveError(t("profile.errors.passwordSave"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-3xl font-bold text-[#00294D]">
          {t("profile.title")}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {t("profile.loginRequired")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-[#00294D]">
          {t("profile.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-600">{t("profile.subtitle")}</p>
        <div className="mt-4 text-sm text-gray-700">
          <span className="font-semibold text-[#00294D]">
            {t("profile.emailLabel")}:
          </span>{" "}
          {userEmail || t("profile.emailUnknown")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-[#00294D]">
            {t("profile.passwordTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t("profile.passwordHint")}
          </p>

          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#00294D]">
                {t("profile.currentPassword")}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#00294D]">
                {t("profile.newPassword")}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#00294D]">
                {t("profile.confirmPassword")}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {saveError && (
              <p className="text-sm font-semibold text-red-600">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-sm font-semibold text-green-600">
                {saveSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? t("profile.saving") : t("profile.savePassword")}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#00294D]">
                {t("profile.ordersTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t("profile.ordersSubtitle")}
              </p>
            </div>
            {loading && (
              <span className="text-xs font-semibold text-gray-500">
                {t("profile.loading")}
              </span>
            )}
          </div>

          {loadError && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              {loadError}
            </p>
          )}

          {!loading && !loadError && (
            <div className="mt-4 space-y-6">
              <OrderGroup
                title={t("profile.pendingOrders")}
                orders={pendingOrders}
                emptyLabel={t("profile.noPending")}
                itemsLabel={t("profile.itemsLabel")}
                onSelect={setSelectedOrder}
              />
              <OrderGroup
                title={t("profile.completedOrders")}
                orders={completedOrders}
                emptyLabel={t("profile.noCompleted")}
                itemsLabel={t("profile.itemsLabel")}
                onSelect={setSelectedOrder}
              />
            </div>
          )}
        </section>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderGroup({ title, orders, emptyLabel, itemsLabel, onSelect }) {
  if (!orders.length) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-[#00294D]">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#00294D]">{title}</h3>
      <div className="mt-3 space-y-3">
        {orders.map((order) => {
          const total = order?.amounts?.total ?? 0;
          const currency = order?.amounts?.currency || "COP";
          const items = Array.isArray(order?.items) ? order.items : [];
          const count = items.reduce((sum, item) => sum + (item?.qty || 0), 0);
          const orderId = order?._id ? order._id.slice(-6).toUpperCase() : "—";

          return (
            <button
              type="button"
              key={order?._id || orderId}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-gray-100"
              onClick={() => onSelect?.(order)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#00294D]">
                    {`#${orderId}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(order?.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#00294D]">
                    {formatMoney(total, currency)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {count} {itemsLabel}
                  </p>
                </div>
              </div>
              {order?.status && (
                <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {order.status}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
