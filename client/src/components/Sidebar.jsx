import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  BarChart,
} from "lucide-react";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  const links = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard /> },
    { to: "/admin/products", label: "Products", icon: <ShoppingCart /> },
    { to: "/admin/orders", label: "Orders", icon: <FileText /> },
    { to: "/admin/customers", label: "Customers", icon: <Users /> },
    { to: "/admin/reports", label: "Reports", icon: <BarChart /> },
  ];

  return (
    <aside className="w-64 bg-white shadow min-h-full flex flex-col p-6">
      <nav className="space-y-4">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium ${
              pathname === to ? "bg-gray-100 text-[#00294D]" : "text-gray-700"
            } hover:bg-gray-100`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
