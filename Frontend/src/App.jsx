import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Components
import CustomToaster from "@/components/CustomToaster";

// Pages
import Login from "@/pages/auth/Login"; // pastikan path-nya sesuai
import ResetPassword from "@/pages/auth/ResetPassword";
import HRDashboard from "@/pages/HR/Dashboard";
import ManageEmployee from "@/pages/HR/Employee/ManageEmployee";
import Kanban from "@/pages/Shared/Kanban";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AddEmployee from "./pages/HR/Employee/AddEmployee";
import EmployeeDetail from "./pages/HR/Employee/EmployeeDetail";
import CreateProject from "./pages/Shared/Projects/CreateProject";
import PMDashboard from "./pages/PM/Dashboard";
import ListProjects from "./pages/Shared/Projects/ListProject";
import StaffDashboard from "./pages/Staff/Dashboard";
import ProfilePage from "./pages/Shared/Profile";
import ChangePasswordPage from "./pages/auth/ChangePassword";

// Layout
import AppLayout from "@/components/layouts/AppLayout";

import GuestRoute from "@/components/auth/GuestRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import ManagerTeam from "./pages/Shared/TeamManagement";
import Inbox from "@/pages/Shared/Inbox";

function App() {
  const { token, role } = useAuthStore();

  return (
    <>
      <Router>
        <Routes>
          {/* Profile and Change Password */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          {/* Halaman Login tanpa layout */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* Halaman dengan layout utama */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  {role == "hr" ? (
                    <HRDashboard />
                  ) : role == "manager" ? (
                    <PMDashboard />
                  ) : (
                    <StaffDashboard />
                  )}
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kanban/:projectId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Kanban />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ManageEmployee />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/detail/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/addEmployee"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddEmployee />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-project"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateProject />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ListProjects />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcement"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Inbox />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/management"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ManagerTeam />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect default ke /login */}
          <Route
            path="*"
            element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </Router>
      <CustomToaster />
    </>
  );
}

export default App;
