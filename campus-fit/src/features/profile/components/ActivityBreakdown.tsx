import type { ActivityUnit } from '../../../types';
import styles from './ActivityBreakdown.module.scss';

interface ActivityBreakdownProps {
    counts: Record<ActivityUnit, number>;
}

const UNIT_LABELS: Record<ActivityUnit, string> = {
    steps: 'Walking/Running',
    calories: 'Calories',
    distance: 'Distance',
};

export default function ActivityBreakdown({ counts }: ActivityBreakdownProps) {
    const entries = (Object.entries(counts) as [ActivityUnit, number][])
        .filter(([, value]) => value > 0);

    const max = Math.max(...entries.map(([, v]) => v), 0);
    const hasData = entries.length > 0 && max > 0;

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Activity Breakdown</h3>
                <p className={styles.subtitle}>Number of activities you've logged by type</p>
            </div>

            <div className={styles.chart}>
                {hasData ? (
                    entries.map(([unit, value]) => {
                        const noun = value === 1 ? 'activity' : 'activities';
                        return (
                            <div key={unit} className={styles.barGroup}>
                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{ height: `${(value / max) * 100}%` }}
                                        title={`${value.toLocaleString()} ${UNIT_LABELS[unit]} ${noun}`}
                                    />
                                </div>
                                <span className={styles.barValue}>{value.toLocaleString()}</span>
                                <span className={styles.dayLabel}>{UNIT_LABELS[unit]}</span>
                            </div>
                        );
                    })
                ) : (
                    <p className={styles.emptyLabel}>No activity logged yet</p>
                )}
            </div>
        </section>
    );
}
