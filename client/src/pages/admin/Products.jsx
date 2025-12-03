import { useState, useEffect } from "react";
import AddProductModal from "../../components/admin/AddProductModal";
import ProductCard from "../../components/ProductCard";
import { http } from "../../utils/axios";
import EditProductModal from "../../components/admin/EditProductModal";

export default function Products() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiers, setCopiers] = useState([]);
  const [thisProduct, setThisProduct] = useState(null);

  const [items, setItems] = useState({
    data: [],
    pagination: { total: 0, page: 1, limit: 20, hasNext: false },
    sort: { field: "createdAt", order: "desc" },
    filter: {},
  });

  const fetchCopiers = async () => {
    try {
      const copiers = await http.get("/products", {
        params: {
          category: "copier",
          search: "canon",
          limit: 20,
        },
      });
      console.log(copiers.data);
      if (copiers.data) {
        setItems(copiers.data);
        setCopiers(copiers.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCopiers();
  }, []);

  const openEditModal = async (p) => {
    setThisProduct(p);
    setIsEditOpen(true);
  };

  const handleEditProduct = async (updatedProduct) => {
    if (updatedProduct) {
      try {
        console.log(updatedProduct);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleProduct = async (product) => {
    if (product) {
      if (product.isNew) {
        try {
          const res = await http.post("/products", product);
          const savedProduct = res.data;
          ("");
          if (savedProduct.category === "copier") {
            setCopiers((prev) => {
              if (!prev) {
                return [savedProduct];
              }
              return [savedProduct, ...prev];
            });
          }

          setItems((prev) => {
            if (!prev) {
              // Just in case items was null initially
              return {
                data: [savedProduct],
                pagination: { total: 1, page: 1, limit: 20, hasNext: false },
                sort: { field: "createdAt", order: "desc" },
                filter: {},
              };
            }

            const prevData = prev.data || [];
            const prevPagination = prev.pagination || {};
            const limit = prevPagination.limit ?? 20;
            const newTotal = (prevPagination.total ?? prevData.length) + 1;

            return {
              ...prev,
              data: [savedProduct, ...prevData],
              pagination: {
                ...prevPagination,
                total: newTotal,
                hasNext: newTotal > limit,
              },
            };
          });
        } catch (err) {
          console.log(err);
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
          Products
        </h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#00294D] hover:bg-[#003B66] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          + Add Product
        </button>
      </div>

      {/* …filters + search… */}

      {items.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.data.map((p) => (
            <button
              className="pointer-events-auto"
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
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleProduct}
        copierOptions={copiers}
      />
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditProduct}
        copierOptions={copiers}
        thisProduct={thisProduct}
      />
    </div>
  );
}
