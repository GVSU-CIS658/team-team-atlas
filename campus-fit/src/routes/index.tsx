import { Route, Routes } from "react-router-dom";
import DashboardPage from "../features/dashboard/page/DashbaordPage";
import GoalsPage from "../features/goals/pages/GoalsPage";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="goals" element={<GoalsPage />} />
      <Route path="challenges" element={<div>Challenges Page</div>} />
      <Route path="leaderboard" element={<div>Leaderboard Page</div>} />
      <Route path="profile" element={<div>Profile Page</div>} />
    </Routes>
  );
};

export default DashboardRoutes;
