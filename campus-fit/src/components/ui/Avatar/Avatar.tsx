import styles from './Avatar.module.scss'

type AvatarProps = {
    src?: string | null
    alt: string
    size?: 'small' | 'medium' | 'large'
}

type AvatarFallbackProps = {
    name: string
}

const Avatar = ({ src, alt, size = 'medium' }: AvatarProps) => {
    if (!src) {
        const initials = alt
            .split(' ')
            .map(p => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return (
            <div className={`${styles.avatar} ${styles[size]}`}>
                <span className={styles.initials}>{initials}</span>
            </div>
        );
    }

    return (
        <div className={`${styles.avatar} ${styles[size]}`}>
            <img src={src} alt={alt} />
        </div>
    );
}

const AvatarFallback = ({ name }: AvatarFallbackProps) => {
    return (
        <div className={styles.avatarFallback}>
            <span className={styles.avatarFallbackText}>{name}</span>
        </div>
    )
}

export { Avatar, AvatarFallback }
