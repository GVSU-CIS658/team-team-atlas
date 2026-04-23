import type { WeeklyStepDay } from '../../../types';
import styles from './WeeklyStepsChart.module.scss';

interface WeeklyStepsChartProps {
  data: WeeklyStepDay[];
}

export default function WeeklyStepsChart({ data }: WeeklyStepsChartProps) {
  const maxSteps = Math.max(...data.map(d => d.steps), 0);
  const hasData = maxSteps > 0;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Weekly Steps</h3>
        <p className={styles.subtitle}>Your step count for the past 7 days</p>
      </div>

      <div className={styles.chart}>
        {hasData && (
          <div className={styles.yAxis}>
            {[maxSteps, Math.round(maxSteps * 0.75), Math.round(maxSteps * 0.5), Math.round(maxSteps * 0.25), 0].map(
              (val, i) => (
                <span key={i} className={styles.yLabel}>
                  {val.toLocaleString()}
                </span>
              )
            )}
          </div>
        )}

        <div className={styles.bars}>
          {data.map((day) => (
            <div key={day.date} className={styles.barGroup}>
              <div className={styles.barTrack}>
                {hasData && (
                  <div
                    className={styles.barFill}
                    style={{ height: `${(day.steps / maxSteps) * 100}%` }}
                    title={`${day.steps.toLocaleString()} steps`}
                  />
                )}
              </div>
              <span className={styles.dayLabel}>{day.label}</span>
            </div>
          ))}
          {!hasData && (
            <p className={styles.emptyLabel}>No activity this week</p>
          )}
        </div>
      </div>
    </section>
  );
}
