import { ThumbsUp, Headphones, Users } from "lucide-react";
import { useI18n } from "../i18n";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-[#00294D] mb-6">
        {t("about.title")}
      </h1>

      {/* Subheading */}
      <h2 className="text-2xl font-semibold text-[#00294D] mb-4">
        {t("about.subtitle")}
      </h2>

      {/* Description */}
      <p className="text-gray-700 mb-4">
        {t("about.description1")}
      </p>
      <p className="text-gray-700 mb-12">
        {t("about.description2")}
      </p>

      {/* Feature Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {/* Feature 1 */}
        <div>
          <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">
            {t("about.features.quality")}
          </h3>
        </div>

        {/* Feature 2 */}
        <div>
          <div className="bg-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">
            {t("about.features.service")}
          </h3>
        </div>

        {/* Feature 3 */}
        <div>
          <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">
            {t("about.features.team")}
          </h3>
        </div>
      </div>
    </div>
  );
}
