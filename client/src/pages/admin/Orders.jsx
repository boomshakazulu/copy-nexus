import { useState } from "react";

const ordersData = [
  { id: "#10489", name: "Maria Gomez", date: "Today", status: "SHIPPED" },
  { id: "#10488", name: "John Diaz", date: "Yesterday", status: "PENDING" },
  {
    id: "#10487",
    name: "Laura Perez",
    date: "Apr 21, 2024",
    status: "PENDING",
  },
  {
    id: "#10486",
    name: "Carlos Jimenez",
    date: "Apr 20, 2024",
    status: "PENDING",
  },
  {
    id: "#10485",
    name: "Sofia Reyes",
    date: "Apr 20, 2024",
    status: "PENDING",
  },
  { id: "#10484", name: "Ana Lopez", date: "Apr 19, 2024", status: "SHIPPED" },
  {
    id: "#10483",
    name: "Luis Torres",
    date: "Apr 18, 2024",
    status: "PENDING",
  },
  {
    id: "#10482",
    name: "Camila Vega",
    date: "Apr 17, 2024",
    status: "PENDING",
  },
];

const ITEMS_PER_PAGE = 10;

export default function Orders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = ordersData.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-white p-6 rounded w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#00294D]">Orders</h1>
        <input
          type="text"
          placeholder="Search orders"
          className="border px-4 py-2 rounded text-sm w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-white font-bold text-left">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              currentOrders.map((order, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{order.name}</td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-semibold px-3 py-1 rounded-full inline-block
                        ${
                          order.status === "SHIPPED"
                            ? "bg-[#003B66]"
                            : "bg-[#E53935]"
                        }
                      `}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-[#00294D]">
          <button
            onClick={handlePrev}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
