import { Link, useLocation } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  BarChart,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { useI18n } from "../../i18n";

export default function AdminSidebar({ isOpen, onClose }) {
  const { t } = useI18n();
  const { pathname } = useLocation();

  const links = [
    {
      to: "/admin",
      label: t("admin.sidebar.dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: "/admin/products",
      label: t("admin.sidebar.products"),
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      to: "/admin/orders",
      label: t("admin.sidebar.orders"),
      icon: <FileText className="h-5 w-5" />,
    },
    {
      to: "/admin/rentals",
      label: t("admin.sidebar.rentals"),
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      to: "/admin/reports",
      label: t("admin.sidebar.reports"),
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      to: "/admin/access-logs",
      label: t("admin.sidebar.accessLogs"),
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Scrim (mobile only) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer on mobile, static column on md+ */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow md:shadow-none md:static
          border-r border-gray-200 md:border-r
          flex flex-col p-6
          transform transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="md:hidden self-end -mr-2 mb-4 p-2 rounded hover:bg-gray-100"
          aria-label={t("admin.closeMenu")}
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="space-y-3">
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium
                ${
                  pathname === to
                    ? "bg-gray-100 text-[#00294D]"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
