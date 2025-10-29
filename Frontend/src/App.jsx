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
import EmployeeDetail from "@/pages/HR/Employee/EmployeeDetail";
import AddEmployee from "./pages/HR/Employee/AddEmployee";

import HRDashboard from "@/pages/HR/Dashboard";
import PMDashboard from "./pages/PM/Dashboard";

// Layout
import AppLayout from "@/components/layouts/AppLayout";
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

        {/* Redirect default ke /login */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
