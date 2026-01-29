import ProductCard from "../components/ProductCard";
import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { http } from "../utils/axios";
import { useI18n } from "../i18n";

export default function CopiersPage() {
  const { t } = useI18n();
  const [copiers, setCopiers] = useState([]);

  const fetchCopiers = async () => {
    try {
      const copiers = await http.get("/products", {
        params: {
          category: "copier",
        },
      });
      console.log(copiers.data);
      if (copiers.data) {
        setCopiers(copiers.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCopiers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl pb-2 font-extrabold text-[#00294D]">
            {t("copiers.title")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("copiers.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 w-full">
          <div className="relative">
            <select className="appearance-none bg-[#FFCB05] text-[#00294D] font-semibold px-4 py-2 pr-10 rounded-md focus:outline-none">
              <option>{t("copiers.filterAll")}</option>
              <option>{t("copiers.filterColor")}</option>
              <option>{t("copiers.filterMono")}</option>
              <option>{t("copiers.filterHighVolume")}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00294D] pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={t("copiers.searchPlaceholder")}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Copier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 bg-white rounded-xl shadow-md overflow-hidden">
        {copiers.map((copier) => (
          <Link
            key={copier._id}
            to={`/products/${copier._id}`}
            className="h-full"
          >
            <ProductCard {...copier} />
          </Link>
        ))}
      </div>
    </div>
  );
}
