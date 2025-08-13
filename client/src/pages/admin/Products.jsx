import { useState } from "react";
import AddProductModal from "../../components/admin/AddProductModal";
import ProductCard from "../../components/ProductCard";

export default function Products() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Canon",
      subtitle: "imageRUNNER 2425",
      purchasePrice: 3200000,
      rentPrice: 150000,
      status: "in",
      img: "/copier.png",
    },
    {
      id: 2,
      name: "Cyan Toner",
      subtitle: "",
      purchasePrice: 75000,
      rentPrice: null,
      status: "in",
      img: "/toner-cyan.png",
    },
    {
      id: 3,
      name: "Drum Unit",
      subtitle: "",
      purchasePrice: 90000,
      rentPrice: null,
      status: "out",
      img: "/drum.png",
    },
    {
      id: 4,
      name: "Kyocera ECOSYS",
      subtitle: "M4125idn",
      purchasePrice: 2700000,
      rentPrice: 130000,
      status: "in",
      img: "/copier.png",
    },
    {
      id: 5,
      name: "Yellow toner",
      subtitle: "",
      purchasePrice: 50000,
      rentPrice: null,
      status: "in",
      img: "/toner-yellow.svg",
    },
    {
      id: 6,
      name: "Feed Roller",
      subtitle: "",
      purchasePrice: 30000,
      rentPrice: null,
      status: "in",
      img: "/feed-roller.png",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#00294D]">
          Products
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#00294D] hover:bg-[#003B66] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          + Add Product
        </button>
      </div>

      {/* …filters + search… */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {/* Modal */}
      <AddProductModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(product) => setItems((prev) => [product, ...prev])}
      />
    </div>
  );
}
