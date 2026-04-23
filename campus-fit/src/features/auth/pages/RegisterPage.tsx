import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.scss';

export default function RegisterPage() {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await register(fullName, email, password, university, avatar);
            navigate('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <img src="/campusfit-logo.svg" alt="CampusFit" className={styles.logoIcon} />
                    <h1>CampusFit</h1>
                    <p>Join your campus fitness community</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Create Account</h2>
                        <p>Sign up to start tracking your fitness</p>
                    </div>

                    {/* ── Avatar upload ── */}
                    <div className={styles.avatarUpload}>
                        <button
                            type="button"
                            className={styles.avatarBtn}
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Upload profile picture"
                        >
                            {avatar ? (
                                <img src={avatar} alt="Profile preview" className={styles.avatarPreview} />
                            ) : (
                                <span className={styles.avatarPlaceholder}>
                                    <User size={32} strokeWidth={1.5} />
                                </span>
                            )}
                            <span className={styles.cameraOverlay}>
                                <Camera size={14} />
                            </span>
                        </button>
                        <span className={styles.avatarHint}>Profile photo</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="fullName">Full Name</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><User size={16} /></span>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Alex Morgan"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="university">University</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><Building2 size={16} /></span>
                                <input
                                    id="university"
                                    type="text"
                                    placeholder="State University"
                                    value={university}
                                    onChange={e => setUniversity(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="email">University Email</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}><Mail size={16} /></span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@university.edu"
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

                        <div className={styles.field}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={`${styles.inputWrapper} ${styles.hasToggle}`}>
                                <span className={styles.inputIcon}><Lock size={16} /></span>
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setShowConfirm(v => !v)}
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
