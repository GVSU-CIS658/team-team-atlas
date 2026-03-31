import styles from './Avatar.module.scss'

type AvatarProps = {
    src: string
    alt: string
    size?: 'small' | 'medium' | 'large'
}

type AvatarFallbackProps = {
    name: string
}

const Avatar = ({ src, alt, size = 'medium' }: AvatarProps) => {
    return (
        <div className={styles.avatar}>
            <img src={src} alt={alt} className={styles[size]} />
        </div>
    )
}

const AvatarFallback = ({ name }: AvatarFallbackProps) => {
    return (
        <div className={styles.avatarFallback}>
            <span className={styles.avatarFallbackText}>{name}</span>
        </div>
    )
}

export { Avatar, AvatarFallback }