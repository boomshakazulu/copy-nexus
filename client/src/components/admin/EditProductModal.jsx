import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { formatCOP } from "../../utils/helpers";
import RichTextField from "./RichTextField";
import CompatibleCopierCard from "./CompatibleCopierCard";
import Auth from "../../utils/auth";

export default function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  copierOptions = [], // ← array of copiers from DB
  thisProduct,
}) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("copier"); // copiers | parts | toner
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("active");

  // COP fields + editing flags
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rentable, setRentable] = useState(true);
  const [rentPrice, setRentPrice] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(false);
  const [editingRent, setEditingRent] = useState(false);

  // Compatible copiers (for parts/toner)
  const [compatibleCopiers, setCompatibleCopiers] = useState([]);

  // Images
  const [images, setImages] = useState([]); // array of URLs
  const [newImageUrl, setNewImageUrl] = useState(""); // input below previews
  const dragIndexRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(thisProduct.name || "");
      setSubtitle(thisProduct.subtitle || "");
      setModel(thisProduct.model || "");
      setCategory(thisProduct.Category || "copier");
      setInStock(thisProduct.inStock || true);
      setPurchasePrice(thisProduct.purchasePrice?.toString() || "");
      setRentable(thisProduct.rentable || true);
      setRentPrice(thisProduct.rentPrice?.toString() || "");
      setImages(thisProduct.images || []);
      setNewImageUrl("");
      setDescription(thisProduct.description || "");
      setCompatibleCopiers(thisProduct.compatibleCopiers || []);
      setVisibility(thisProduct.visibility || "active");
    }
  }, [isOpen, thisProduct]);

  if (!isOpen) return null;

  const canSave =
    name.trim() && purchasePrice !== "" && (!rentable || rentPrice !== "");

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
    }

    if (nextCategory === "copier") {
      setCompatibleCopiers([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave || !Auth.isAdmin()) return;

    const updatedProduct = {
      _id: thisProduct._id,
      isNew: true,
      name: name.trim(),
      subtitle: subtitle.trim(),
      model,
      description: description, // ← rich HTML
      purchasePrice: Number(purchasePrice),
      rentPrice: rentable ? Number(rentPrice) : null,
      inStock,
      visibility,
      category,
      images,
      compatibleCopiers: category === "copier" ? [] : compatibleCopiers,
    };

    onSubmit?.(updatedProduct);
    onClose?.();
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

  //Compatible copiers checkbox toggle
  const toggleCompatibleCopier = (id) => {
    setCompatibleCopiers((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
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
            <h2 className="text-xl font-bold text-[#00294D]">Edit Product</h2>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 overflow-y-auto flex-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder="e.g., Canon imageRUNNER 2425"
                />
              </div>

              {/* Subtitle / Model */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  Subtitle
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder="Optional (e.g., M4125idn)"
                />
              </div>
              {/* Model */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  Model Number
                </label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                  placeholder="required(e.g., M4125idn)"
                />
              </div>

              {/* Description (rich text) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  Description
                </label>
                <RichTextField value={description} onChange={setDescription} />
                <p className="mt-1 text-xs text-gray-500">
                  Use bold, italic, lists, and links. You can paste
                  text—formatting will be preserved.
                </p>
              </div>

              {/* Category */}
              <div>
                <span className="block text-sm font-semibold text-[#00294D] mb-1">
                  Category
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
                      <span className="capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <span className="block text-sm font-semibold text-[#00294D] mb-1">
                  Stock
                </span>
                <select
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                >
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <span className="block text-sm font-semibold text-[#00294D] mb-1 mt-4">
                  Visibility
                </span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Purchase Price (COP) */}
              <div>
                <label className="block text-sm font-semibold text-[#00294D] mb-1">
                  Purchase Price (COP)
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
                      Available for Rent
                    </label>
                  </div>

                  {/* Rent Price (COP / month) */}
                  <div
                    className={`${
                      rentable ? "" : "opacity-50"
                    } transition-opacity`}
                  >
                    <label className="block text-sm font-semibold text-[#00294D] mb-1">
                      Rent Price (COP / month)
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
                  </div>
                </>
              )}

              {/* Compatible Copiers (for parts/toner) */}
              {category !== "copier" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#00294D] mb-1">
                    Compatible Copiers
                  </label>

                  <div className="max-h-64 overflow-y-auto rounded border border-gray-300">
                    {copierOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No copiers found.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {copierOptions.map((c) => {
                          // if your backend uses _id, you can swap to c._id here
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
                    Tap to add or remove compatible copiers.
                  </p>
                </div>
              )}

              {/* Images: previews + add another URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#00294D] mb-2">
                  Images
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
                        title="Drag to reorder"
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
                          aria-label="Remove image"
                          title="Remove image"
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
                    placeholder="https://image-url.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="rounded bg-[#00294D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:opacity-50"
                    disabled={!newImageUrl.trim()}
                  >
                    Add
                  </button>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Drag thumbnails to change order. First image becomes the
                  product’s primary image.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-lg bg-[#00294D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003B66] disabled:opacity-50"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
