export default function CompatibleCopierCard({ copier, checked, onToggle }) {
  const { name, modelNumber, subtitle, images } = copier;

  const displayModel = modelNumber || subtitle || "No model number";

  return (
    <li
      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0"
        checked={checked}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()} // avoid double toggle
      />

      <div className="flex items-center gap-3 flex-1">
        <div className="h-12 w-12 rounded border border-gray-200 overflow-hidden bg-gray-100 shrink-0">
          <img
            src={images[0] || "/placeholder.png"}
            alt={name || "Copier image"}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#00294D]">
            {name || "Unnamed copier"}
          </span>
          <span className="text-xs text-gray-600">Model: {displayModel}</span>
        </div>
      </div>
    </li>
  );
}
