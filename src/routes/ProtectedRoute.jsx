import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader loading={true} />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
