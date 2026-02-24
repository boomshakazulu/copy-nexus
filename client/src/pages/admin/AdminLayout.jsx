import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { useI18n } from "../../i18n";

export default function AdminLayout() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center bg-white">
      {/* Card wrapper keeps sidebar & content same height */}
      <div className="flex w-full min-h-screen bg-white rounded-xl shadow-md overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={open} onClose={() => setOpen(false)} />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Mobile top bar to open the drawer */}
          <div className="md:hidden p-4 border-b border-gray-200 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={t("admin.openMenu")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[#00294D] font-bold">
              {t("admin.admin")}
            </span>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
