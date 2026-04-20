import { useState, useRef, useEffect } from "react";
import { Avatar } from "../ui/Avatar/Avatar";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import styles from "./Header.module.scss";

type HeaderProps = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const Header = ({ onMenuClick, isMenuOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Link to="/" className={styles.logo}>
          <img
            src="/campusfit-logo.svg"
            alt="Logo"
            className={styles.logoIcon}
          />
          <span className={styles.logoText}>CampusFit</span>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.headerProfile} ref={dropdownRef}>
          <button
            className={styles.profileButton}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username ?? ""}</span>
              <span className={styles.userSub}>GVSU</span>
            </div>
            <Avatar src="/Profile.png" alt={user?.username ?? ""} size="medium" />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        <button className={styles.menuButton} onClick={onMenuClick}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
