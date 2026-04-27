import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar/Avatar';
import { useAuth } from '../../auth/context/AuthContext';
import { getFriendlyError } from '../../../lib/getFriendlyError';
import type { UserProfile } from '../../../types';
import type { ProfileSavePayload } from '../hooks/useProfile';
import styles from './PersonalInfoCard.module.scss';

interface PersonalInfoCardProps {
    profile: UserProfile;
    onSave: (updates: ProfileSavePayload) => Promise<UserProfile>;
}

function formatMemberSince(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
    });
}

export default function PersonalInfoCard({ profile, onSave }: PersonalInfoCardProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(profile.username);
    const [university, setUniversity] = useState(profile.university ?? '');
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setUsername(profile.username);
        setUniversity(profile.university ?? '');
    }, [profile.username, profile.university]);

    const handleEdit = () => {
        setErrorMessage(null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setUsername(profile.username);
        setUniversity(profile.university ?? '');
        setErrorMessage(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        const trimmedUsername = username.trim();
        const trimmedUniversity = university.trim();

        if (!trimmedUsername) {
            setErrorMessage('Full name cannot be empty.');
            return;
        }

        const updates: ProfileSavePayload = {};
        if (trimmedUsername !== profile.username) {
            updates.username = trimmedUsername;
        }
        const nextUniversity = trimmedUniversity.length > 0 ? trimmedUniversity : null;
        if (nextUniversity !== profile.university) {
            updates.university = nextUniversity;
        }

        if (Object.keys(updates).length === 0) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        setErrorMessage(null);
        try {
            await onSave(updates);
            setIsEditing(false);
        } catch (err) {
            setErrorMessage(getFriendlyError(err).message);
        } finally {
            setSaving(false);
        }
    };

    const memberSince = formatMemberSince(profile.createdAt);

    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <Avatar src={user?.avatarUrl ?? null} alt={profile.username} size="large" />
                <div className={styles.headerText}>
                    <h2 className={styles.name}>{profile.username}</h2>
                    <p className={styles.subtitle}>
                        {profile.university?.trim() || 'University not set'}
                    </p>
                </div>
            </header>

            <div className={styles.fields}>
                <label className={styles.field}>
                    <span className={styles.label}>Full Name</span>
                    {isEditing ? (
                        <input
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={saving}
                            autoComplete="name"
                        />
                    ) : (
                        <span className={styles.value}>{profile.username}</span>
                    )}
                </label>

                <div className={styles.field}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{profile.email}</span>
                </div>

                <label className={styles.field}>
                    <span className={styles.label}>University</span>
                    {isEditing ? (
                        <input
                            type="text"
                            className={styles.input}
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            disabled={saving}
                            placeholder="Add your university"
                        />
                    ) : (
                        <span className={styles.value}>
                            {profile.university?.trim() || '—'}
                        </span>
                    )}
                </label>

                <div className={styles.field}>
                    <span className={styles.label}>Member Since</span>
                    <span className={styles.value}>{memberSince}</span>
                </div>
            </div>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            <div className={styles.actions}>
                {isEditing ? (
                    <>
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className={styles.editBtn}
                        onClick={handleEdit}
                    >
                        <Pencil size={16} aria-hidden="true" />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>
        </section>
    );
}
