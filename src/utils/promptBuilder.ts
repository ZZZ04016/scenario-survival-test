import type { CharacterPortrait, PersonalityProfile, UserImage, Worldview } from '../types';
import { TRAIT_LABELS } from '../types';

interface BuildPromptParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  answerSummary: string[];
  imageDescription?: string;
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
 * 生成一个随机种子，确保每次生成内容都有差异
 */
function generateRandomSeed(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let seed = '';
  for (let i = 0; i < 8; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

/**
 * 构建 AI 剧情生成 Prompt
 * 输入世界观、性格画像、答题摘要、图片描述，输出结构化剧情 JSON
 * 包含角色画像 + 唯一性多样性保障
 */
export function buildStoryPrompt({
  worldview,
  profile,
  answerSummary,
  imageDescription,
}: BuildPromptParams): string {
  const { setting, role } = WORLDVIEW_PROMPT_MAP[worldview.id] ?? WORLDVIEW_PROMPT_MAP.palace;

  const primaryLabel = TRAIT_LABELS[profile.primaryTrait];
  const secondaryLabel = TRAIT_LABELS[profile.secondaryTrait];

  const traitsText = Object.entries(profile.traitScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([trait, score]) => `${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}(${score}次)`)
    .join('、');

  const seed = generateRandomSeed();

  const imageSection = imageDescription
    ? `
【用户外貌特征】（基于上传照片分析）
${imageDescription}`
    : '';

  return `你是一个资深网络小说编剧。请根据以下信息，为用户生成一条专属的${worldview.name}生存剧情。

【随机种子】${seed}（请基于此种子创造全新独特的内容，不要重复任何已生成过的剧情）

【世界观设定】
${setting}

【用户角色】
${role}
${imageSection}

【用户性格画像】
- 主要特质：${primaryLabel}
- 次要特质：${secondaryLabel}
- 特质分布：${traitsText}

【用户答题摘要】（TA 在关键时刻的选择）
${answerSummary.map((s, i) => `${i + 1}. ${s}`).join('\n')}

【创作要求】
1. 生成 300-400 字的剧情，分 3 个段落
2. 剧情结构：登场 → 关键抉择 → 最终结局
3. 剧情要紧扣用户的性格特质和外貌特征
4. 语气简洁有趣，有代入感
5. 不要使用真实人物名或真实 IP 角色名
6. 【唯一性要求】必须根据随机种子和用户的独特选择，创造出与其他任何用户都不相同的剧情，角色名、情节细节、结局都要有显著差异，重合度不得超过15%
7. 角色画像要结合外貌特征和性格特质，生成独属于该用户的角色设定

【输出格式】严格返回 JSON，不要有任何其他文字：
{
  "role": "角色身份（30字以内）",
  "story": ["段落1", "段落2", "段落3"],
  "ending": "结局（50字以内）",
  "episodesSurvived": 存活集数（数字）,
  "personalityAnalysis": "性格分析（80字以内）",
  "shareColor": "十六进制颜色",
  "characterPortrait": {
    "name": "原创角色名",
    "appearance": "外貌形象描述（结合用户外貌特征，50字以内）",
    "background": "人物背景设定（50字以内）",
    "personalityTags": ["性格标签1", "性格标签2", "性格标签3", "性格标签4"]
  }
}`;
}

// 世界观对应的图片场景、服装、氛围映射
const WORLDVIEW_IMAGE_MAP: Record<string, {
  scene: string;        // 场景背景
  costume: string;      // 服装风格
  atmosphere: string;   // 氛围光影
  style: string;        // 画风
}> = {
  palace: {
    scene: 'ancient Chinese imperial palace, ornate halls, red pillars, golden decorations, silk curtains',
    costume: 'elaborate traditional Chinese hanfu, imperial concubine robe, silk fabrics, jade ornaments, intricate embroidery',
    atmosphere: 'soft golden lighting, dramatic shadows, luxurious atmosphere, warm color palette',
    style: 'cinematic, photorealistic, high detail, 8k, professional portrait photography',
  },
  apocalypse: {
    scene: 'post-apocalyptic ruins, abandoned city, broken buildings, debris, overcast sky, dust particles',
    costume: 'worn tactical clothing, torn jacket, rugged survival gear, dusty and weathered look',
    atmosphere: 'harsh daylight, desaturated colors, gritty atmosphere, dramatic side lighting',
    style: 'cinematic, photorealistic, high detail, 8k, gritty realism',
  },
  cultivation: {
    scene: 'misty mountain peaks, ancient Chinese cultivation sect, floating clouds, pine trees, traditional architecture',
    costume: 'flowing immortal robes, celestial silk garments, jade accessories, ethereal and elegant style',
    atmosphere: 'ethereal misty lighting, soft volumetric light, cool blue-green palette, magical atmosphere',
    style: 'cinematic, photorealistic, high detail, 8k, fantasy art',
  },
};

interface BuildImagePromptParams {
  worldview: Worldview;
  characterPortrait: CharacterPortrait;
  userImage?: UserImage | null;
}

/**
 * 构建图片生成 Prompt（英文，适合 Pollinations.ai 等图片生成模型）
 * 结合用户外貌特征 + 角色画像 + 世界观场景，生成高度定制化的角色图片描述
 */
export function buildImagePrompt({
  worldview,
  characterPortrait,
  userImage,
}: BuildImagePromptParams): string {
  const imgCfg = WORLDVIEW_IMAGE_MAP[worldview.id] ?? WORLDVIEW_IMAGE_MAP.cultivation;

  // 用户外貌特征（从照片分析得出，用于保留辨识度）
  const userFeatures = userImage?.description
    ? `facial features: ${userImage.description}. `
    : '';

  // 角色外貌描述
  const charAppearance = characterPortrait.appearance || 'elegant and distinctive appearance';

  // 性格标签转换为神态描述
  const moodMap: Record<string, string> = {
    '谨慎隐忍': 'calm and composed expression',
    '果断强势': 'confident and determined expression',
    '心机深沉': 'calculating and mysterious gaze',
    '善良单纯': 'gentle and kind expression',
    '野心勃勃': 'ambitious and intense gaze',
    '重情重义': 'loyal and warm expression',
    '坚韧不拔': 'resolute and unyielding expression',
    '深谋远虑': 'thoughtful and strategic gaze',
    '外柔内刚': 'soft exterior with inner strength',
    '善于布局': 'scheming and intelligent look',
    '果断勇敢': 'bold and courageous expression',
    '心地善良': 'kind-hearted and warm',
    '有领导力': 'commanding and authoritative presence',
    '剑走偏锋': 'unconventional and sharp gaze',
  };

  const moodTags = characterPortrait.personalityTags
    .map((tag) => moodMap[tag])
    .filter(Boolean)
    .join(', ');

  const prompt = [
    `photorealistic portrait of ${characterPortrait.name}, a character in ${worldview.name} world.`,
    `${userFeatures}`,
    `Appearance: ${charAppearance}.`,
    `Costume: ${imgCfg.costume}.`,
    `Scene: ${imgCfg.scene}.`,
    `Mood: ${moodTags || 'compelling and expressive look'}.`,
    `Background: ${imgCfg.atmosphere}.`,
    `Style: ${imgCfg.style}.`,
    `The character should look like a real person with detailed facial features, natural skin texture, expressive eyes, and lifelike presence.`,
  ].join(' ');

  return prompt;
}

