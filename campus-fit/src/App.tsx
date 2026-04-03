import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardRoutes from "./routes";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<MainLayout />}>
        <Route path="*" element={<DashboardRoutes />} />
      </Route>
    </Routes>
  );
}

export default App;
