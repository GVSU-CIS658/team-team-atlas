import { Avatar } from "../ui/Avatar/Avatar";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.scss";

type HeaderProps = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const Header = ({ onMenuClick, isMenuOpen }: HeaderProps) => {
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
        <div className={styles.headerProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Alex Morgan</span>
            <span className={styles.userSub}>GVSU</span>
          </div>
          <Avatar src="/Profile.png" alt="Alex Morgan" size="medium" />
        </div>

        <button className={styles.menuButton} onClick={onMenuClick}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
