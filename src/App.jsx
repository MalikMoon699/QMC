import { Routes, Route, Navigate } from "react-router-dom";
import "./assets/styles/style.css";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Unauthorized from "./components/Unauthorized";
import AppLayout from "./layout/AppLayout";
import ProfileDetails from "./pages/ProfileDetails";
import UsersDashboard from "./pages/UsersDashboard";
import SellersDashboard from "./pages/SellersDashboard";
import { useAuth } from "./context/AuthContext";
import Mobiles from "./pages/Mobiles";
import Users from "./pages/Users";
import SmartWatches from "./pages/SmartWatches";
import Accessories from "./pages/Accessories";
import AboutUs from "./pages/AboutUs";

const App = () => {
  const { role, hasProfileDetails, loading } = useAuth();

  const getDashboardComponent = () => {
    if (loading) return <Loader loading={true} />;
    if (!role) return <Navigate to="/login" replace />;
    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "seller":
        return <SellersDashboard />;
      case "user":
        return <UsersDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signUp"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/profileDetails"
        element={
          <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
            {!hasProfileDetails ? (
              <ProfileDetails />
            ) : (
              <Navigate to="/" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
              {getDashboardComponent()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
              <Mobiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Users"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watches"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
              <SmartWatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accessories"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
              <Accessories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aboutUs"
          element={
            <ProtectedRoute allowedRoles={["admin", "seller", "user"]}>
              <AboutUs />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
