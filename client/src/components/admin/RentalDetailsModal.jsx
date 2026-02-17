import { useEffect, useMemo, useState } from "react";
import auth from "../../utils/auth";
import { http } from "../../utils/axios";
import { useI18n } from "../../i18n";

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

export default function RentalDetailsModal({
  rental,
  onClose,
  onSave,
  onAddPayment,
  paymentSuccess,
  saving,
  error,
}) {
  const { t } = useI18n();
  const currency = "COP";
  const [dueDate, setDueDate] = useState(
    rental?.dueDate ? new Date(rental.dueDate).toISOString().slice(0, 10) : ""
  );
  const [items, setItems] = useState(rental?.items || []);
  const [notes, setNotes] = useState(rental?.notes || "");
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [customName, setCustomName] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [customMonthly, setCustomMonthly] = useState("");
  const [customPerPrint, setCustomPerPrint] = useState("");
  const [customPerScan, setCustomPerScan] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [contactDirty, setContactDirty] = useState(false);
  const [showFullId, setShowFullId] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    preferredContactMethod: "",
  });
  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    neighborhood: "",
    city: "",
    department: "",
    postalCode: "",
  });
  const [paymentItems, setPaymentItems] = useState(
    (rental?.items || []).map((item) => ({
      orderItemIndex: item.orderItemIndex,
      copies: 0,
      scans: 0,
    }))
  );
  const [paymentDiscount, setPaymentDiscount] = useState(0);
  const monthlyBase = useMemo(
    () =>
      (items || []).reduce(
        (sum, item) =>
          sum + (Number(item?.monthlyPrice) || 0) * (Number(item?.qty) || 1),
        0
      ),
    [items]
  );
  const paymentSubtotal = useMemo(() => {
    const base = monthlyBase;
    const perItem = paymentItems.reduce((sum, paymentItem) => {
      const item = items.find(
        (i) => i.orderItemIndex === paymentItem.orderItemIndex
      );
      if (!item) return sum;
      const copies = Number(paymentItem.copies) || 0;
      const scans = Number(paymentItem.scans) || 0;
      const perPrint = Number(item.rentCostPerPrint) || 0;
      const perScan = Number(item.rentCostPerScan) || 0;
      return sum + copies * perPrint + scans * perScan;
    }, 0);
    return base + perItem;
  }, [monthlyBase, paymentItems, items]);
  const discountValue = Number(paymentDiscount) || 0;
  const paymentTotal = useMemo(
    () => Math.max(0, paymentSubtotal - discountValue),
    [paymentSubtotal, discountValue]
  );
  const iva = useMemo(() => {
    const vatBase = Math.max(0, Number(paymentTotal) || 0);
    return vatBase > 0 ? (vatBase * 19) / 119 : 0;
  }, [paymentTotal]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");
        const res = await http.get("/products", {
          params: {
            category: "copier",
            fields: "_id,name,model,rentCostPerScan,rentCostPerPrint,rentPrice",
            limit: 200,
            order: "asc",
            sort: "name",
          },
        });
        setProducts(res?.data?.data || []);
      } catch (_err) {
        setProductError(t("admin.orders.productsLoadFailed"));
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [t]);

  const contactMethodLabel = (method) => {
    if (method === "email") return t("common.contactMethods.email");
    if (method === "whatsappCall") return t("common.contactMethods.whatsappCall");
    if (method === "whatsappText") return t("common.contactMethods.whatsappText");
    return method || "—";
  };

  const maskId = (value = "") => {
    if (!value) return "";
    const str = String(value);
    if (str.length <= 4) return "•".repeat(str.length);
    return `${"•".repeat(Math.max(0, str.length - 4))}${str.slice(-4)}`;
  };

  useEffect(() => {
    setEditingContact(false);
    setContactDirty(false);
    setShowFullId(false);
    setFullIdValue("");
    setCustomerForm({
      name: rental?.customer?.name || "",
      email: rental?.customer?.email || "",
      phone: rental?.customer?.phone || "",
      idType: rental?.customer?.idType || "",
      idNumber: rental?.customer?.idNumber || "",
      preferredContactMethod: rental?.customer?.preferredContactMethod || "",
    });
    setAddressForm({
      streetAddress: rental?.shippingAddress?.streetAddress || "",
      neighborhood: rental?.shippingAddress?.neighborhood || "",
      city: rental?.shippingAddress?.city || "",
      department: rental?.shippingAddress?.department || "",
      postalCode: rental?.shippingAddress?.postalCode || "",
    });
    setProductId("");
    setCustomName("");
    setCustomModel("");
    setCustomQty(1);
    setCustomMonthly("");
    setCustomPerPrint("");
    setCustomPerScan("");
  }, [rental]);

  const handleSave = () => {
    const shouldSendContact = contactDirty;
    onSave?.({
      id: rental?._id,
      dueDate,
      items,
      notes: notes.trim(),
      customer: shouldSendContact
        ? {
            name: customerForm.name.trim(),
            email: customerForm.email.trim(),
            phone: customerForm.phone.trim(),
            idType: customerForm.idType.trim(),
            idNumber: customerForm.idNumber.trim(),
            preferredContactMethod:
              customerForm.preferredContactMethod.trim(),
          }
        : undefined,
      shippingAddress: shouldSendContact
        ? {
            streetAddress: addressForm.streetAddress.trim(),
            neighborhood: addressForm.neighborhood.trim(),
            city: addressForm.city.trim(),
            department: addressForm.department.trim(),
            postalCode: addressForm.postalCode.trim(),
          }
        : undefined,
    });
  };

  const handleEnd = () => {
    if (!window.confirm(t("admin.rentals.endConfirm"))) {
      return;
    }
    onSave?.({
      id: rental?._id,
      status: "ended",
    });
  };

  const handleReopen = () => {
    if (!window.confirm(t("admin.rentals.reopenConfirm"))) {
      return;
    }
    onSave?.({
      id: rental?._id,
      status: "active",
    });
  };

  const handleAddPayment = () => {
    onAddPayment?.({
      rentalId: rental?._id,
      amount: Number(paymentTotal) || 0,
      discount: Number(discountValue) || 0,
      items: paymentItems,
    });
  };

  const handleOpenHistory = () => {
    if (!rental?._id) return;
    window.open(`/admin/rentals/${rental._id}/payments`, "_blank", "noopener");
  };

  const selectedProduct = products.find((p) => p._id === productId);

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const nextIndex =
      items.length > 0
        ? Math.max(...items.map((i) => Number(i.orderItemIndex) || 0)) + 1
        : 0;
    const nextItem = {
      orderItemIndex: nextIndex,
      product: selectedProduct._id,
      name: selectedProduct.name,
      model: selectedProduct.model || "",
      qty: 1,
      monthlyPrice: Number(selectedProduct.rentPrice) || 0,
      rentCostPerPrint: Number(selectedProduct.rentCostPerPrint) || 0,
      rentCostPerScan: Number(selectedProduct.rentCostPerScan) || 0,
    };
    setItems((prev) => [...prev, nextItem]);
    setProductId("");
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const nextIndex =
      items.length > 0
        ? Math.max(...items.map((i) => Number(i.orderItemIndex) || 0)) + 1
        : 0;
    const nextItem = {
      orderItemIndex: nextIndex,
      product: null,
      name,
      model: customModel.trim(),
      qty: Number(customQty) || 1,
      monthlyPrice: Number(customMonthly) || 0,
      rentCostPerPrint: Number(customPerPrint) || 0,
      rentCostPerScan: Number(customPerScan) || 0,
    };
    setItems((prev) => [...prev, nextItem]);
    setCustomName("");
    setCustomModel("");
    setCustomQty(1);
    setCustomMonthly("");
    setCustomPerPrint("");
    setCustomPerScan("");
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const [fullIdValue, setFullIdValue] = useState("");

  const handleToggleId = async () => {
    const next = !showFullId;
    setShowFullId(next);
    if (next && rental?._id) {
      try {
        const token = auth.getToken();
        const res = await http.get("/admin/rental-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: rental._id },
        });
        setFullIdValue(res?.data?.idNumberFull || "");
      } catch (_err) {
        // no-op
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto flex h-full w-full max-w-4xl items-center justify-center p-4">
        <div
          className="max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#00294D]">
                {t("admin.rentals.detailsTitle")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("admin.rentals.orderId")}:{" "}
                <span className="font-semibold text-[#00294D]">
                  {rental?.order || "-"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenHistory}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                {t("admin.rentals.paymentHistory")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                {t("admin.rentals.close")}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {rental?.status || "-"}
            </span>
            {rental?.startDate && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {t("admin.rentals.startDate")}: {formatDate(rental.startDate)}
              </span>
            )}
            {rental?.dueDate && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {t("admin.rentals.dueDate")}: {formatDate(rental.dueDate)}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.customerTitle")}
              </h3>
              {!editingContact ? (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>{customerForm?.name || "-"}</p>
                  <p>{customerForm?.email || "-"}</p>
                  <p>{customerForm?.phone || "-"}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p>
                      {customerForm?.idType || "-"}{" "}
                      {showFullId
                        ? fullIdValue || customerForm?.idNumber || ""
                        : maskId(customerForm?.idNumber || "")}
                    </p>
                    {!!customerForm?.idNumber && (
                      <button
                        type="button"
                        onClick={handleToggleId}
                        className="text-xs font-semibold text-[#00294D] underline"
                      >
                        {showFullId
                          ? t("admin.orders.hideId")
                          : t("admin.orders.showId")}
                      </button>
                    )}
                  </div>
                  {customerForm?.preferredContactMethod && (
                    <p>
                      {t("admin.orders.preferredContact")}:{" "}
                      {contactMethodLabel(
                        customerForm.preferredContactMethod
                      )}
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[#00294D] underline"
                    onClick={() => setEditingContact(true)}
                  >
                    {t("admin.orders.editContact")}
                  </button>
                </div>
              ) : (
                <div className="mt-3 grid gap-3 text-sm">
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={customerForm.name}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.customerName")}
                  />
                  <input
                    type="email"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={customerForm.email}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.customerEmail")}
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={customerForm.phone}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.customerPhone")}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={customerForm.idType}
                      onChange={(e) => {
                        setCustomerForm((prev) => ({
                          ...prev,
                          idType: e.target.value,
                        }));
                        setContactDirty(true);
                      }}
                      placeholder={t("admin.orders.customerIdType")}
                    />
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={customerForm.idNumber}
                      onChange={(e) => {
                        setCustomerForm((prev) => ({
                          ...prev,
                          idNumber: e.target.value,
                        }));
                        setContactDirty(true);
                      }}
                      placeholder={t("admin.orders.customerIdNumber")}
                    />
                  </div>
                  <select
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={customerForm.preferredContactMethod}
                    onChange={(e) => {
                      setCustomerForm((prev) => ({
                        ...prev,
                        preferredContactMethod: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                  >
                    <option value="">
                      {t("admin.orders.contactPlaceholder")}
                    </option>
                    <option value="email">
                      {t("common.contactMethods.email")}
                    </option>
                    <option value="whatsappCall">
                      {t("common.contactMethods.whatsappCall")}
                    </option>
                    <option value="whatsappText">
                      {t("common.contactMethods.whatsappText")}
                    </option>
                  </select>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#00294D] underline"
                    onClick={() => setEditingContact(false)}
                  >
                    {t("admin.orders.doneEditing")}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.shippingTitle")}
              </h3>
              {!editingContact ? (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>{addressForm?.streetAddress || "-"}</p>
                  {addressForm?.neighborhood && (
                    <p>{addressForm.neighborhood}</p>
                  )}
                  <p>
                    {addressForm?.city || "-"}{" "}
                    {addressForm?.department || ""}
                  </p>
                  {addressForm?.postalCode && (
                    <p>{addressForm.postalCode}</p>
                  )}
                </div>
              ) : (
                <div className="mt-3 grid gap-3 text-sm">
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={addressForm.streetAddress}
                    onChange={(e) => {
                      setAddressForm((prev) => ({
                        ...prev,
                        streetAddress: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.addressStreet")}
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={addressForm.neighborhood}
                    onChange={(e) => {
                      setAddressForm((prev) => ({
                        ...prev,
                        neighborhood: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.addressNeighborhood")}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }));
                        setContactDirty(true);
                      }}
                      placeholder={t("admin.orders.addressCity")}
                    />
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={addressForm.department}
                      onChange={(e) => {
                        setAddressForm((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }));
                        setContactDirty(true);
                      }}
                      placeholder={t("admin.orders.addressDepartment")}
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={addressForm.postalCode}
                    onChange={(e) => {
                      setAddressForm((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }));
                      setContactDirty(true);
                    }}
                    placeholder={t("admin.orders.addressPostal")}
                  />
                </div>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.rentals.itemTitle")}
            </h3>
            <div className="mt-3 space-y-4">
              {(items || []).map((item, index) => (
                <div key={`${item.orderItemIndex}-${index}`} className="rounded-md border border-gray-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#00294D]">
                        {item?.name || "-"}
                      </p>
                      {item?.model && (
                        <p className="text-xs text-gray-600">{item.model}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>
                        {t("admin.orders.qtyLabel")}: {item?.qty || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        {t("admin.orders.removeItem")}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        {t("admin.rentals.monthlyPrice")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                        value={Number(item?.monthlyPrice) || 0}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, monthlyPrice: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        {t("admin.orders.rentCostPerPrint")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                        value={Number(item?.rentCostPerPrint) || 0}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, rentCostPerPrint: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        {t("admin.orders.rentCostPerScan")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                        value={Number(item?.rentCostPerScan) || 0}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, rentCostPerScan: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.rentals.monthlyTotal")}
                  </label>
                  <div className="mt-2 text-sm font-semibold text-[#00294D]">
                    {formatMoney(monthlyBase, currency)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.rentals.dueDate")}
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.orders.addProductTitle")}
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_140px]">
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.productLabel")}
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={loadingProducts}
                >
                  <option value="">{t("admin.orders.productPlaceholder")}</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {productError && (
                  <p className="mt-1 text-xs text-red-600">{productError}</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProduct}
                  className="w-full rounded-md bg-[#00294D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("admin.orders.addItem")}
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.orders.addCustomTitle")}
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-[1.5fr_120px_140px_140px]">
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.customNameLabel")}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t("admin.orders.customNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.customQtyLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.rentals.monthlyPrice")}
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customMonthly}
                  onChange={(e) => setCustomMonthly(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.rentCostPerPrint")}
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customPerPrint}
                  onChange={(e) => setCustomPerPrint(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.rentCostPerScan")}
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customPerScan}
                  onChange={(e) => setCustomPerScan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.forms.modelNumber")}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder={t("admin.forms.modelPlaceholder")}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customName.trim()}
                className="rounded-md bg-[#00294D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("admin.orders.addCustom")}
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.orders.notesTitle")}
            </h3>
            <textarea
              className="mt-2 w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>

          {rental?.status !== "ended" && (
            <section className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.rentals.addPaymentTitle")}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {t("admin.rentals.addPaymentHint")}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.rentals.paymentMonthly")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={Number(monthlyBase) || 0}
                    readOnly
                  />
                </div>
                <div />
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.orders.discountLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={Number(paymentDiscount) || 0}
                    onChange={(e) => setPaymentDiscount(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {items.map((item, index) => {
                  const paymentItem = paymentItems.find(
                    (p) => p.orderItemIndex === item.orderItemIndex
                  );
                  return (
                    <div
                      key={`payment-${item.orderItemIndex}-${index}`}
                      className="rounded-md border border-gray-200 p-3"
                    >
                      <div className="text-sm font-semibold text-[#00294D]">
                        {item.name}
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
                            value={Number(paymentItem?.copies) || 0}
                            onChange={(e) =>
                              setPaymentItems((prev) =>
                                prev.map((p) =>
                                  p.orderItemIndex === item.orderItemIndex
                                    ? { ...p, copies: e.target.value }
                                    : p
                                )
                              )
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
                            value={Number(paymentItem?.scans) || 0}
                            onChange={(e) =>
                              setPaymentItems((prev) =>
                                prev.map((p) =>
                                  p.orderItemIndex === item.orderItemIndex
                                    ? { ...p, scans: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.orders.ivaLabel")}
                  </label>
                  <div className="mt-2 text-sm font-semibold text-[#00294D]">
                    {formatMoney(iva, currency)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("admin.orders.ivaHint")}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    {t("admin.rentals.paymentTotal")}
                  </label>
                  <div className="mt-2 text-sm font-semibold text-[#00294D]">
                    {formatMoney(paymentTotal, currency)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66]"
                >
                  {t("admin.rentals.addPaymentButton")}
                </button>
              </div>
              {paymentSuccess && (
                <p className="mt-3 text-sm font-semibold text-green-700">
                  {paymentSuccess}
                </p>
              )}
            </section>
          )}

          {error && (
            <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
          )}

          {rental?.status !== "ended" && (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                {t("admin.rentals.endTitle")}
              </h3>
              <p className="mt-1 text-xs text-amber-800">
                {t("admin.rentals.endHint")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleEnd}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  {t("admin.rentals.endButton")}
                </button>
              </div>
            </section>
          )}
          {rental?.status === "ended" && (
            <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">
                {t("admin.rentals.reopenTitle")}
              </h3>
              <p className="mt-1 text-xs text-emerald-800">
                {t("admin.rentals.reopenHint")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleReopen}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {t("admin.rentals.reopenButton")}
                </button>
              </div>
            </section>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {t("admin.rentals.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? t("admin.rentals.saving") : t("admin.rentals.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
