import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Pages
import Kanban from "@/pages/Kanban";
import Login from "@/pages/auth/Login"; // pastikan path-nya sesuai
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ManageEmployee from "@/pages/HR/ManageEmployee";
import HRDashboard from "@/pages/HR/Dashboard";
import PMDashboard from "./pages/PM/Dashboard";
import StaffDashboard from "./pages/Staff/Dashboard";
import CreateProject from "./pages/PM/CreateProject";

// Layout
import AppLayout from "@/components/layouts/AppLayout";
import { useEffect, useState } from "react";

function App() {
  const [role, setRole] = useState("");
  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);
  return (
    <Router>
      <Routes>
        {/* Halaman Login tanpa layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Halaman dengan layout utama */}
        <Route
          path="/kanban"
          element={
            <AppLayout>
              <Kanban />
            </AppLayout>
          }
        />

        <Route
          path="/dashboard-hr"
          element={
            <AppLayout>
              {role == "hr" ? (
                <HRDashboard />
              ) : role == "manager" ? (
                <PMDashboard />
              ) : (
                <Kanban />
              )}
            </AppLayout>
          }
        />

        <Route
          path="/employees"
          element={
            <AppLayout>
              <ManageEmployee />
            </AppLayout>
          }
        />

        <Route
          path="/employees/detail/:id"
          element={
            <AppLayout>
              <EmployeeDetail />
            </AppLayout>
          }
        />

        <Route
          path="/addEmployee"
          element={
            <AppLayout>
              <AddEmployee />
            </AppLayout>
          }
        />

        <Route
          path="/create-project"
          element={
            <AppLayout>
              <CreateProject />
            </AppLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <AppLayout>
              <ListProjects />
            </AppLayout>
          }
        />

        {/* Redirect default ke /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
