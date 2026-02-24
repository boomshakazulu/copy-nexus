import ProductCard from "../components/ProductCard";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { http } from "../utils/axios";
import { useI18n } from "../i18n";
import useDebounce from "../utils/useDebounce";

export default function CopiersPage() {
  const { t } = useI18n();
  const [copiers, setCopiers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copierColorMode, setCopierColorMode] = useState("");
  const [filterMultifunction, setFilterMultifunction] = useState(false);
  const [filterHighVolume, setFilterHighVolume] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const fetchCopiers = async () => {
    try {
      setIsLoading(true);
      const copiers = await http.get("/products", {
        params: {
          category: "copier",
          visibility: "active",
          copierColorMode: copierColorMode || undefined,
          copierMultifunction: filterMultifunction ? "true" : undefined,
          copierHighVolume: filterHighVolume ? "true" : undefined,
          model: debouncedQuery.trim() || undefined,
        },
      });
      if (copiers.data) {
        setCopiers(copiers.data.data);
        setError("");
      }
    } catch (err) {
      setError(t("copiers.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCopiers();
  }, [copierColorMode, filterMultifunction, filterHighVolume, debouncedQuery]);

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
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={copierColorMode}
              onChange={(e) => setCopierColorMode(e.target.value)}
              className="appearance-none bg-[#FFCB05] text-[#00294D] font-semibold px-4 py-2 pr-10 rounded-md focus:outline-none"
            >
              <option value="">{t("copiers.filterAll")}</option>
              <option value="blackWhite">{t("copiers.filterMono")}</option>
              <option value="color">{t("copiers.filterColor")}</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#00294D]">
                <input
                  type="checkbox"
                  checked={filterMultifunction}
                  onChange={(e) => setFilterMultifunction(e.target.checked)}
                />
                {t("copiers.filterMultifunction")}
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#00294D]">
                <input
                  type="checkbox"
                  checked={filterHighVolume}
                  onChange={(e) => setFilterHighVolume(e.target.checked)}
                />
                {t("copiers.filterHighVolume")}
              </label>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={t("copiers.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Copier Grid */}
      {error && (
        <p className="text-sm text-red-600 font-semibold">{error}</p>
      )}
      {!error && isLoading && (
        <p className="text-sm text-gray-500">{t("copiers.loading")}</p>
      )}
      {!error && !isLoading && copiers.length === 0 && (
        <p className="text-sm text-gray-500">{t("copiers.empty")}</p>
      )}
      {!error && !isLoading && copiers.length > 0 && (
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
      )}
    </div>
  );
}
