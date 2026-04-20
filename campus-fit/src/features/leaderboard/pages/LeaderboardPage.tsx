import { Crown, Medal, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './Leaderboard.module.scss';

interface Participant {
    rank: number;
    name: string;
    university: string;
    score: number;
    unit: string;
}

const LEADERBOARD: Participant[] = [
    { rank: 1, name: 'Sarah Chen',       university: 'State University', score: 89450, unit: 'steps' },
    { rank: 2, name: 'Marcus Johnson',   university: 'State University', score: 84320, unit: 'steps' },
    { rank: 3, name: 'Emily Rodriguez',  university: 'State University', score: 78940, unit: 'steps' },
    { rank: 4, name: 'James Park',       university: 'State University', score: 72180, unit: 'steps' },
    { rank: 5, name: 'Olivia Martinez',  university: 'State University', score: 68750, unit: 'steps' },
    { rank: 47, name: 'Alex Morgan',     university: 'State University', score: 45230, unit: 'steps' },
];

const CHALLENGE_TITLE = 'March Madness Steps';

function initials(name: string) {
    return name.split(' ').map(p => p[0]).join('').toUpperCase();
}

function AvatarCircle({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <div className={`${styles.avatar} ${styles[`avatar_${size}`]}`}>
            {initials(name)}
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div className={`${styles.rankBadge} ${styles.gold}`}>
            <Crown size={18} />
        </div>
    );
    if (rank === 2) return (
        <div className={`${styles.rankBadge} ${styles.silver}`}>
            <Medal size={18} />
        </div>
    );
    if (rank === 3) return (
        <div className={`${styles.rankBadge} ${styles.bronze}`}>
            <Medal size={18} />
        </div>
    );
    return (
        <div className={`${styles.rankBadge} ${styles.plain}`}>
            <span>{rank}</span>
        </div>
    );
}

function PodiumCard({ p, position }: { p: Participant; position: 1 | 2 | 3 }) {
    const borderClass = position === 1 ? styles.podium1 : position === 2 ? styles.podium2 : styles.podium3;
    return (
        <div className={`${styles.podiumCard} ${borderClass}`}>
            {position === 1 && <Crown size={28} className={styles.crownIcon} />}
            <div className={`${styles.podiumAvatarWrap} ${borderClass}`}>
                <AvatarCircle name={p.name} size="lg" />
                <span className={`${styles.podiumBadge} ${borderClass}`}>{p.rank}</span>
            </div>
            <span className={styles.podiumName}>{p.name}</span>
            <span className={`${styles.podiumScore} ${position === 1 ? styles.goldScore : ''}`}>
                {p.score.toLocaleString()}
            </span>
            <span className={styles.podiumUnit}>{p.unit}</span>
        </div>
    );
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const top3 = LEADERBOARD.filter(p => p.rank <= 3).sort((a, b) => a.rank - b.rank);
    const [second, first, third] = [top3[1], top3[0], top3[2]];

    return (
        <div className={styles.page}>
            {/* ── Top Performers ── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Top Performers</h2>
                    <p>The leaders of {CHALLENGE_TITLE}</p>
                </div>

                <div className={styles.podium}>
                    <PodiumCard p={second} position={2} />
                    <PodiumCard p={first}  position={1} />
                    <PodiumCard p={third}  position={3} />
                </div>
            </section>

            {/* ── All Rankings ── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>All Rankings</h2>
                    <p>Complete leaderboard for {CHALLENGE_TITLE}</p>
                </div>

                <div className={styles.rankList}>
                    {LEADERBOARD.map((p) => {
                        const isMe = user?.username?.toLowerCase() === p.name.toLowerCase();
                        return (
                            <div key={p.rank} className={`${styles.rankRow} ${isMe ? styles.myRow : ''}`}>
                                <RankBadge rank={p.rank} />
                                <AvatarCircle name={p.name} size="sm" />
                                <div className={styles.rankInfo}>
                                    <span className={styles.rankName}>
                                        {p.name}
                                        {isMe && <span className={styles.youBadge}>You</span>}
                                    </span>
                                    <span className={styles.rankUniversity}>{p.university}</span>
                                </div>
                                <div className={styles.rankScore}>
                                    <span className={styles.rankScoreValue}>{p.score.toLocaleString()}</span>
                                    <span className={styles.rankUnit}>{p.unit}</span>
                                </div>
                                <TrendingUp size={18} className={styles.trendIcon} />
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
