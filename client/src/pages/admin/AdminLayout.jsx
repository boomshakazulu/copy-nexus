import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center bg-white">
      {/* Card wrapper keeps sidebar & content same height */}
      <div className="flex w-full bg-white rounded-xl shadow-md overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={open} onClose={() => setOpen(false)} />

        {/* Main */}
        <main className="flex-1">
          {/* Mobile top bar to open the drawer */}
          <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[#00294D] font-bold">Admin</span>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
