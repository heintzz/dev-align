import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

function SpecificRoleRoute({ children, requiredRole }) {
  const { token, role } = useAuthStore();
  return token ? requiredRole != role ? <Navigate to="/dashboard" replace /> : children : children;
}

export default SpecificRoleRoute;
