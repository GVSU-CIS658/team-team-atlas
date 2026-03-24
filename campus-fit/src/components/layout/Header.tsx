import { AvatarFallback } from '../ui/Avatar/Avatar'
import { Link } from 'react-router-dom'
import styles from './Header.module.scss'

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                {/* TODO: Add logo */}
                <Link to="/">CampusFit</Link>
            </div>

            <AvatarFallback name="John Doe" />
        </header>
    )
}

export default Header