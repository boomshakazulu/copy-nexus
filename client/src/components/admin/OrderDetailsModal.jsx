import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { http } from "../../utils/axios";

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

export default function OrderDetailsModal({
  order,
  onClose,
  onSave,
  saving,
  error,
}) {
  const { t } = useI18n();
  const statusOptions = ["pending", "shipped", "completed", "canceled"];
  const initialItems = Array.isArray(order?.items) ? order.items : [];
  const currency = order?.amounts?.currency || "COP";

  const [editItems, setEditItems] = useState([]);
  const [shipping, setShipping] = useState(order?.amounts?.shipping ?? 0);
  const [discount, setDiscount] = useState(order?.amounts?.discount ?? 0);
  const [status, setStatus] = useState(order?.status || "pending");
  const [trackingNumber, setTrackingNumber] = useState(
    order?.trackingNumber || ""
  );
  const [removedItem, setRemovedItem] = useState(null);
  const [category, setCategory] = useState("copier");
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [addIsRental, setAddIsRental] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIsRental, setCustomIsRental] = useState(false);
  const [customUnitAmount, setCustomUnitAmount] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [contactDirty, setContactDirty] = useState(false);
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

  useEffect(() => {
    setShipping(order?.amounts?.shipping ?? 0);
    setDiscount(order?.amounts?.discount ?? 0);
    const nextStatus = statusOptions.includes(order?.status)
      ? order.status
      : "pending";
    setStatus(nextStatus);
    setTrackingNumber(order?.trackingNumber || "");
    setEditItems(initialItems.map((item) => ({ ...item })));
    setRemovedItem(null);
    setCustomName("");
    setCustomIsRental(false);
    setCustomUnitAmount("");
    setCustomQty(1);
    setEditingContact(false);
    setContactDirty(false);
    setCustomerForm({
      name: order?.customer?.name || "",
      email: order?.customer?.email || "",
      phone: order?.customer?.phone || "",
      idType: order?.customer?.idType || "",
      idNumber:
        order?.customer?.idNumberFull || order?.customer?.idNumber || "",
      preferredContactMethod: order?.customer?.preferredContactMethod || "",
    });
    setAddressForm({
      streetAddress: order?.shippingAddress?.streetAddress || "",
      neighborhood: order?.shippingAddress?.neighborhood || "",
      city: order?.shippingAddress?.city || "",
      department: order?.shippingAddress?.department || "",
      postalCode: order?.shippingAddress?.postalCode || "",
    });
  }, [order, initialItems]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");
        const res = await http.get("/products", {
          params: {
            category,
            fields: "_id,name,model,purchasePrice,rentable,rentPrice",
            limit: 100,
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
  }, [category, t]);

  const subtotal = useMemo(
    () =>
      editItems.reduce((sum, item) => {
        const unit = Number(item?.unitAmount) || 0;
        return sum + unit * (item?.qty || 0);
      }, 0),
    [editItems]
  );

  const shippingValue = Number(shipping) || 0;
  const discountValue = Number(discount) || 0;
  const vatBase = Math.max(0, subtotal + shippingValue - discountValue);
  const iva = vatBase > 0 ? (vatBase * 19) / 119 : 0;
  const total = Math.max(0, subtotal + shippingValue - discountValue);

  const customer = order?.customer || {};
  const address = order?.shippingAddress || {};
  const displayCustomer =
    editingContact || contactDirty ? customerForm : customer;
  const displayAddress =
    editingContact || contactDirty ? addressForm : address;
  const contactMethodLabel = (method) => {
    if (method === "email") return t("common.contactMethods.email");
    if (method === "whatsappCall") return t("common.contactMethods.whatsappCall");
    if (method === "whatsappText") return t("common.contactMethods.whatsappText");
    return method || "—";
  };

  const handleItemChange = (index, field, value) => {
    setEditItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setEditItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    setRemovedItem({ item: editItems[index], index });
  };

  const handleUndoRemove = () => {
    if (!removedItem?.item) return;
    setEditItems((prev) => {
      const next = [...prev];
      const insertAt = Math.min(removedItem.index, next.length);
      next.splice(insertAt, 0, removedItem.item);
      return next;
    });
    setRemovedItem(null);
  };

  const selectedProduct = products.find((p) => p._id === productId);

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const isRental = addIsRental && !!selectedProduct.rentable;
    const unitAmount = isRental
      ? Number(selectedProduct.rentPrice) || 0
      : Number(selectedProduct.purchasePrice) || 0;
    const nextItem = {
      product: selectedProduct._id,
      name: selectedProduct.name,
      model: selectedProduct.model || "",
      qty: 1,
      unitAmount,
      IsRented: isRental,
    };
    setEditItems((prev) => [...prev, nextItem]);
    setProductId("");
    setAddIsRental(false);
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    const unitAmount = Number(customUnitAmount) || 0;
    const qty = Number(customQty) || 1;
    if (!name || unitAmount < 0 || qty < 1) return;
    const nextItem = {
      product: null,
      name,
      model: "",
      qty,
      unitAmount,
      IsRented: customIsRental,
      isCustom: true,
    };
    setEditItems((prev) => [...prev, nextItem]);
    setCustomName("");
    setCustomIsRental(false);
    setCustomUnitAmount("");
    setCustomQty(1);
  };

  const handleSave = () => {
    const shouldSendContact = contactDirty;
    onSave?.({
      id: order?._id,
      shipping: shippingValue,
      discount: discountValue,
      status,
      trackingNumber: status === "shipped" ? trackingNumber : "",
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
      items: editItems.map((item) => ({
        product: item.product || null,
        name: item.name,
        model: item.model || "",
        qty: Number(item.qty) || 1,
        unitAmount: Number(item.unitAmount) || 0,
        IsRented: !!item.IsRented,
        isCustom: !!item.isCustom,
      })),
    });
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
                {t("admin.orders.detailsTitle")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("admin.orders.orderId")}:{" "}
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
              {t("admin.orders.close")}
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
                {t("admin.orders.customerTitle")}
              </h3>
              {!editingContact ? (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>{displayCustomer?.name || "—"}</p>
                  <p>{displayCustomer?.email || "—"}</p>
                  <p>{displayCustomer?.phone || "—"}</p>
                  <p>
                    {displayCustomer?.idType || "—"}{" "}
                    {displayCustomer?.idNumberFull ||
                      displayCustomer?.idNumber ||
                      ""}
                  </p>
                  {displayCustomer?.preferredContactMethod && (
                    <p>
                      {t("admin.orders.preferredContact")}:{" "}
                      {contactMethodLabel(
                        displayCustomer.preferredContactMethod
                      )}
                    </p>
                  )}
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
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.shippingTitle")}
              </h3>
              {!editingContact ? (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>{displayAddress?.streetAddress || "—"}</p>
                  {displayAddress?.neighborhood && (
                    <p>{displayAddress.neighborhood}</p>
                  )}
                  <p>
                    {displayAddress?.city || "—"}{" "}
                    {displayAddress?.department || ""}
                  </p>
                  {displayAddress?.postalCode && (
                    <p>{displayAddress.postalCode}</p>
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

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingContact((prev) => !prev)}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              {editingContact
                ? t("admin.orders.doneEditing")
                : t("admin.orders.editContact")}
            </button>
          </div>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.orders.itemsTitle")}
            </h3>
            <div className="mt-3 space-y-3">
              {editItems.map((item, index) => {
                const isRental = !!item?.IsRented;
                const unit = Number(item?.unitAmount) || 0;
                const qty = Number(item?.qty) || 0;
                const lineTotal = unit * qty;
                return (
                  <div
                    key={`${item?.product || "item"}-${index}`}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#00294D]">
                          {item?.name || t("admin.orders.unnamedItem")}
                        </p>
                        {item?.model && (
                          <p className="text-xs text-gray-600">{item.model}</p>
                        )}
                      </div>
                      <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3 sm:items-end">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.orders.qtyLabel")}
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                            value={qty}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">
                            {t("admin.orders.unitPriceLabel")}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
                            value={unit}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unitAmount",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {t("admin.orders.lineTotal")}:{" "}
                            {formatMoney(lineTotal, currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      {isRental && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase text-gray-600">
                          {t("admin.orders.rentalLabel")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        {t("admin.orders.removeItem")}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!editItems.length && (
                <p className="text-sm text-gray-500">
                  {t("admin.orders.noItems")}
                </p>
              )}
            </div>

            {removedItem?.item && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span>{t("admin.orders.itemRemoved")}</span>
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="font-semibold text-amber-900 underline"
                >
                  {t("admin.orders.undo")}
                </button>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#00294D]">
              {t("admin.orders.addProductTitle")}
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr_140px_120px]">
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.categoryLabel")}
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setProductId("");
                    setAddIsRental(false);
                  }}
                >
                  <option value="copier">
                    {t("admin.orders.categories.copier")}
                  </option>
                  <option value="part">
                    {t("admin.orders.categories.part")}
                  </option>
                  <option value="toner">
                    {t("admin.orders.categories.toner")}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">
                  {t("admin.orders.productLabel")}
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setAddIsRental(false);
                  }}
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
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={addIsRental}
                    disabled={!selectedProduct?.rentable}
                    onChange={(e) => setAddIsRental(e.target.checked)}
                  />
                  {t("admin.orders.rentalToggle")}
                </label>
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
                  {t("admin.orders.unitPriceLabel")}
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  value={customUnitAmount}
                  onChange={(e) => setCustomUnitAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={customIsRental}
                    onChange={(e) => setCustomIsRental(e.target.checked)}
                  />
                  {t("admin.orders.rentalToggle")}
                </label>
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

          {order?.notes && (
            <section className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.notesTitle")}
              </h3>
              <p className="mt-2 text-sm text-gray-700">{order.notes}</p>
            </section>
          )}

          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.pricingTitle")}
              </h3>
              <div className="mt-3 space-y-3 text-sm text-gray-700">
                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    {t("admin.orders.shippingLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    {t("admin.orders.discountLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">
                    {t("admin.orders.statusLabel")}
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">
                      {t("admin.orders.statusPending")}
                    </option>
                    <option value="shipped">
                      {t("admin.orders.statusShipped")}
                    </option>
                    <option value="completed">
                      {t("admin.orders.statusCompleted")}
                    </option>
                    <option value="canceled">
                      {t("admin.orders.statusCanceled")}
                    </option>
                  </select>
                </div>
                {status === "shipped" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600">
                      {t("admin.orders.trackingLabel")}
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder={t("admin.orders.trackingPlaceholder")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-[#00294D]">
                {t("admin.orders.summaryTitle")}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <Line
                  label={t("admin.orders.subtotal")}
                  value={formatMoney(subtotal, currency)}
                />
                <Line
                  label={t("admin.orders.shippingLabel")}
                  value={formatMoney(shippingValue, currency)}
                />
                {discountValue > 1 && (
                  <Line
                    label={t("admin.orders.discountLabel")}
                    value={`- ${formatMoney(discountValue, currency)}`}
                  />
                )}
                <Line
                  label={t("admin.orders.ivaLabel")}
                  value={formatMoney(iva, currency)}
                />
                <Line
                  label={t("admin.orders.total")}
                  value={formatMoney(total, currency)}
                  strong
                />
                <p className="text-xs text-gray-500">
                  {t("admin.orders.ivaHint")}
                </p>
              </div>
            </div>
          </section>

          {error && (
            <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {t("admin.orders.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? t("admin.orders.saving") : t("admin.orders.save")}
            </button>
          </div>
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
