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

/**
 * 保存一次测试结果到 Supabase
 * 如果 Supabase 未配置，则静默跳过（不影响功能）
 */
export async function saveTestResult(params: {
  worldview: Worldview;
  profile: PersonalityProfile;
  story: StoryResult;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  const record: TestRecord = {
    worldview_id: params.worldview.id,
    worldview_name: params.worldview.name,
    episodes_survived: params.story.episodesSurvived,
    primary_trait: params.profile.primaryTrait,
    secondary_trait: params.profile.secondaryTrait,
    trait_scores: params.profile.traitScores,
    role: params.story.role,
    ending: params.story.ending,
  };

  try {
    await supabase.from('test_results').insert(record);
  } catch (e) {
    // 数据上报失败不影响用户体验
    console.warn('保存测试结果失败:', e);
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
 */
export async function getLeaderboard(
  worldviewId?: string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    let query = supabase
      .from('test_results')
      .select('worldview_name, episodes_survived, primary_trait, role, created_at')
      .order('episodes_survived', { ascending: false })
      .limit(limit);

    if (worldviewId) {
      query = query.eq('worldview_id', worldviewId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.warn('获取排行榜失败:', e);
    return [];
  }
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
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('worldview_id, worldview_name, episodes_survived');

    if (error) throw error;

    // 前端聚合统计
    const map = new Map<string, { worldview_id: string; worldview_name: string; total: number; count: number }>();
    for (const row of data ?? []) {
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
  } catch (e) {
    console.warn('获取统计失败:', e);
    return [];
  }
}
