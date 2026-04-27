import { Route, Routes } from "react-router-dom";
import DashboardPage from "../features/dashboard/page/DashbaordPage";
import GoalsPage from "../features/goals/pages/GoalsPage";
import ChallengesPage from "../features/challenges/pages/ChallengesPage";
import LeaderboardPage from "../features/leaderboard/pages/LeaderboardPage";
import ProfilePage from "../features/profile/pages/ProfilePage";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="goals" element={<GoalsPage />} />
      <Route path="challenges" element={<ChallengesPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default DashboardRoutes;
