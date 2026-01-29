import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function HomePage() {
  const { t } = useI18n();
  const features = [
    {
      title: t("home.features.copiersTitle"),
      icon: "/copier-icon.png",
      to: "/copiers",
      description: t("home.features.copiersDesc"),
    },
    {
      title: t("home.features.partsTitle"),
      icon: "/toner-icon.png",
      to: "/parts",
      description: t("home.features.partsDesc"),
    },
    {
      title: t("home.features.maintenanceTitle"),
      icon: "/parts-icon.png",
      to: "/maintenance",
      description: t("home.features.maintenanceDesc"),
    },
  ];

  return (
    <div className="px-4 max-w-3xl mx-auto">
      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center sm:items-start justify-between gap-4 sm:gap-8 mb-4 sm:mb-16 ">
        {/* Text */}
        <div className="text-center text-left flex-1">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#00294D] leading-tight text-left">
            {t("home.titleLine1")}
          </h1>
          <h1 className="text-5xl sm:text-7xl font-bold text-[#00294D] leading-tight text-left">
            {t("home.titleLine2")}
          </h1>
          <p className="text-2xl mt-2 text-red-600 font-semibold text-left">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Image */}
        <div className="bg-yellow-400 p-4 rounded-md flex-1 max-w-xs">
          <img
            src="/copier.png"
            alt={t("common.copierImageAlt")}
            className="w-full h-auto max-h-80 sm:max-h-70 object-contain mx-auto scale-x-[-1]"
          />
        </div>
      </section>

      {/* PRODUCT FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.to}
            to={feature.to}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <img
              src={feature.icon}
              alt={feature.title}
              className="h-20 mx-auto mb-4"
            />
            <h3 className="text-lg font-bold text-[#00294D] uppercase">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
