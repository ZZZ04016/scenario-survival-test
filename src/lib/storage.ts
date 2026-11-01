import { supabase, isSupabaseConfigured } from './supabase';
import type { PersonalityProfile, StoryResult, Worldview } from '../types';

export interface TestRecord {
  id?: string;
  worldview_id: string;
  worldview_name: string;
  episodes_survived: number;
  primary_trait: string;
  secondary_trait: string;
  trait_scores: Record<string, number>;
  role: string;
  ending: string;
  created_at?: string;
}

// localStorage 排行榜存储键
const LOCAL_LEADERBOARD_KEY = 'scenario_survival_leaderboard';

// 集数分布埋点存储键
const EPISODE_METRICS_KEY = 'scenario_survival_episode_metrics';

// 传奇局归档存储键
const LEGENDARY_RUNS_KEY = 'scenario_survival_legendary_runs';

/**
 * 集数分布统计
 * - histogram：按 10 集分桶的直方图（桶键 = floor(episodes/10)*10）
 * - byWorldview：分世界观的同样结构
 * 用于验证集数分布是否均衡、低结局池是否仍为死区
 */
export interface EpisodeMetrics {
  total: number;
  histogram: Record<number, number>;
  byWorldview: Record<string, { total: number; histogram: Record<number, number> }>;
}

/**
 * 读取本地集数分布统计
 */
export function getEpisodeMetrics(): EpisodeMetrics {
  try {
    const raw = localStorage.getItem(EPISODE_METRICS_KEY);
    if (raw) return JSON.parse(raw) as EpisodeMetrics;
  } catch {
    // 解析失败时返回空结构
  }
  return { total: 0, histogram: {}, byWorldview: {} };
}

/**
 * 记录一次集数结果到本地分布统计
 * 始终写入 localStorage；若 Supabase 已配置则异步同步（失败静默）
 */
export function recordEpisodeMetric(worldviewId: string, episodes: number): void {
  try {
    const metrics = getEpisodeMetrics();
    const bucket = Math.floor(episodes / 10) * 10;

    metrics.total += 1;
    metrics.histogram[bucket] = (metrics.histogram[bucket] ?? 0) + 1;

    if (!metrics.byWorldview[worldviewId]) {
      metrics.byWorldview[worldviewId] = { total: 0, histogram: {} };
    }
    const wv = metrics.byWorldview[worldviewId];
    wv.total += 1;
    wv.histogram[bucket] = (wv.histogram[bucket] ?? 0) + 1;

    localStorage.setItem(EPISODE_METRICS_KEY, JSON.stringify(metrics));
  } catch {
    // 埋点失败不应影响主流程
  }
}

/**
 * 传奇局记录（集数达到世界观上限 90% 的对局）
 */
export interface LegendaryRun {
  worldviewId: string;
  worldviewName: string;
  episodesSurvived: number;
  episodeMax: number;
  ending: string;
  primaryTrait: string;
  createdAt: string;
}

/**
 * 获取所有传奇局归档（按集数降序）
 */
export function getLegendaryRuns(): LegendaryRun[] {
  try {
    const raw = localStorage.getItem(LEGENDARY_RUNS_KEY);
    const runs: LegendaryRun[] = raw ? JSON.parse(raw) : [];
    return runs.sort((a, b) => b.episodesSurvived - a.episodesSurvived);
  } catch {
    return [];
  }
}

/**
 * 保存一次传奇局（最多保留 20 条，按集数降序）
 */
export function saveLegendaryRun(run: LegendaryRun): void {
  try {
    const runs = getLegendaryRuns();
    runs.push(run);
    runs.sort((a, b) => b.episodesSurvived - a.episodesSurvived);
    const trimmed = runs.slice(0, 20);
    localStorage.setItem(LEGENDARY_RUNS_KEY, JSON.stringify(trimmed));
  } catch {
    // 归档失败不应影响主流程
  }
}

/**
 * 获取本地存储的排行榜数据
 */
function getLocalLeaderboard(): TestRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 保存排行榜数据到 localStorage
 */
