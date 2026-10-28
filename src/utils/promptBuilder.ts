import type { PersonalityProfile, Worldview } from '../types';
import { TRAIT_LABELS } from '../types';

interface BuildPromptParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  answerSummary: string[];
}

const WORLDVIEW_PROMPT_MAP: Record<string, { setting: string; role: string }> = {
  palace: {
    setting: '这是一个架空的古代王朝后宫，妃嫔争宠、权力倾轧。',
    role: '你是一个刚入宫的妃嫔',
  },
  apocalypse: {
    setting: '丧尸病毒爆发后的末世，资源匮乏，人性考验。',
    role: '你是一个末世幸存者',
  },
  cultivation: {
    setting: '灵气复苏的修仙世界，宗门林立，弱肉强食。',
    role: '你是一个刚踏入修仙路的修士',
  },
};

/**
 * 构建 AI 剧情生成 Prompt
 * 输入世界观、性格画像、答题摘要，输出结构化剧情 JSON
 */
export function buildStoryPrompt({
  worldview,
  profile,
  answerSummary,
}: BuildPromptParams): string {
  const { setting, role } = WORLDVIEW_PROMPT_MAP[worldview.id] ?? WORLDVIEW_PROMPT_MAP.palace;

  const primaryLabel = TRAIT_LABELS[profile.primaryTrait];
  const secondaryLabel = TRAIT_LABELS[profile.secondaryTrait];

  const traitsText = Object.entries(profile.traitScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([trait, score]) => `${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}(${score}次)`)
    .join('、');

  return `你是一个资深网络小说编剧。请根据以下信息，为用户生成一条专属的${worldview.name}生存剧情。

【世界观设定】
${setting}

【用户角色】
${role}

【用户性格画像】
- 主要特质：${primaryLabel}
- 次要特质：${secondaryLabel}
- 特质分布：${traitsText}

【用户答题摘要】（TA 在关键时刻的选择）
${answerSummary.map((s, i) => `${i + 1}. ${s}`).join('\n')}

【创作要求】
1. 生成 300-400 字的剧情，分 3 个段落
2. 剧情结构：登场 → 关键抉择 → 最终结局
3. 剧情要紧扣用户的性格特质
4. 语气简洁有趣，有代入感
5. 不要使用真实人物名或真实 IP 角色名

【输出格式】严格返回 JSON，不要有任何其他文字：
{
  "role": "角色身份（30字以内）",
  "story": ["段落1", "段落2", "段落3"],
  "ending": "结局（50字以内）",
  "episodesSurvived": 存活集数（数字）,
  "personalityAnalysis": "性格分析（80字以内）",
  "shareColor": "十六进制颜色"
}`;
}
