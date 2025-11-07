import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
