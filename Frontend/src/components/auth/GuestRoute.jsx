import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

function GuestRoute({ children }) {
  const { token } = useAuthStore();
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default GuestRoute;
