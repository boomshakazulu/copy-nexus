import ProductCard from "../components/ProductCard";
import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Products() {
  const products = [
    {
      id: 1,
      name: "Copier Model 1",
      purchasePrice: 12000000,
      rentPrice: 2400000,
      img: "/copier.png",
      status: "in",
    },
    {
      id: 2,
      name: "Copier Model 2",
      purchasePrice: 24000000,
      rentPrice: 2400000,
      img: "/copier.png",
    },
    {
      id: 3,
      name: "Copier Model 3",
      purchasePrice: 18000000,
      rentPrice: 2400000,
      img: "/copier.png",
      status: "in",
    },
    {
      id: 4,
      name: "Copier Model 4",
      purchasePrice: 26000000,
      rentPrice: 2400000,
      img: "/copier.png",
    },
    {
      id: 5,
      name: "Part Model 1",
      purchasePrice: 500000,
      img: "/part.png",
    },
    {
      id: 6,
      name: "Part Model 2",
      purchasePrice: 380000,
      img: "/part.png",
    },
    {
      id: 7,
      name: "Toner Model 1",
      purchasePrice: 800000,
      img: "/toner.png",
    },
    {
      id: 8,
      name: "Toner Model 2",
      purchasePrice: 300000,
      img: "/toner.png",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-row flex-wrap justify-between items-center mb-10 gap-6">
        <h1 className="text-4xl pb-4 font-extrabold text-[#00294D]">
          Products
        </h1>

        <div className="flex flex-wrap justify-between items-center gap-4 w-full">
          <div className="relative">
            <select className="appearance-none bg-[#FFCB05] text-[#00294D] font-semibold px-4 py-2 pr-10 rounded-md focus:outline-none">
              <option>Category</option>
              <option>Copiers</option>
              <option>Parts</option>
              <option>Toner</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00294D] pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by model number"
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 bg-white rounded-xl shadow-md overflow-hidden">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`}>
            <ProductCard {...p} />
          </Link>
        ))}
      </div>
    </div>
  );
}
