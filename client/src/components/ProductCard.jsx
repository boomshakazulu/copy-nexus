import { formatCOP } from "../utils/helpers";

export default function ProductCard({
  name,
  subtitle,
  purchasePrice,
  rentPrice,
  inStock,
  images,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Prices */}
      <div className="mb-4 space-y-1">
        <div className="text-lg font-bold text-[#00294D] text-nowrap">
          Purchase:{" "}
          <span className="font-extrabold">{formatCOP(purchasePrice)}</span>
        </div>
        {rentPrice && (
          <div className="text-sm font-semibold text-[#555] text-nowrap">
            Rent:{" "}
            <span className="font-bold text-[#00294D]">
              {formatCOP(rentPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Badge */}
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          inStock ? "bg-[#1B5E20] text-white" : "bg-[#E53935] text-white"
        }`}
      >
        {inStock ? "in Stock" : "Out of Stock"}
      </span>
    </div>
  );
}
