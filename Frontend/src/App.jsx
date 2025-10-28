import Kanban from "@/pages/Kanban";
import ManageEmployee from "@/pages/HR/ManageEmployee";

import AppLayout from "@/components/layouts/AppLayout";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <AppLayout>
          {/* <Kanban /> */}
          <ManageEmployee />
        </AppLayout>
      </Router>
    </>
  );
}

export default App;
