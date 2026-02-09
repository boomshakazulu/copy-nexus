import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import App from "./App";
import "./index.css";
import { I18nProvider } from "./i18n";

import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import CopiersPage from "./pages/CopiersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PartsAccessoriesPage from "./pages/PartsAccessoriesPage";
import MaintenancePage from "./pages/MaintenancePage";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Reports from "./pages/admin/Reports";
import AdminGuard from "./components/admin/AdminGuard";
import CartPage from "./pages/CartPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import { CartProvider } from "./context/CartContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: "",
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/copiers",
        element: <CopiersPage />,
      },
      {
        path: "/parts",
        element: <PartsAccessoriesPage />,
      },
      {
        path: "/maintenance",
        element: <MaintenancePage />,
      },
      {
        path: "/products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "/admin",
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "/admin/orders", element: <Orders /> },
          { path: "/admin/products", element: <Products /> },
          { path: "/admin/reports", element: <Reports /> },
        ],
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/order-confirmation",
        element: <OrderConfirmationPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </I18nProvider>
  </React.StrictMode>
);