function saveLocalLeaderboard(records: TestRecord[]): void {
  try {
    // 只保留最近 100 条
    const trimmed = records.slice(0, 100);
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch {
    // 存储失败静默处理
  }
}

/**
 * 保存一次测试结果
 * 优先写入 Supabase，同时写入 localStorage（保证离线可用）
 */
export async function saveTestResult(params: {
  worldview: Worldview;
  profile: PersonalityProfile;
  story: StoryResult;
}): Promise<void> {
  const record: TestRecord = {
    worldview_id: params.worldview.id,
    worldview_name: params.worldview.name,
    episodes_survived: params.story.episodesSurvived,
    primary_trait: params.profile.primaryTrait,
    secondary_trait: params.profile.secondaryTrait,
    trait_scores: params.profile.traitScores,
    role: params.story.role,
    ending: params.story.ending,
    created_at: new Date().toISOString(),
  };

  // 始终保存到 localStorage（离线可用）
  const localRecords = getLocalLeaderboard();
  localRecords.unshift(record);
  saveLocalLeaderboard(localRecords);

  // 在线时同步到 Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('test_results').insert(record);
    } catch (e) {
      console.warn('同步到 Supabase 失败:', e);
    }
  }
}

export interface LeaderboardEntry {
  worldview_name: string;
  episodes_survived: number;
  primary_trait: string;
  role: string;
  created_at: string;
}

/**
 * 获取排行榜（存活集数最多的前 N 条）
 * 优先从 localStorage 读取，保证离线可用
 */
export async function getLeaderboard(
  worldviewId?: string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  // 从 localStorage 读取
  const localRecords = getLocalLeaderboard();
  let records = localRecords;

  if (worldviewId) {
    records = records.filter((r) => r.worldview_id === worldviewId);
  }

  // 按存活集数降序排列
  records.sort((a, b) => b.episodes_survived - a.episodes_survived);

  const localEntries: LeaderboardEntry[] = records.slice(0, limit).map((r) => ({
    worldview_name: r.worldview_name,
    episodes_survived: r.episodes_survived,
    primary_trait: r.primary_trait,
    role: r.role,
    created_at: r.created_at ?? '',
  }));

  // 在线时尝试从 Supabase 获取更多数据并合并
  if (isSupabaseConfigured() && supabase && navigator.onLine) {
    try {
      let query = supabase
        .from('test_results')
        .select('worldview_name, episodes_survived, primary_trait, role, created_at')
        .order('episodes_survived', { ascending: false })
        .limit(limit);

      if (worldviewId) {
        query = query.eq('worldview_id', worldviewId);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        // 合并去重
        const localKeys = new Set(localEntries.map((e) => `${e.role}_${e.episodes_survived}`));
        const remoteEntries: LeaderboardEntry[] = data
          .filter((d) => !localKeys.has(`${d.role}_${d.episodes_survived}`))
          .map((d) => ({
            worldview_name: d.worldview_name,
            episodes_survived: d.episodes_survived,
            primary_trait: d.primary_trait,
            role: d.role,
            created_at: d.created_at,
          }));
        return [...localEntries, ...remoteEntries]
          .sort((a, b) => b.episodes_survived - a.episodes_survived)
          .slice(0, limit);
      }
    } catch {
      // Supabase 失败时返回本地数据
    }
  }

  return localEntries;
}

export interface WorldviewStats {
  worldview_id: string;
  worldview_name: string;
  count: number;
  avg_episodes: number;
}

/**
 * 获取各世界观的测试统计
 */
export async function getWorldviewStats(): Promise<WorldviewStats[]> {
  const records = getLocalLeaderboard();
  const map = new Map<string, { worldview_id: string; worldview_name: string; total: number; count: number }>();

  for (const row of records) {
    const existing = map.get(row.worldview_id);
    if (existing) {
      existing.total += row.episodes_survived;
      existing.count += 1;
    } else {
      map.set(row.worldview_id, {
        worldview_id: row.worldview_id,
        worldview_name: row.worldview_name,
        total: row.episodes_survived,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).map((item) => ({
    worldview_id: item.worldview_id,
    worldview_name: item.worldview_name,
    count: item.count,
    avg_episodes: Math.round(item.total / item.count),
  }));
}
