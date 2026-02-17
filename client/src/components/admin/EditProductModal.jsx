import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { formatCOP } from "../../utils/helpers";
import RichTextField from "./RichTextField";
import CompatibleCopierCard from "./CompatibleCopierCard";
import Auth from "../../utils/auth";
import { useI18n } from "../../i18n";

export default function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  copierOptions = [],
  thisProduct,
  formError = "",
  fieldErrors = {},
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("copier");
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("active");

  // COP fields + editing flags
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rentable, setRentable] = useState(true);
  const [rentPrice, setRentPrice] = useState("");
  const [rentCostPerScan, setRentCostPerScan] = useState("");
  const [rentCostPerPrint, setRentCostPerPrint] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(false);
  const [editingRent, setEditingRent] = useState(false);
  const [editingRentCostPerScan, setEditingRentCostPerScan] = useState(false);
  const [editingRentCostPerPrint, setEditingRentCostPerPrint] = useState(false);

  // Compatible copiers (for parts/toner)
  const [compatibleCopiers, setCompatibleCopiers] = useState([]);

  // Images
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const dragIndexRef = useRef(null);

  useEffect(() => {
    if (isOpen && thisProduct) {
      setName(thisProduct.name || "");
      setSubtitle(thisProduct.subtitle || "");
      setModel(thisProduct.model || "");
      setCategory(thisProduct.category || "copier");
      setInStock(
        typeof thisProduct.inStock === "boolean" ? thisProduct.inStock : true
      );
      setPurchasePrice(thisProduct.purchasePrice?.toString() || "");
      setRentable(
        typeof thisProduct.rentable === "boolean"
          ? thisProduct.rentable
          : thisProduct.category === "copier"
      );
      setRentPrice(thisProduct.rentPrice?.toString() || "");
      setRentCostPerScan(thisProduct.rentCostPerScan?.toString() || "");
      setRentCostPerPrint(thisProduct.rentCostPerPrint?.toString() || "");
      setImages(thisProduct.images || []);
      setNewImageUrl("");
      setDescription(thisProduct.description || "");
      setCompatibleCopiers(thisProduct.compatibleCopiers || []);
      setVisibility(thisProduct.visibility || "active");
    }
  }, [isOpen, thisProduct]);

  if (!isOpen) return null;

  const canSave =
    name.trim() &&
    model.trim() &&
    description.trim() &&
    purchasePrice !== "" &&
    (!rentable ||
      (rentPrice !== "" && rentCostPerScan !== "" && rentCostPerPrint !== ""));

  const onlyDigits = (s) => (s || "").replace(/\D/g, "");

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);

    if (nextCategory === "copier") {
      // copiers CAN be rentable
      setRentable(true);
    } else {
      // parts/toner are NOT rentable
      setRentable(false);
      setRentPrice("");
      setRentCostPerScan("");
      setRentCostPerPrint("");
    }

    if (nextCategory === "copier") {
      setCompatibleCopiers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || !Auth.isAdmin()) return;

    const updatedProduct = {
      _id: thisProduct._id,
      name: name.trim(),
      subtitle: subtitle.trim(),
      model,
      description,
      purchasePrice: Number(purchasePrice),
      rentable,
      rentPrice: rentable ? Number(rentPrice) : null,
      rentCostPerScan: rentable ? Number(rentCostPerScan) : null,
      rentCostPerPrint: rentable ? Number(rentCostPerPrint) : null,
      inStock,
      visibility,
      category,
      images,
      compatibleCopiers: category === "copier" ? [] : compatibleCopiers,
    };

    const ok = await onSubmit?.(updatedProduct);
    if (ok) onClose?.();
  };

  const handlePreview = () => {
    const previewPayload = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      model,
      description,
      purchasePrice: Number(purchasePrice) || 0,
      rentable,
      rentPrice: rentable ? Number(rentPrice) || 0 : 0,
      rentCostPerScan: rentable ? Number(rentCostPerScan) || 0 : 0,
      rentCostPerPrint: rentable ? Number(rentCostPerPrint) || 0 : 0,
      inStock,
      category,
      images,
    };
    localStorage.setItem("productPreview", JSON.stringify(previewPayload));
    window.open("/preview/product", "_blank", "noopener,noreferrer");
  };

  // ---- Images: add/remove/reorder ----
  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setNewImageUrl("");
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDragStart = (idx) => (e) => {
    dragIndexRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (idx) => (e) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    const to = idx;
    if (from === null || to === null || from === to) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
  };

  // Compatible copiers checkbox toggle
  const toggleCompatibleCopier = (id) => {
    setCompatibleCopiers((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const categoryLabels = {
    copier: t("admin.forms.categories.copier"),
    part: t("admin.forms.categories.part"),
    toner: t("admin.forms.categories.toner"),
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 grid place-items-center p-4"
      >
        <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-bold text-[#00294D]">
              {t("admin.forms.editProductTitle")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={t("admin.forms.close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 overflow-y-auto flex-1"
          >
            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.name")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder={t("admin.forms.namePlaceholder")}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Subtitle / Model */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.subtitle")}
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder={t("admin.forms.subtitlePlaceholder")}
                />
                {fieldErrors.subtitle && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.subtitle}
                  </p>
                )}
              </div>
              {/* Model */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.modelNumber")}
                </label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder={t("admin.forms.modelPlaceholder")}
                />
                {fieldErrors.model && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.model}
                  </p>
                )}
              </div>

              {/* Description (rich text) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.description")}
                </label>
                <RichTextField value={description} onChange={setDescription} />
                <p className="mt-1 text-xs text-gray-500">
                  {t("admin.forms.descriptionHint")}
                </p>
                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <span className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.category")}
                </span>
                <div className="flex items-center gap-4">
                  {["copier", "part", "toner"].map((c) => (
                    <label
                      key={c}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        className="h-4 w-4"
                        checked={category === c}
                        onChange={() => handleCategoryChange(c)}
                      />
                      <span>{categoryLabels[c]}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.category && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <span className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.stock")}
                </span>
                <select
                  value={String(inStock)}
                  onChange={(e) => setInStock(e.target.value === "true")}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                >
                  <option value="true">{t("admin.forms.inStock")}</option>
                  <option value="false">{t("admin.forms.outOfStock")}</option>
                </select>
                {fieldErrors.inStock && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.inStock}
                  </p>
                )}
                <span className="block text-sm font-semibold text-[#00294D] mb-1 mt-4">
                  {t("admin.forms.visibility")}
                </span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                >
                  <option value="active">{t("admin.forms.active")}</option>
                  <option value="archived">{t("admin.forms.archived")}</option>
                </select>
                {fieldErrors.visibility && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.visibility}
                  </p>
                )}
              </div>

              {/* Purchase Price (COP) */}
              <div>
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  {t("admin.forms.purchasePrice")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    editingPurchase
                      ? purchasePrice
                      : purchasePrice
                        ? formatCOP(purchasePrice)
                        : ""
                  }
                  onFocus={() => setEditingPurchase(true)}
                  onBlur={() => setEditingPurchase(false)}
                  onChange={(e) => setPurchasePrice(onlyDigits(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder="$0"
                />
                {fieldErrors.purchasePrice && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.purchasePrice}
                  </p>
                )}
              </div>

              {/* Rentable toggle + Rent price (only for copiers) */}
              {category === "copier" && (
                <>
                  {/* Rentable toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="rentable"
                      type="checkbox"
                      checked={rentable}
                      onChange={(e) => setRentable(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="rentable"
                      className="text-sm text-[#00294D] font-semibold"
                    >
                      {t("admin.forms.rentable")}
                    </label>
                  </div>

                  {/* Rent Price (COP / month) */}
                  <div
                    className={`${
                      rentable ? "" : "opacity-50"
                    } transition-opacity`}
                  >
                    <label className="block text-sm font-semibold text-[#00294D] mb-1">
                      {t("admin.forms.rentPrice")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!rentable}
                      value={
                        editingRent
                          ? rentPrice
                          : rentPrice
                            ? formatCOP(rentPrice)
                            : ""
                      }
                      onFocus={() => setEditingRent(true)}
                      onBlur={() => setEditingRent(false)}
                      onChange={(e) => setRentPrice(onlyDigits(e.target.value))}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20 disabled:bg-gray-100"
                      placeholder="$0"
                    />
                    {fieldErrors.rentPrice && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.rentPrice}
                      </p>
                    )}
                  </div>

                  {/* Rent Cost Per Scan / Print */}
                  <div
                    className={`${
                      rentable ? "" : "opacity-50"
                    } transition-opacity`}
                  >
                    <label className="block text-sm font-semibold text-[#00294D] mb-1">
                      {t("admin.forms.rentCostPerScan")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!rentable}
                      value={
                        editingRentCostPerScan
                          ? rentCostPerScan
                          : rentCostPerScan
                            ? formatCOP(rentCostPerScan)
                            : ""
                      }
                      onFocus={() => setEditingRentCostPerScan(true)}
                      onBlur={() => setEditingRentCostPerScan(false)}
                      onChange={(e) =>
                        setRentCostPerScan(onlyDigits(e.target.value))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20 disabled:bg-gray-100"
                      placeholder="$0"
                    />
                    {fieldErrors.rentCostPerScan && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.rentCostPerScan}
                      </p>
                    )}
                  </div>

                  <div
                    className={`${
                      rentable ? "" : "opacity-50"
                    } transition-opacity`}
                  >
                    <label className="block text-sm font-semibold text-[#00294D] mb-1">
                      {t("admin.forms.rentCostPerPrint")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!rentable}
                      value={
                        editingRentCostPerPrint
                          ? rentCostPerPrint
                          : rentCostPerPrint
                            ? formatCOP(rentCostPerPrint)
                            : ""
                      }
                      onFocus={() => setEditingRentCostPerPrint(true)}
                      onBlur={() => setEditingRentCostPerPrint(false)}
                      onChange={(e) =>
                        setRentCostPerPrint(onlyDigits(e.target.value))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20 disabled:bg-gray-100"
                      placeholder="$0"
                    />
                    {fieldErrors.rentCostPerPrint && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.rentCostPerPrint}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Compatible Copiers (for parts/toner) */}
              {category !== "copier" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#00294D] mb-1">
                    {t("admin.forms.compatibleCopiers")}
                  </label>

                  <div className="max-h-64 overflow-y-auto rounded border border-gray-300">
                    {copierOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {t("admin.forms.noCopiers")}
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {copierOptions.map((c) => {
                          const id = c.id ?? c._id;
                          const checked = compatibleCopiers.includes(id);

                          return (
                            <CompatibleCopierCard
                              key={id}
                              copier={c}
                              checked={checked}
                              onToggle={() => toggleCompatibleCopier(id)}
                            />
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t("admin.forms.compatibleHint")}
                  </p>
                  {fieldErrors.compatibleCopiers && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.compatibleCopiers}
                    </p>
                  )}
                </div>
              )}

              {/* Images: previews + add another URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-2">
                  {t("admin.forms.images")}
                </label>

                {/* Thumbs */}
                {images.length > 0 && (
                  <ul className="mb-3 flex flex-wrap gap-3">
                    {images.map((url, idx) => (
                      <li
                        key={url + idx}
                        className="relative h-20 w-20 overflow-hidden rounded border border-gray-200 bg-white"
                        draggable
                        onDragStart={onDragStart(idx)}
                        onDragOver={onDragOver}
                        onDrop={onDrop(idx)}
                        title={t("admin.forms.dragToReorder")}
                      >
                        {/* img */}
                        <img
                          src={url}
                          alt={`product-${idx}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                        {/* remove */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 rounded-full bg-white shadow p-1 hover:bg-gray-50"
                          aria-label={t("admin.forms.removeImage")}
                          title={t("admin.forms.removeImage")}
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* New URL input + add */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                    placeholder={t("admin.forms.imageUrlPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="rounded bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:opacity-50"
                    disabled={!newImageUrl.trim()}
                  >
                    {t("admin.forms.addImage")}
                  </button>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {t("admin.forms.dragHint")}
                </p>
                {fieldErrors.images && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.images}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                {t("admin.forms.preview")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                {t("admin.forms.cancel")}
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-lg bg-[#00294D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:opacity-50"
              >
                {t("admin.forms.saveProduct")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
