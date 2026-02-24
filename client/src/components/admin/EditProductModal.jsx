import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { formatCOP } from "../../utils/helpers";
import RichTextField from "./RichTextField";
import CompatibleCopierCard from "./CompatibleCopierCard";
import SmartImage from "../SmartImage";
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
  const [copierColorMode, setCopierColorMode] = useState("blackWhite");
  const [copierMultifunction, setCopierMultifunction] = useState(false);
  const [copierHighVolume, setCopierHighVolume] = useState(false);
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
      setCopierColorMode(thisProduct.copierColorMode || "blackWhite");
      setCopierMultifunction(!!thisProduct.copierMultifunction);
      setCopierHighVolume(!!thisProduct.copierHighVolume);
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
    (category !== "copier" || copierColorMode) &&
    (!rentable ||
      (rentPrice !== "" && rentCostPerScan !== "" && rentCostPerPrint !== ""));

  const onlyDigits = (s) => (s || "").replace(/\D/g, "");

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);

    if (nextCategory === "copier") {
      // copiers CAN be rentable
      setRentable(true);
      if (!copierColorMode) setCopierColorMode("blackWhite");
    } else {
      // parts/toner are NOT rentable
      setRentable(false);
      setRentPrice("");
      setRentCostPerScan("");
      setRentCostPerPrint("");
      setCopierColorMode("");
      setCopierMultifunction(false);
      setCopierHighVolume(false);
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
      copierColorMode: category === "copier" ? copierColorMode : null,
      copierMultifunction: category === "copier" ? copierMultifunction : false,
      copierHighVolume: category === "copier" ? copierHighVolume : false,
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
      copierColorMode: category === "copier" ? copierColorMode : null,
      copierMultifunction: category === "copier" ? copierMultifunction : false,
      copierHighVolume: category === "copier" ? copierHighVolume : false,
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

              {/* Copier Attributes */}
              {category === "copier" && (
                <div className="md:col-span-2">
                  <span className="block text-sm font-semibold text-[#00294D] mb-1">
                    {t("admin.forms.copierAttributes")}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 mb-2">
                        {t("admin.forms.copierColorMode")}
                      </span>
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="copierColorMode"
                            value="blackWhite"
                            checked={copierColorMode === "blackWhite"}
                            onChange={(e) => setCopierColorMode(e.target.value)}
                          />
                          <span>{t("admin.forms.copierTypes.blackWhite")}</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="copierColorMode"
                            value="color"
                            checked={copierColorMode === "color"}
                            onChange={(e) => setCopierColorMode(e.target.value)}
                          />
                          <span>{t("admin.forms.copierTypes.color")}</span>
                        </label>
                      </div>
                      {fieldErrors.copierColorMode && (
                        <p className="mt-1 text-xs text-red-600">
                          {fieldErrors.copierColorMode}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-gray-500 mb-2">
                        {t("admin.forms.copierFeatures")}
                      </span>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={copierMultifunction}
                          onChange={(e) =>
                            setCopierMultifunction(e.target.checked)
                          }
                        />
                        <span>
                          {t("admin.forms.copierTypes.multifunction")}
                        </span>
                      </label>
                    </div>

                    <div className="flex items-start">
                      <label className="inline-flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={copierHighVolume}
                          onChange={(e) =>
                            setCopierHighVolume(e.target.checked)
                          }
                        />
                        <span>{t("admin.forms.copierTypes.highVolume")}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

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
                          : rentCostPerScan !== ""
                            ? formatCOP(Number(rentCostPerScan) || 0)
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
                          : rentCostPerPrint !== ""
                            ? formatCOP(Number(rentCostPerPrint) || 0)
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
                  <ul className="mb-3 flex flex-wrap gap-4">
                    {images.map((url, idx) => (
                      <li
                        key={url + idx}
                        className="relative h-28 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        draggable
                        onDragStart={onDragStart(idx)}
                        onDragOver={onDragOver}
                        onDrop={onDrop(idx)}
                        title={t("admin.forms.dragToReorder")}
                      >
                        {/* img */}
                        <SmartImage
                          src={url}
                          alt={`product-${idx}`}
                          fallbackSrc="/placeholder.png"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover"
                        />

                        {/* primary badge */}
                        {idx === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-[#00294D] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {t("admin.forms.primaryImage")}
                          </span>
                        )}

                        {/* drag handle */}
                        <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#00294D] shadow">
                          {t("admin.forms.dragHandle")}
                        </span>

                        {/* remove */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-md ring-1 ring-gray-200 hover:bg-red-50"
                          aria-label={t("admin.forms.removeImage")}
                          title={t("admin.forms.removeImage")}
                        >
                          <X className="mx-auto h-4 w-4 text-red-600" />
                        </button>

                        {/* move left/right */}
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === 0) return;
                              setImages((prev) => {
                                const next = [...prev];
                                const temp = next[idx - 1];
                                next[idx - 1] = next[idx];
                                next[idx] = temp;
                                return next;
                              });
                            }}
                            className="h-6 w-6 rounded bg-white/90 text-xs font-semibold text-[#00294D] shadow hover:bg-gray-50 disabled:opacity-50"
                            disabled={idx === 0}
                            aria-label={t("admin.forms.moveLeft")}
                            title={t("admin.forms.moveLeft")}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === images.length - 1) return;
                              setImages((prev) => {
                                const next = [...prev];
                                const temp = next[idx + 1];
                                next[idx + 1] = next[idx];
                                next[idx] = temp;
                                return next;
                              });
                            }}
                            className="h-6 w-6 rounded bg-white/90 text-xs font-semibold text-[#00294D] shadow hover:bg-gray-50 disabled:opacity-50"
                            disabled={idx === images.length - 1}
                            aria-label={t("admin.forms.moveRight")}
                            title={t("admin.forms.moveRight")}
                          >
                            →
                          </button>
                        </div>
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
