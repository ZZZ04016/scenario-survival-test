import type { PersonalityProfile, PersonalityTrait, QuizOption, Season, BranchChoice } from '../types';

/**
 * 根据用户选择的选项计算性格画像
 * 统计每个特质出现的频次，取最高和次高作为主次特质
 */
export function calculatePersonalityProfile(
  selectedOptions: QuizOption[],
): PersonalityProfile {
  const traitScores: Record<PersonalityTrait, number> = {
    cautious: 0,
    decisive: 0,
    scheming: 0,
    kind: 0,
    ambitious: 0,
    loyal: 0,
  };

  for (const option of selectedOptions) {
    traitScores[option.trait] += 1;
  }

  const sorted = Object.entries(traitScores).sort((a, b) => b[1] - a[1]);

  const primaryTrait = sorted[0][0] as PersonalityTrait;
  const secondaryTrait = sorted[1][0] as PersonalityTrait;

  return {
    primaryTrait,
    secondaryTrait,
    traitScores,
  };
}

// 各特质的「生存风格权重」。
// 正值偏向权谋/进取型生存，负值偏向真情/守心型生存——
// 注意：负值不代表「失败」，只是不同的生存风格，结局文案会做对应区分。
const TRAIT_WEIGHTS: Record<PersonalityTrait, number> = {
  cautious: 2,
  scheming: 2,
  decisive: 1,
  ambitious: 1,
  kind: -1.5,
  loyal: -1,
};

/**
 * 根据性格画像判断用户在剧情中能活几集。
 *
 * 设计要点：
 * 1. 按「本次实际抉择数」自适应计算理论分数区间 [min, max]，
 *    再线性映射到 [1, episodeMax]，避免旧公式 +40 基准偏移导致的分布压缩。
 * 2. 善良/忠诚不再被当作「减分项」，而是代表另一种生存风格（炽烈/真情型），
 *    低分对应不同但同样有价值的结局，而非「失败」。
 * 3. episodeMax 由世界观决定（深宫 80 / 末日 24 / 修仙 120），不再全局写死。
 *
 * @param profile     性格画像
 * @param episodeMax  该世界观的集数上限，默认 80（兼容旧调用）
 */
export function calculateEpisodesSurvived(
  profile: PersonalityProfile,
  episodeMax = 80,
): number {
  const { traitScores } = profile;

  const survivalScore = (Object.keys(traitScores) as PersonalityTrait[])
    .reduce((sum, trait) => sum + traitScores[trait] * TRAIT_WEIGHTS[trait], 0);

  const totalChoices = Object.values(traitScores).reduce((a, b) => a + b, 0);

  if (totalChoices === 0) {
    return Math.round(episodeMax / 2); // 无抉择时返回中位值
  }

  const maxPerChoice = Math.max(...Object.values(TRAIT_WEIGHTS)); // 2
  const minPerChoice = Math.min(...Object.values(TRAIT_WEIGHTS)); // -1.5
  const minScore = minPerChoice * totalChoices;
  const maxScore = maxPerChoice * totalChoices;

  // 线性映射 [minScore, maxScore] → [1, episodeMax]
  const ratio = (survivalScore - minScore) / (maxScore - minScore);
  const episodes = Math.max(1, Math.min(episodeMax, Math.round(1 + ratio * (episodeMax - 1))));
  return episodes;
}

/**
 * 将集数映射到所属季
 * @returns 当前季、季索引（0 基）、季内进度（0~1）
 */
export function mapEpisodesToSeason(
  episodes: number,
  seasons: Season[],
): { season: Season; index: number; progress: number } {
  const sorted = [...seasons].sort((a, b) => a.startEpisode - b.startEpisode);
  const foundIdx = sorted.findIndex((s) => episodes >= s.startEpisode && episodes <= s.endEpisode);
  const fallbackIdx = foundIdx === -1 ? sorted.length - 1 : foundIdx;
  const season = sorted[fallbackIdx] ?? sorted[0];
  const span = season.endEpisode - season.startEpisode + 1;
  const progress = Math.max(0, Math.min(1, (episodes - season.startEpisode + 1) / span));
  return { season, index: fallbackIdx, progress };
}

/**
 * 计算单次抉择对存活集数的贡献。
 *
 * 若 choice.episodeCost 已显式设定，直接使用；
 * 否则按特质权重自动派生，保证 8 次抉择累加值与 calculateEpisodesSurvived 公式结果一致。
 * 这使得内容创作者可以逐抉择覆写集数贡献，实现「这次选择让我多活了 X 集」的因果感。
 *
 * @param choice      玩家选择
 * @param episodeMax  世界观集数上限
 * @param totalChoices 本次闯关总抉择数（用于均分集数区间）
 */
export function getEpisodeContribution(
  choice: BranchChoice,
  episodeMax: number,
  totalChoices: number,
): number {
  if (typeof choice.episodeCost === 'number') {
    return choice.episodeCost;
  }

  const weight = TRAIT_WEIGHTS[choice.trait] ?? 0;
  const maxWeight = Math.max(...Object.values(TRAIT_WEIGHTS));
  const minWeight = Math.min(...Object.values(TRAIT_WEIGHTS));
  const weightRange = maxWeight - minWeight;

  if (weightRange === 0 || totalChoices === 0) return 0;

  // 与 calculateEpisodesSurvived 的线性映射保持一致
  const normalized = (weight - minWeight) / weightRange;
  return (normalized * (episodeMax - 1)) / totalChoices;
}
