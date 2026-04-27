import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, TrendingUp, CalendarDays, Gift, TrendingUp as LeaderboardIcon } from 'lucide-react';
import styles from './Challenges.module.scss';

interface MyChallenge {
    id: string;
    title: string;
    description: string;
    participants: number;
    daysLeft: number;
    prize: string | null;
    progress: number;
    target: number;
    unit: string;
    rank: number;
}

interface AvailableChallenge {
    id: string;
    title: string;
    description: string;
    participants: number;
    daysLeft: number;
    prize: string | null;
    target: number;
    unit: string;
}

const INITIAL_MY_CHALLENGES: MyChallenge[] = [
    {
        id: '1',
        title: 'March Madness Steps',
        description: 'Reach 300,000 steps in March and win exclusive campus merch!',
        participants: 432,
        daysLeft: -20,
        prize: 'CampusFit T-Shirt & Water Bottle',
        progress: 45230,
        target: 300000,
        unit: 'steps',
        rank: 47,
    },
    {
        id: '2',
        title: 'Spring Sprint Challenge',
        description: 'Run 50 miles before spring break starts',
        participants: 287,
        daysLeft: -36,
        prize: 'Gym Pass Extension',
        progress: 23.5,
        target: 50,
        unit: 'miles',
        rank: 89,
    },
    {
        id: '3',
        title: 'Workout Warriors',
        description: 'Complete 20 workouts this month and unlock rewards',
        participants: 356,
        daysLeft: -20,
        prize: null,
        progress: 8,
        target: 20,
        unit: 'workouts',
        rank: 112,
    },
];

const INITIAL_AVAILABLE_CHALLENGES: AvailableChallenge[] = [
    {
        id: '4',
        title: 'Calorie Crusher',
        description: 'Burn 10,000 calories through exercise',
        participants: 198,
        daysLeft: -20,
        prize: null,
        target: 10000,
        unit: 'calories',
    },
];

function MyChallengeCard({ challenge, onLeave }: { challenge: MyChallenge; onLeave: (id: string) => void }) {
    const navigate = useNavigate();
    const pct = Math.round((challenge.progress / challenge.target) * 100);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    <Trophy size={20} className={styles.trophyIcon} />
                    <h3>{challenge.title}</h3>
                </div>
                <span className={styles.prizeBadge}>
                    <Gift size={13} />
                    Prize
                </span>
            </div>

            <p className={styles.cardDesc}>{challenge.description}</p>

            <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                    <Users size={16} className={styles.metaIcon} />
                    <div>
                        <span className={styles.metaLabel}>Participants</span>
                        <span className={styles.metaValue}>{challenge.participants.toLocaleString()}</span>
                    </div>
                </div>
                <div className={styles.metaItem}>
                    <CalendarDays size={16} className={styles.metaIcon} />
                    <div>
                        <span className={styles.metaLabel}>Days Left</span>
                        <span className={styles.metaValue}>{challenge.daysLeft}</span>
                    </div>
                </div>
            </div>

            {challenge.prize && (
                <div className={styles.prizeBanner}>
                    <Gift size={15} />
                    <span>{challenge.prize}</span>
                </div>
            )}

            <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                    <span>Your Progress</span>
                    <span className={styles.rankLabel}>Rank #{challenge.rank}</span>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.progressFooter}>
                    <span>{challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()} {challenge.unit}</span>
                    <span className={styles.pct}>{pct}%</span>
                </div>
            </div>

            <div className={styles.cardActions}>
                <button className={styles.leaderboardBtn} onClick={() => navigate('/leaderboard')}>
                    <LeaderboardIcon size={15} />
                    View Leaderboard
                </button>
                <button className={styles.leaveBtn} onClick={() => onLeave(challenge.id)}>Leave</button>
            </div>
        </div>
    );
}

function AvailableChallengeCard({ challenge, onJoin }: { challenge: AvailableChallenge; onJoin: (id: string) => void }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    <Trophy size={20} className={styles.trophyIcon} />
                    <h3>{challenge.title}</h3>
                </div>
                <span className={styles.prizeBadge}>
                    <Gift size={13} />
                    Prize
                </span>
            </div>

            <p className={styles.cardDesc}>{challenge.description}</p>

            <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                    <Users size={16} className={styles.metaIcon} />
                    <div>
                        <span className={styles.metaLabel}>Participants</span>
                        <span className={styles.metaValue}>{challenge.participants.toLocaleString()}</span>
                    </div>
                </div>
                <div className={styles.metaItem}>
                    <CalendarDays size={16} className={styles.metaIcon} />
                    <div>
                        <span className={styles.metaLabel}>Days Left</span>
                        <span className={styles.metaValue}>{challenge.daysLeft}</span>
                    </div>
                </div>
            </div>

            <button className={styles.joinBtn} onClick={() => onJoin(challenge.id)}>Join Challenge</button>
        </div>
    );
}

function EmptyAvailable() {
    return (
        <div className={styles.emptyState}>
            <Trophy size={48} className={styles.emptyIcon} />
            <h3>All Caught Up!</h3>
            <p>You've joined all available challenges. Check back later for new ones.</p>
        </div>
    );
}

export default function ChallengesPage() {
    const [activeTab, setActiveTab] = useState<'mine' | 'available'>('mine');
    const [myChallenges, setMyChallenges] = useState<MyChallenge[]>(INITIAL_MY_CHALLENGES);
    const [availableChallenges, setAvailableChallenges] = useState<AvailableChallenge[]>(INITIAL_AVAILABLE_CHALLENGES);

    const handleJoin = (id: string) => {
        const challenge = availableChallenges.find(c => c.id === id);
        if (!challenge) return;

        const joined: MyChallenge = {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            participants: challenge.participants + 1,
            daysLeft: challenge.daysLeft,
            prize: challenge.prize,
            progress: 0,
            target: challenge.target,
            unit: challenge.unit,
            rank: 199,
        };

        setMyChallenges(prev => [...prev, joined]);
        setAvailableChallenges(prev => prev.filter(c => c.id !== id));
        setActiveTab('mine');
    };

    const handleLeave = (id: string) => {
        const challenge = myChallenges.find(c => c.id === id);
        if (!challenge) return;

        const restored: AvailableChallenge = {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            participants: Math.max(0, challenge.participants - 1),
            daysLeft: challenge.daysLeft,
            prize: challenge.prize,
            target: challenge.target,
            unit: challenge.unit,
        };

        setMyChallenges(prev => prev.filter(c => c.id !== id));
        setAvailableChallenges(prev => [...prev, restored]);
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Campus Challenges</h1>
                <p>Compete with fellow students and win exciting prizes</p>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.purple}`}>
                        <Trophy size={22} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Active Challenges</span>
                        <span className={styles.statValue}>{myChallenges.length}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>
                        <Users size={22} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Total Participants</span>
                        <span className={styles.statValue}>1,273</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}>
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Best Rank</span>
                        <span className={styles.statValue}>#47</span>
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'mine' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    My Challenges ({myChallenges.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available ({availableChallenges.length})
                </button>
            </div>

            {activeTab === 'mine' ? (
                <div className={styles.grid}>
                    {myChallenges.map(c => (
                        <MyChallengeCard key={c.id} challenge={c} onLeave={handleLeave} />
                    ))}
                </div>
            ) : (
                availableChallenges.length === 0 ? (
                    <EmptyAvailable />
                ) : (
                    <div className={styles.grid}>
                        {availableChallenges.map(c => (
                            <AvailableChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
