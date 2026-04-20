import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, Trophy, Users, User } from "lucide-react";
import { Avatar } from "../ui/Avatar/Avatar";
import { useAuth } from "../../features/auth/context/AuthContext";
import styles from "./Sidebar.module.scss";

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Goals", path: "/goals", icon: <Target size={20} /> },
    { name: "Challenges", path: "/challenges", icon: <Trophy size={20} /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <Users size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.mobileProfile}>
        <Avatar src="/Profile.png" alt={user?.username ?? ''} size="large" />
        <div className={styles.mobileInfo}>
          <span className={styles.userName}>{user?.username ?? ''}</span>
          <span className={styles.userSub}>GVSU Student</span>
        </div>
      </div>

      <nav className={styles.nav} onClick={onClose}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
