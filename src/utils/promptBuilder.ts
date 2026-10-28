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
1. 生成 600-900 字的剧情，分 4-6 个段落
2. 剧情结构：登场 → 第一次危机 → 关键抉择 → 高潮冲突 → 最终结局
3. 剧情要紧扣用户的性格特质，让选择影响结局走向
4. 结局要明确：在这个世界里活了多久/最终命运如何
5. 语气有趣、有代入感，可以有适度的网络梗和自嘲
6. 最后附一段"性格分析"：把用户在剧情中的表现映射到现实中的处世建议
7. 不要使用真实人物名或真实 IP 角色名，全部用原创名称

【输出格式】严格返回 JSON，不要有任何其他文字：
{
  "role": "你的角色身份和背景设定（50字以内）",
  "story": ["剧情段落1", "剧情段落2", "剧情段落3", "剧情段落4"],
  "ending": "结局描述（100字以内，说明活了多久、最终命运）",
  "episodesSurvived": 存活的集数（数字）,
  "personalityAnalysis": "性格分析+现实处世建议（150字以内）",
  "shareColor": "分享卡主色（十六进制，如 #c87a35）"
}`;
}
