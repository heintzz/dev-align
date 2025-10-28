import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

// Pages
import Kanban from "@/pages/Kanban";
import Login from "@/pages/auth/Login"; // pastikan path-nya sesuai
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ManageEmployee from "@/pages/HR/ManageEmployee";
import HRDashboard from "@/pages/HR/Dashboard"
import PMDashboard from "./pages/PM/Dashboard";

// Layout
import AppLayout from "@/components/layouts/AppLayout";

function App() {
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
