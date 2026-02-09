import { useI18n } from "../i18n";

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

export default function OrderDetailsModal({ order, onClose }) {
  const { t } = useI18n();
  const items = Array.isArray(order?.items) ? order.items : [];
  const amounts = order?.amounts || {};
  const currency = amounts.currency || "COP";
  const totalAmount = amounts.total ?? 0;
  const address = order?.shippingAddress || {};
  const customer = order?.customer || {};

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative mx-auto flex h-full w-full max-w-3xl items-center justify-center p-4">
        <div
          className="max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#00294D]">
                {t("profile.orderDetailsTitle")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("profile.orderIdLabel")}:{" "}
                <span className="font-semibold text-[#00294D]">
                  {order?._id || "—"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              {t("profile.close")}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {order?.status && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {order.status}
              </span>
            )}
            {order?.createdAt && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {formatDate(order.createdAt)}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("profile.customerTitle")}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>{customer?.name || "—"}</p>
                <p>{customer?.email || "—"}</p>
                <p>{customer?.phone || "—"}</p>
                <p>
                  {customer?.idType || "—"} {customer?.idNumber || ""}
                </p>
                {customer?.preferredContactMethod && (
                  <p>
                    {t("profile.preferredContact")}:{" "}
                    {customer.preferredContactMethod}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("profile.shippingTitle")}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>{address?.streetAddress || "—"}</p>
                {address?.neighborhood && <p>{address.neighborhood}</p>}
                <p>
                  {address?.city || "—"} {address?.department || ""}
                </p>
                {address?.postalCode && <p>{address.postalCode}</p>}
              </div>
            </section>
          </div>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("profile.itemsTitle")}
            </h3>
            <div className="mt-3 space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item?.product || "item"}-${index}`}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#00294D]">
                        {item?.name || t("profile.unnamedItem")}
                      </p>
                      {item?.model && (
                        <p className="text-xs text-gray-600">{item.model}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-700">
                      <p>
                        {t("profile.qtyLabel")}: {item?.qty || 0}
                      </p>
                      <p className="font-semibold text-[#00294D]">
                        {formatMoney(item?.unitAmount || 0, currency)}
                      </p>
                    </div>
                  </div>
                  {item?.IsRented && (
                    <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase text-gray-600">
                      {t("profile.rentalLabel")}
                    </span>
                  )}
                </div>
              ))}
              {!items.length && (
                <p className="text-sm text-gray-500">{t("profile.noItems")}</p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("profile.summaryTitle")}
            </h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <Line
                label={t("profile.subtotal")}
                value={formatMoney(amounts.subtotal || 0, currency)}
              />
              {(amounts.shipping || 0) > 1 && (
                <Line
                  label={t("profile.shipping")}
                  value={formatMoney(amounts.shipping || 0, currency)}
                />
              )}
              {(amounts.discount || 0) > 1 && (
                <Line
                  label={t("profile.discount")}
                  value={formatMoney(amounts.discount || 0, currency)}
                />
              )}
              <Line
                label={t("profile.total")}
                value={formatMoney(totalAmount, currency)}
                strong
              />
            </div>
          </section>

          {order?.notes && (
            <section className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("profile.notesTitle")}
              </h3>
              <p className="mt-2 text-sm text-gray-700">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-600">{label}</span>
      <span className={strong ? "font-semibold text-[#00294D]" : ""}>
        {value}
      </span>
    </div>
  );
}
