import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../../lib/storage';
import { TRAIT_LABELS } from '../../types';

/**
 * 排行榜组件
 * 显示当前世界观下存活集数最多的玩家
 */
export function Leaderboard({ worldviewId }: { worldviewId: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(worldviewId, 5)
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [worldviewId]);

  if (loading || entries.length === 0) return null;

  return (
    <div className="card p-5 mb-6">
      <h2 className="text-lg font-serif font-bold text-text mb-4">🏆 本世界生存榜</h2>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg)', opacity: 1 - i * 0.12 }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#cd7f32' : 'var(--color-primary-light)' }}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{entry.role}</p>
              <p className="text-xs text-text-muted">
                {TRAIT_LABELS[entry.primary_trait as keyof typeof TRAIT_LABELS] ?? entry.primary_trait}
              </p>
            </div>
            <span className="text-lg font-bold text-primary">
              {entry.episodes_survived}
              <span className="text-xs font-normal text-text-muted ml-1">集</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
