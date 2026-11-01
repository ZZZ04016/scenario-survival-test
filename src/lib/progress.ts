/**
 * 玩家进度追踪
 * 记录完成的结局数、总选择数，用于世界观解锁
 */

const PROGRESS_KEY = 'scenario_survival_progress';

export interface PlayerProgress {
  totalEndings: number;        // 完成的结局总数
  totalChoices: number;        // 累计做出的选择数
  unlockedWorldviews: string[]; // 已解锁的世界观 ID 列表
  endingsByWorldview: Record<string, number>; // 各世界观完成结局数
}

const DEFAULT_PROGRESS: PlayerProgress = {
  totalEndings: 0,
  totalChoices: 0,
  unlockedWorldviews: ['palace'], // 初始只解锁深宫风云
  endingsByWorldview: {},
};

// 解锁阈值
const UNLOCK_THRESHOLDS: Record<string, number> = {
  apocalypse: 2,  // 完成 2 个结局解锁末日求生
  cultivation: 5, // 完成 5 个结局解锁修仙问道
};

/** 读取玩家进度 */
export function getProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProgress;
      // 确保 palace 始终解锁
      if (!parsed.unlockedWorldviews.includes('palace')) {
        parsed.unlockedWorldviews.push('palace');
      }
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
  } catch {
    // 解析失败返回默认
  }
  return { ...DEFAULT_PROGRESS };
}

/** 保存玩家进度 */
function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // 存储失败静默
  }
}

/** 检查世界观是否已解锁 */
export function isWorldviewUnlocked(worldviewId: string): boolean {
  const progress = getProgress();
  return progress.unlockedWorldviews.includes(worldviewId);
}

/** 获取世界观的解锁进度信息 */
export function getUnlockInfo(worldviewId: string): { unlocked: boolean; required: number; current: number } {
  const progress = getProgress();
  const unlocked = progress.unlockedWorldviews.includes(worldviewId);
  const required = UNLOCK_THRESHOLDS[worldviewId] ?? 0;
  const current = progress.totalEndings;
  return { unlocked, required, current };
}

/** 记录一次选择 */
export function recordChoice(): void {
  const progress = getProgress();
  progress.totalChoices += 1;
  saveProgress(progress);
}

/** 记录完成一个结局，并检查是否解锁新世界观 */
export function recordEnding(worldviewId: string): string[] {
  const progress = getProgress();
  progress.totalEndings += 1;
  progress.endingsByWorldview[worldviewId] = (progress.endingsByWorldview[worldviewId] ?? 0) + 1;

  // 检查是否满足解锁条件
  const newlyUnlocked: string[] = [];
  for (const [wvId, threshold] of Object.entries(UNLOCK_THRESHOLDS)) {
    if (!progress.unlockedWorldviews.includes(wvId) && progress.totalEndings >= threshold) {
      progress.unlockedWorldviews.push(wvId);
      newlyUnlocked.push(wvId);
    }
  }

  saveProgress(progress);
  return newlyUnlocked;
}

/** 重置进度（开发用） */
export function resetProgress(): void {
  saveProgress({ ...DEFAULT_PROGRESS });
}
