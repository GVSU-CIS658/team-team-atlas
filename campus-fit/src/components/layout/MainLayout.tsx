import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./MainLayout.module.scss";

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.layoutWrapper}>
      <Header
        isMenuOpen={isMenuOpen}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
      />
      <div className={styles.contentSection}>
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <main className={styles.pageBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
