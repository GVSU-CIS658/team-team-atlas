import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  TrendingUp,
  CalendarDays,
  TrendingUp as LeaderboardIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import styles from "./Challenges.module.scss";
import { api, ApiError } from "../../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiChallenge {
  id: string;
  title: string;
  description: string;
  frequency: string;
  unit: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  daysLeft: number;
  isJoined: boolean;
  userProgress: number;
  rank: number | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MyChallengeCard({
  challenge,
  onLeave,
  isLeaving,
}: {
  challenge: ApiChallenge;
  onLeave: (id: string) => void;
  isLeaving: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Trophy size={20} className={styles.trophyIcon} />
          <h3>{challenge.title}</h3>
        </div>
      </div>

      <p className={styles.cardDesc}>{challenge.description}</p>

      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <Users size={16} className={styles.metaIcon} />
          <div>
            <span className={styles.metaLabel}>Participants</span>
            <span className={styles.metaValue}>
              {challenge.participantCount.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles.metaItem}>
          <CalendarDays size={16} className={styles.metaIcon} />
          <div>
            <span className={styles.metaLabel}>Days Left</span>
            <span className={styles.metaValue}>
              {challenge.daysLeft > 0 ? challenge.daysLeft : "Ended"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Your Progress</span>
          {challenge.rank != null && (
            <span className={styles.rankLabel}>Rank #{challenge.rank}</span>
          )}
        </div>
        <div className={styles.progressFooter}>
          <span>
            {challenge.userProgress.toLocaleString()} {challenge.unit}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.leaderboardBtn}
          onClick={() => navigate(`/leaderboard?challenge=${challenge.id}`)}
        >
          <LeaderboardIcon size={15} />
          View Leaderboard
        </button>
        <button
          className={styles.leaveBtn}
          onClick={() => onLeave(challenge.id)}
          disabled={isLeaving}
        >
          {isLeaving ? <Loader2 size={14} className={styles.spin} /> : "Leave"}
        </button>
      </div>
    </div>
  );
}

function AvailableChallengeCard({
  challenge,
  onJoin,
  isJoining,
}: {
  challenge: ApiChallenge;
  onJoin: (id: string) => void;
  isJoining: boolean;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Trophy size={20} className={styles.trophyIcon} />
          <h3>{challenge.title}</h3>
        </div>
      </div>

      <p className={styles.cardDesc}>{challenge.description}</p>

      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <Users size={16} className={styles.metaIcon} />
          <div>
            <span className={styles.metaLabel}>Participants</span>
            <span className={styles.metaValue}>
              {challenge.participantCount.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles.metaItem}>
          <CalendarDays size={16} className={styles.metaIcon} />
          <div>
            <span className={styles.metaLabel}>Days Left</span>
            <span className={styles.metaValue}>
              {challenge.daysLeft > 0 ? challenge.daysLeft : "Ended"}
            </span>
          </div>
        </div>
      </div>

      <button
        className={styles.joinBtn}
        onClick={() => onJoin(challenge.id)}
        disabled={isJoining}
      >
        {isJoining ? (
          <Loader2 size={14} className={styles.spin} />
        ) : (
          "Join Challenge"
        )}
      </button>
    </div>
  );
}

function EmptyAvailable() {
  return (
    <div className={styles.emptyState}>
      <Trophy size={48} className={styles.emptyIcon} />
      <h3>All Caught Up!</h3>
      <p>
        You've joined all available challenges. Check back later for new ones.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<"mine" | "available">("mine");
  const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ApiChallenge[]>("/challenges");
      setChallenges(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load challenges",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const myChallenges = challenges.filter((c) => c.isJoined);
  const availableChallenges = challenges.filter((c) => !c.isJoined);

  const bestRank =
    myChallenges
      .map((c) => c.rank)
      .filter((r): r is number => r !== null)
      .sort((a, b) => a - b)[0] ?? null;

  const totalParticipants = challenges.reduce(
    (sum, c) => sum + c.participantCount,
    0,
  );

  // ── Join ─────────────────────────────────────────────────────────────────
  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      await api.post(`/challenges/${id}/join`, {});
      // Optimistic: flip isJoined locally, bump participant count
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, isJoined: true, participantCount: c.participantCount + 1 }
            : c,
        ),
      );
      setActiveTab("mine");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to join challenge",
      );
    } finally {
      setJoiningId(null);
    }
  };

  // ── Leave ────────────────────────────────────────────────────────────────
  const handleLeave = async (id: string) => {
    setLeavingId(id);
    try {
      await api.post(`/challenges/${id}/leave`, {});
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                isJoined: false,
                participantCount: Math.max(0, c.participantCount - 1),
              }
            : c,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to leave challenge",
      );
    } finally {
      setLeavingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spin} />
          <p>Loading challenges…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className={styles.joinBtn} onClick={fetchChallenges}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <span className={styles.statValue}>
              {totalParticipants.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className={styles.statLabel}>Best Rank</span>
            <span className={styles.statValue}>
              {bestRank ? `#${bestRank}` : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "mine" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          My Challenges ({myChallenges.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "available" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Available ({availableChallenges.length})
        </button>
      </div>

      {activeTab === "mine" ? (
        <div className={styles.grid}>
          {myChallenges.map((c) => (
            <MyChallengeCard
              key={c.id}
              challenge={c}
              onLeave={handleLeave}
              isLeaving={leavingId === c.id}
            />
          ))}
        </div>
      ) : availableChallenges.length === 0 ? (
        <EmptyAvailable />
      ) : (
        <div className={styles.grid}>
          {availableChallenges.map((c) => (
            <AvailableChallengeCard
              key={c.id}
              challenge={c}
              onJoin={handleJoin}
              isJoining={joiningId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
