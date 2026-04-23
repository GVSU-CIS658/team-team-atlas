import { Link } from 'react-router-dom';
import type { ActiveChallenge } from '../../../types';
import styles from './ActiveChallengesList.module.scss';

interface ActiveChallengesListProps {
  challenges: ActiveChallenge[];
}

export default function ActiveChallengesList({ challenges }: ActiveChallengesListProps) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Active Challenges</h3>
          <p className={styles.subtitle}>Challenges you're participating in</p>
        </div>
        <Link to="/challenges" className={styles.viewAll}>View All</Link>
      </div>

      <div className={styles.list}>
        {challenges.length === 0 && (
          <p className={styles.empty}>Not in any challenges yet</p>
        )}
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </section>
  );
}

function ChallengeCard({ challenge }: { challenge: ActiveChallenge }) {
  const percentage = challenge.targetValue > 0
    ? Math.min(100, Math.round((challenge.userProgress / challenge.targetValue) * 100))
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.challengeTitle}>{challenge.title}</span>
        <span className={styles.rank}>
          Rank #{challenge.rank} of {challenge.participantCount} participants
        </span>
      </div>
      <div className={styles.progressRow}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
        </div>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <span className={styles.progressText}>
        {challenge.userProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.unit}
      </span>
    </div>
  );
}
