import { useState, useEffect } from "react";
import AddProductModal from "../../components/admin/AddProductModal";
import ProductCard from "../../components/ProductCard";
import { http } from "../../utils/axios";
import EditProductModal from "../../components/admin/EditProductModal";
import auth from "../../utils/auth";
import { useI18n } from "../../i18n";

export default function Products() {
  const { t } = useI18n();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiers, setCopiers] = useState([]);
  const [thisProduct, setThisProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("copier");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [items, setItems] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: 20, hasNext: false },
    sort: { field: "createdAt", order: "desc" },
    filter: {},
  });

  const fetchProducts = async (category) => {
    try {
      const res = await http.get("/products", {
        params: {
          category,
        },
      });
      if (res.data) {
        setItems(res.data);
        setError("");
      }
    } catch (_err) {
      setError(t("admin.products.loadFailed"));
    }
  };

  const fetchCopierOptions = async () => {
    try {
      const res = await http.get("/products", {
        params: { category: "copier" },
      });
      if (res.data) {
        setCopiers(res.data.data || []);
        setError("");
      }
    } catch (_err) {
      setError(t("admin.products.loadFailed"));
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    fetchCopierOptions();
  }, []);

  const clearFormErrors = () => {
    setFormError("");
    setFieldErrors({});
  };

  const translateErrorMessage = (msg) => {
    if (!msg) return t("admin.errors.invalid");
    if (msg === "Required") return t("admin.errors.required");
    if (msg === "Must be a non-empty string") return t("admin.errors.nonEmpty");
    if (msg.startsWith("Must be one of:")) return t("admin.errors.oneOf");
    if (msg === "Must be a number") return t("admin.errors.number");
    if (msg === "Must be >= 0") return t("admin.errors.nonNegative");
    if (msg.toLowerCase().includes("required when rentable is true"))
      return t("admin.errors.requiredWhenRentable");
    if (msg.toLowerCase().includes("valid urls"))
      return t("admin.errors.imagesUrl");
    if (msg === "Must be an array") return t("admin.errors.array");
    if (msg === "Must be an array of strings")
      return t("admin.errors.arrayOfStrings");
    return t("admin.errors.invalid");
  };

  const normalizeFieldErrors = (details) => {
    if (!details || typeof details !== "object" || Array.isArray(details)) {
      return {};
    }
    const entries = Object.entries(details).filter(
      ([key]) => key !== "fields"
    );
    return Object.fromEntries(
      entries.map(([field, msg]) => [field, translateErrorMessage(msg)])
    );
  };

  const openEditModal = async (p) => {
    clearFormErrors();
    setThisProduct(p);
    setIsEditOpen(true);
  };

  const handleEditProduct = async (updatedProduct) => {
    if (updatedProduct) {
      try {
        clearFormErrors();
        const token = auth.getToken();
        const res = await http.put("/admin/product", updatedProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const saved = res.data;

        if (saved) {
          setItems((prev) => {
            if (!prev || !Array.isArray(prev.data)) {
              // nothing to update, keep previous state
              return prev;
            }

            const updatedData = prev.data.map((p) =>
              p._id === saved._id ? { ...p, ...saved } : p
            );

            return {
              ...prev,
              data: updatedData,
            };
          });

          console.log(res.data);
          setError("");
          return true;
        }
      } catch (_err) {
        const details = _err?.details;
        if (details?.fields?.length) {
          setFormError(
            t("admin.products.unknownFields", {
              fields: details.fields.join(", "),
            })
          );
        } else if (details) {
          setFormError(t("admin.products.validationFailed"));
          setFieldErrors(normalizeFieldErrors(details));
        } else {
          setFormError(t("admin.products.saveFailed"));
        }
        return false;
      }
    }
    return false;
  };

  const handleProduct = async (product) => {
    if (product) {
      if (product) {
        try {
          clearFormErrors();
          const token = auth.getToken();
          const res = await http.post("/admin/product", product, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const savedProduct = res.data;
          ("");
          if (savedProduct.category === "copier") {
            setCopiers((prev) => {
              if (!prev) return [savedProduct];
              return [savedProduct, ...prev];
            });
          }

          setItems((prev) => {
            if (!prev) {
              // Just in case items was null initially
              return {
                data: savedProduct.category === activeCategory ? [savedProduct] : [],
                pagination: { total: 1, page: 1, limit: 20, hasNext: false },
                sort: { field: "createdAt", order: "desc" },
                filter: {},
              };
            }

            const prevData = prev.data || [];
            const prevPagination = prev.pagination || {};
            const limit = prevPagination.limit ?? 20;
            const shouldAdd = savedProduct.category === activeCategory;
            const newTotal = shouldAdd
              ? (prevPagination.total ?? prevData.length) + 1
              : prevPagination.total ?? prevData.length;

            return {
              ...prev,
              data: shouldAdd ? [savedProduct, ...prevData] : prevData,
              pagination: {
                ...prevPagination,
                total: newTotal,
                hasNext: newTotal > limit,
              },
            };
          });
          setError("");
          return true;
        } catch (_err) {
          const details = _err?.details;
          if (details?.fields?.length) {
            setFormError(
              t("admin.products.unknownFields", {
                fields: details.fields.join(", "),
              })
            );
          } else if (details) {
            setFormError(t("admin.products.validationFailed"));
            setFieldErrors(normalizeFieldErrors(details));
          } else {
            setFormError(t("admin.products.saveFailed"));
          }
          return false;
        }
      } else {
        return;
      }
    } else {
      return;
    }
  };

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#00294D]">
          {t("admin.products.title")}
        </h1>
        <button
          onClick={() => {
            clearFormErrors();
            setIsAddOpen(true);
          }}
          className="bg-[#00294D] hover:bg-[#003B66] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          {t("admin.products.addProduct")}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "copier", label: t("admin.forms.categories.copier") },
          { key: "part", label: t("admin.forms.categories.part") },
          { key: "toner", label: t("admin.forms.categories.toner") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === tab.key
                ? "bg-[#00294D] text-white"
                : "bg-gray-100 text-[#00294D] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 font-semibold">{error}</p>
      )}

      {/* …filters + search… */}

      {items.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.data.map((p) => (
            <button
              className="pointer-events-auto h-full"
              onClick={() => openEditModal(p)}
              key={p._id}
            >
              <ProductCard {...p} />
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => {
          clearFormErrors();
          setIsAddOpen(false);
        }}
        onSubmit={handleProduct}
        formError={formError}
        fieldErrors={fieldErrors}
        copierOptions={copiers}
      />
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => {
          clearFormErrors();
          setIsEditOpen(false);
        }}
        onSubmit={handleEditProduct}
        formError={formError}
        fieldErrors={fieldErrors}
        copierOptions={copiers}
        thisProduct={thisProduct}
      />
    </div>
  );
}
