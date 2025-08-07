import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex justify-center bg-white">
      {/* Inner container mimicking a centered card */}
      <div className="flex w-full min-h-full bg-white rounded-xl shadow-md overflow-hidden">
        {/* Sidebar (takes vertical space of content) */}
        <div className="w-64 border-r">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
