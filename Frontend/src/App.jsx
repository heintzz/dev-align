import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Components
import CustomToaster from "@/components/CustomToaster";

// Pages
import Kanban from "@/pages/Kanban";
import Login from "@/pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ManageEmployee from "@/pages/HR/Employee/ManageEmployee";
import EmployeeDetail from "./pages/HR/Employee/EmployeeDetail";
import AddEmployee from "./pages/HR/Employee/AddEmployee";
import HRDashboard from "@/pages/HR/Dashboard";
import PMDashboard from "./pages/PM/Dashboard";
import StaffDashboard from "./pages/Staff/Dashboard";
import CreateProject from "./pages/PM/CreateProject";
import ListProjects from "./pages/PM/ListProject";

// Layout
import AppLayout from "@/components/layouts/AppLayout";
// import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import Inbox from "@/pages/Inbox";

function App() {
  const { token, role } = useAuthStore();

  return (
    <>
      <Router>
        <Routes>
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
            path="/team/reqapprove"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Inbox />
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
