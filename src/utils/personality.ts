import type { PersonalityProfile, PersonalityTrait, QuizOption } from '../types';

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

/**
 * 根据性格画像判断用户在剧情中能活几集
 * 心机+谨慎=活得久，善良+忠诚=容易早死
 */
export function calculateEpisodesSurvived(
  profile: PersonalityProfile,
): number {
  const { traitScores } = profile;

  // 生存分 = 谨慎*2 + 心机*2 + 果断*1 + 野心*1 - 善良*1.5 - 忠诚*1
  const survivalScore =
    traitScores.cautious * 2 +
    traitScores.scheming * 2 +
    traitScores.decisive * 1 +
    traitScores.ambitious * 1 -
    traitScores.kind * 1.5 -
    traitScores.loyal * 1;

  // 映射到 1-80 集
  const episodes = Math.max(1, Math.min(80, Math.round(survivalScore * 5 + 40)));
  return episodes;
}
