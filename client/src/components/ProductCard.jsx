import { formatCOP } from "../utils/helpers";
import { useI18n } from "../i18n";
import { useCart } from "../context/CartContext";

export default function ProductCard({
  _id,
  id,
  name,
  subtitle,
  model,
  purchasePrice,
  rentPrice,
  inStock,
  images,
  rentable,
  description,
  showPrice = true,
  showStock = true,
  showDescription = false,
  showAddToCart = false,
  onAddToCart,
}) {
  const { t } = useI18n();
  const { addItem, isInCart } = useCart();
  const itemId = _id ?? id ?? null;
  const inCart = itemId ? isInCart(itemId) : false;
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }
    if (!itemId) return;
    addItem({
      _id: itemId,
      name,
      subtitle,
      model,
      purchasePrice,
      rentPrice,
      inStock,
      images,
      rentable,
      description,
      cartMode: "buy",
      quantity: 1,
    });
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="mb-4 grid place-items-center rounded-lg bg-[#F8FAFC] p-6">
        <img src={images[0]} alt={name} className="h-28 object-contain" />
      </div>

      {/* Title & subtitle */}
      <h3 className="text-lg font-extrabold text-[#00294D] leading-tight">
        {name}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 -mt-0.5 mb-2">{subtitle}</p>
      )}

      {showDescription && description && (
        <div
          className="text-sm text-gray-600 mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {/* Prices */}
      {showPrice && (
        <div className="mb-4 space-y-1">
          <div className="text-lg font-bold text-[#00294D] text-nowrap">
            {t("productCard.purchase")}:{" "}
            <span className="font-extrabold">{formatCOP(purchasePrice)}</span>
          </div>
          {rentable && rentPrice && (
            <div className="text-sm font-semibold text-[#555] text-nowrap">
              {t("productCard.rent")}:{" "}
              <span className="font-bold text-[#00294D]">
                {formatCOP(rentPrice)} {t("productCard.perMonth")}
              </span>
            </div>
          )}
          {showAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={inCart}
              className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                inCart
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#00294D] hover:bg-[#003B66]"
              }`}
            >
              {inCart ? t("cart.addedToCart") : t("cart.addToCart")}
            </button>
          )}
        </div>
      )}

      {/* Stock Badge */}
      {showStock && (
        <span
          className={`mt-auto rounded-full px-3 py-1 text-xs font-semibold max-w-20 text-center ${
            inStock ? "bg-[#1B5E20] text-white" : "bg-[#E53935] text-white"
          }`}
        >
          {inStock ? t("productCard.inStock") : t("productCard.outOfStock")}
        </span>
      )}
    </div>
  );
}
