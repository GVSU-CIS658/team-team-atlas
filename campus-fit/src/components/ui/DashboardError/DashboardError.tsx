import { useNavigate } from 'react-router-dom';
import ErrorIcon from '../../../assets/error-icon';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { getFriendlyError } from '../../../lib/getFriendlyError';
import styles from './DashboardError.module.scss';

interface DashboardErrorProps {
    error?: unknown;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    onRetry?: () => void;
}

const DEFAULT_TITLE = 'Oops, something went wrong!';

const DashboardError = ({
    error,
    title = DEFAULT_TITLE,
    message,
    actionLabel,
    onAction,
    onRetry,
}: DashboardErrorProps) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const friendly = getFriendlyError(error);
    const resolvedMessage = message ?? friendly.message;

    const handleReauthenticate = async () => {
        try {
            await logout();
        } finally {
            navigate('/login');
        }
    };

    let resolvedLabel: string;
    let resolvedHandler: () => void;

    if (onAction) {
        resolvedLabel = actionLabel ?? 'Try Again';
        resolvedHandler = onAction;
    } else if (friendly.isAuth) {
        resolvedLabel = actionLabel ?? 'Log in again';
        resolvedHandler = handleReauthenticate;
    } else {
        resolvedLabel = actionLabel ?? 'Try Again';
        resolvedHandler = onRetry ?? (() => window.location.reload());
    }

    return (
        <div className={styles.container} role="alert">
            <div className={styles.icon} aria-hidden="true">
                <ErrorIcon />
            </div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{resolvedMessage}</p>
            <button type="button" className={styles.button} onClick={resolvedHandler}>
                {resolvedLabel}
            </button>
        </div>
    );
};

export default DashboardError;
