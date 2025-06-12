import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader loading={true} />;
  }

  if (currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PublicRoute;
