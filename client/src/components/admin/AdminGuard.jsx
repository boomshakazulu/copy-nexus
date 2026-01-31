import { Navigate } from "react-router-dom";
import Auth from "../../utils/auth";

export default function AdminGuard({ children }) {
  if (!Auth.loggedIn() || !Auth.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
