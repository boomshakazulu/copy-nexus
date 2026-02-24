import { useI18n } from "../../i18n";
import SmartImage from "../SmartImage";

export default function CompatibleCopierCard({ copier, checked, onToggle }) {
  const { t } = useI18n();
  const { name, model, subtitle, images } = copier;

  const displayModel = model || subtitle || t("admin.compatibility.noModel");

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
          <SmartImage
            src={images[0] || "/placeholder.png"}
            alt={name || t("admin.compatibility.imageAlt")}
            fallbackSrc="/placeholder.png"
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#00294D]">
            {name || t("admin.compatibility.unnamed")}
          </span>
          <span className="text-xs text-gray-600">
            {t("admin.compatibility.modelLabel")} {displayModel}
          </span>
        </div>
      </div>
    </li>
  );
}
