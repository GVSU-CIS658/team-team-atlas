import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.scss';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <div className={styles.logoIcon}>
                        <Activity size={26} />
                    </div>
                    <h1>CampusFit</h1>
                    <p>Stay fit, stay motivated, stay connected</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue your fitness journey</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="email">University Email</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><Mail size={16} /></span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="alex.morgan@university.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>
                            <div className={`${styles.inputWrapper} ${styles.hasToggle}`}>
                                <span className={styles.inputIcon}><Lock size={16} /></span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Don't have an account? <Link to="/register">Create Account</Link>
                    </p>
                </div>

                <p className={styles.legalText}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
