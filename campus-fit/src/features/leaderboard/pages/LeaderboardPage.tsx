import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Crown,
  Medal,
  TrendingUp,
  Loader2,
  AlertCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import styles from "./Leaderboard.module.scss";
import { api, ApiError } from "../../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Participant {
  rank: number;
  name: string;
  university: string;
  score: number;
  unit: string;
  userId: string;
}

interface JoinedChallenge {
  id: string;
  title: string;
  unit: string;
}

interface ApiEntry {
  rank: number;
  userId: string;
  username: string;
  totalProgress: number;
}

interface LeaderboardResponse {
  challenge: { id: string; title: string; unit: string };
  myPosition: {
    rank: number | null;
    progress: number;
    toNextRank: number | null;
  };
  leaderboard: ApiEntry[];
}

const toParticipant = (e: ApiEntry, unit: string): Participant => ({
  rank: e.rank,
  name: e.username,
  university: "",
  score: e.totalProgress,
  unit,
  userId: e.userId,
});

// ─── Sub-components — UNCHANGED ───────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function AvatarCircle({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={`${styles.avatar} ${styles[`avatar_${size}`]}`}>
      {initials(name)}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className={`${styles.rankBadge} ${styles.gold}`}>
        <Crown size={18} />
      </div>
    );
  if (rank === 2)
    return (
      <div className={`${styles.rankBadge} ${styles.silver}`}>
        <Medal size={18} />
      </div>
    );
  if (rank === 3)
    return (
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
  const borderClass =
    position === 1
      ? styles.podium1
      : position === 2
        ? styles.podium2
        : styles.podium3;
  return (
    <div className={`${styles.podiumCard} ${borderClass}`}>
      {position === 1 && <Crown size={28} className={styles.crownIcon} />}
      <div className={`${styles.podiumAvatarWrap} ${borderClass}`}>
        <AvatarCircle name={p.name} size="lg" />
        <span className={`${styles.podiumBadge} ${borderClass}`}>{p.rank}</span>
      </div>
      <span className={styles.podiumName}>{p.name}</span>
      <span
        className={`${styles.podiumScore} ${position === 1 ? styles.goldScore : ""}`}
      >
        {p.score.toLocaleString()}
      </span>
      <span className={styles.podiumUnit}>{p.unit}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [joinedChallenges, setJoinedChallenges] = useState<JoinedChallenge[]>(
    [],
  );
  const [selectedId, setSelectedId] = useState("");
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [myPosition, setMyPosition] = useState<
    LeaderboardResponse["myPosition"] | null
  >(null);
  const [unit, setUnit] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load joined challenges
  useEffect(() => {
    (async () => {
      try {
        const list = await api.get<JoinedChallenge[]>("/leaderboard/joined");
        setJoinedChallenges(list);
        const urlId = searchParams.get("challenge");
        const initial = list.find((c) => c.id === urlId)
          ? urlId!
          : (list[0]?.id ?? "");
        setSelectedId(initial);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load challenges",
        );
      } finally {
        setLoadingList(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load leaderboard on selection change
  const fetchBoard = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingBoard(true);
    setError(null);
    try {
      const res = await api.get<LeaderboardResponse>(`/leaderboard/${id}`);
      const u = res.challenge.unit;
      setUnit(u);
      setChallengeTitle(res.challenge.title);
      setMyPosition(res.myPosition);
      setLeaderboard(res.leaderboard.map((e) => toParticipant(e, u)));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load leaderboard",
      );
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) fetchBoard(selectedId);
  }, [selectedId, fetchBoard]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearchParams({ challenge: id });
  };

  const top3 = leaderboard
    .filter((p) => p.rank <= 3)
    .sort((a, b) => a.rank - b.rank);
  const [second, first, third] = [top3[1], top3[0], top3[2]];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingList) {
    return (
      <div className={styles.page}>
        <div
          className={styles.section}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#6b7280",
            padding: 24,
          }}
        >
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading leaderboard…</span>
        </div>
      </div>
    );
  }

  if (joinedChallenges.length === 0) {
    return (
      <div className={styles.page}>
        {/* Page header */}
        <div style={{ marginBottom: 4 }}>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: 24,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Leaderboard
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            See how you rank against other students
          </p>
        </div>
        <div
          className={styles.section}
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#6b7280",
          }}
        >
          <Crown
            size={48}
            style={{ opacity: 0.25, margin: "0 auto 12px", display: "block" }}
          />
          <p style={{ margin: 0, fontWeight: 600 }}>
            Join a challenge to see your ranking here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Page header (outside cards, matches Figma) ── */}
      <div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Leaderboard
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          See how you rank against other students
        </p>
      </div>

      {/* ── Challenge selector ── */}
      <div className={styles.section} style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Funnel icon */}
          <Filter size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />

          {/* Native select, styled to look like plain text */}
          <div style={{ flex: 1, position: "relative" }}>
            <select
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
              style={{
                appearance: "none",
                width: "100%",
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                cursor: "pointer",
                outline: "none",
                paddingRight: 20,
              }}
            >
              {joinedChallenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Your Position card (blue, matches Figma) ── */}
      {myPosition && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <TrendingUp size={16} style={{ color: "#3b82f6" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8" }}>
              Your Position
            </span>
          </div>

          {/* Three stats */}
          <div style={{ display: "flex" }}>
            {/* Current Rank */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: "1px solid #bfdbfe",
                paddingRight: 16,
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>
                Current Rank
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {myPosition.rank != null ? `#${myPosition.rank}` : "—"}
              </p>
            </div>

            {/* Your Progress */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: "1px solid #bfdbfe",
                padding: "0 16px",
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>
                Your Progress
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#3b82f6",
                  lineHeight: 1,
                }}
              >
                {myPosition.progress.toLocaleString()}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>
                {unit}
              </p>
            </div>

            {/* To Next Rank */}
            <div style={{ flex: 1, textAlign: "center", paddingLeft: 16 }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>
                To Next Rank
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {myPosition.rank === 1
                  ? "🥇"
                  : myPosition.toNextRank != null
                    ? myPosition.toNextRank.toLocaleString()
                    : "—"}
              </p>
              {myPosition.toNextRank != null && myPosition.rank !== 1 && (
                <p
                  style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}
                >
                  {unit}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Inline loading / error ── */}
      {loadingBoard && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#6b7280",
            padding: "8px 0",
          }}
        >
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 13 }}>Updating…</span>
        </div>
      )}
      {error && !loadingBoard && (
        <div
          className={styles.section}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#ef4444",
            padding: 16,
          }}
        >
          <AlertCircle size={16} />
          <span style={{ fontSize: 13 }}>{error}</span>
          <button
            onClick={() => fetchBoard(selectedId)}
            style={{
              marginLeft: "auto",
              fontSize: 13,
              color: "#3b82f6",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loadingBoard && !error && leaderboard.length > 0 && (
        <>
          {/* ── Top Performers — identical to original ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Top Performers</h2>
              <p>The leaders of {challengeTitle}</p>
            </div>
            <div className={styles.podium}>
              {second && <PodiumCard p={second} position={2} />}
              {first && <PodiumCard p={first} position={1} />}
              {third && <PodiumCard p={third} position={3} />}
            </div>
          </section>

          {/* ── All Rankings — identical to original ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>All Rankings</h2>
              <p>Complete leaderboard for {challengeTitle}</p>
            </div>
            <div className={styles.rankList}>
              {leaderboard.map((p) => {
                const isMe =
                  user?.username?.toLowerCase() === p.name.toLowerCase();
                return (
                  <div
                    key={p.rank}
                    className={`${styles.rankRow} ${isMe ? styles.myRow : ""}`}
                  >
                    <RankBadge rank={p.rank} />
                    <AvatarCircle name={p.name} size="sm" />
                    <div className={styles.rankInfo}>
                      <span className={styles.rankName}>
                        {p.name}
                        {isMe && <span className={styles.youBadge}>You</span>}
                      </span>
                      <span className={styles.rankUniversity}>
                        {p.university}
                      </span>
                    </div>
                    <div className={styles.rankScore}>
                      <span className={styles.rankScoreValue}>
                        {p.score.toLocaleString()}
                      </span>
                      <span className={styles.rankUnit}>{p.unit}</span>
                    </div>
                    <TrendingUp size={18} className={styles.trendIcon} />
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
