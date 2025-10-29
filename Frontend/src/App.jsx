import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
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
import ManageEmployee from "@/pages/HR/Employee/ManageEmployee";
import HRDashboard from "@/pages/HR/Dashboard";
import PMDashboard from "./pages/PM/Dashboard";
import StaffDashboard from "./pages/Staff/Dashboard";

// Layout
import AppLayout from "@/components/layouts/AppLayout";
import AddEmployee from "./pages/HR/Employee/AddEmployee";
import { useState } from "react";

function App() {
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [token, setToken] = useState(localStorage.getItem("token"));
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
          path="/dashboard"
          element={
            <AppLayout>
              <HRDashboard />
            </AppLayout>
          }
        />

        <Route
          path="/dashboard-pm"
          element={
            <AppLayout>
              <PMDashboard />
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
