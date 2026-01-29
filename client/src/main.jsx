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

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Reports from "./pages/admin/Reports";

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
        path: "/products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "/admin/orders", element: <Orders /> },
          { path: "/admin/products", element: <Products /> },
          { path: "/admin/reports", element: <Reports /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  </React.StrictMode>
);
