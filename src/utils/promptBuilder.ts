import type { CharacterPortrait, OriginSetup, PersonalityProfile, PersonalityTrait, UserImage, Worldview } from '../types';
import { TRAIT_LABELS } from '../types';

interface BuildPromptParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  answerSummary: string[];
  imageDescription?: string;
  originSetup?: OriginSetup;
}

const WORLDVIEW_PROMPT_MAP: Record<string, { setting: string; role: (gender: string) => string }> = {
  palace: {
    setting: '这是一个架空的古代王朝后宫，妃嫔争宠、权力倾轧。',
    role: (g) => g === 'male' ? '你是一个刚入宫的男子（侍卫/内侍/侍从等身份）' : '你是一个刚入宫的妃嫔',
  },
  apocalypse: {
    setting: '丧尸病毒爆发后的末世，资源匮乏，人性考验。',
    role: (g) => g === 'male' ? '你是一个末世幸存者' : '你是一个末世幸存者',
  },
  cultivation: {
    setting: '灵气复苏的修仙世界，宗门林立，弱肉强食。',
    role: (g) => g === 'male' ? '你是一个刚踏入修仙路的修士' : '你是一个刚踏入修仙路的修士',
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
 * 核心优化：动态演化、个性化、差异化、结局完整性
 */
export function buildStoryPrompt({
  worldview,
  profile,
  answerSummary,
  imageDescription,
  originSetup,
}: BuildPromptParams): string {
  const { setting, role: roleFn } = WORLDVIEW_PROMPT_MAP[worldview.id] ?? WORLDVIEW_PROMPT_MAP.palace;
  const gender = originSetup?.gender ?? 'female';
  const role = roleFn(gender);

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
【用户外貌特征】（基于上传照片分析，角色外貌必须贴合这些特征）
${imageDescription}`
    : '';

  // 将答题摘要转化为剧情影响说明
  const answerImpact = answerSummary.length > 0
    ? `
【用户的关键选择】（这些选择必须在剧情中得到呼应和推演）
${answerSummary.map((s, i) => `第${i + 1}个抉择：${s}`).join('\n')}

【剧情演化要求】
- 每一个抉择都必须对后续剧情产生实质性影响，不能只是并列叙述
- 前一个抉择的后果要成为后一个抉择的前提条件
- 剧情走向必须体现"选择→后果→新选择→新后果"的推演链条
- 最终结局必须是所有抉择累积的结果，具备因果逻辑性`
    : '';

  return `你是一个资深网络小说编剧，擅长创作具有逻辑深度和角色弧光的剧情。请根据以下信息，为用户生成一条专属的${worldview.name}生存剧情。

【随机种子】${seed}（请基于此种子创造全新独特的内容，不要重复任何已生成过的剧情，角色名、情节、结局必须独一无二）

【世界观设定】
${setting}

【用户角色】
${role}
${imageSection}

【用户性格画像】
- 主要特质：${primaryLabel}
- 次要特质：${secondaryLabel}
- 特质分布：${traitsText}

${answerImpact}

【创作要求】
1. 剧情分 3 个段落，每段 100-150 字，总计 300-450 字
2. 剧情结构严格遵循：登场入局 → 关键抉择与演化 → 结局收束
3. 【动态演化】剧情不是固定模板，必须根据用户的性格特质和具体选择动态推演，每个抉择都要改变后续剧情的走向
4. 【个性化】角色的言行、决策风格必须符合其性格画像（如谨慎型会三思后行，果断型会当机立断）
5. 【差异化】与其他用户的剧情重合度不得超过15%，角色名、关键情节、结局必须有显著差异
6. 【结局完整性】结局不能草率，要呼应前文所有伏笔，给角色一个符合其性格和选择的归宿，结局字数 60-100 字
7. 角色画像要结合外貌特征和性格特质，生成独属于该用户的角色设定
8. 不要使用真实人物名或真实 IP 角色名
9. 语气简洁有力，有代入感和画面感

【输出格式】严格返回 JSON，不要有任何其他文字：
{
  "role": "角色身份设定（40字以内，包含名字、身份、核心背景）",
  "story": ["登场入局段落", "抉择演化段落", "高潮转折段落"],
  "ending": "完整结局（60-100字，呼应前文，给角色归宿）",
  "episodesSurvived": 存活集数（数字，根据性格和选择合理推算）,
  "personalityAnalysis": "深度性格分析（100字以内，结合剧情表现分析）",
  "shareColor": "十六进制颜色（符合世界观氛围）",
  "characterPortrait": {
    "name": "原创角色名（独特，不与常见角色重复）",
    "appearance": "外貌形象描述（结合用户外貌特征，60字以内，包含脸型、眼睛、发型、气质）",
    "background": "人物背景设定（60字以内，包含出身、经历、目标）",
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
 * 重点：极度详细的外貌特征，确保生成结果与用户本人特征一致
 */
export function buildImagePrompt({
  worldview,
  characterPortrait,
  userImage,
}: BuildImagePromptParams): string {
  const imgCfg = WORLDVIEW_IMAGE_MAP[worldview.id] ?? WORLDVIEW_IMAGE_MAP.cultivation;

  // 用户外貌特征（从照片分析得出，用于保留辨识度）
  // 将中文描述拆解为具体的英文特征词
  const userFeatures = userImage?.description
    ? parseAppearanceToFeatures(userImage.description)
    : '';

  // 角色外貌描述
  const charAppearance = characterPortrait.appearance || 'elegant and distinctive appearance';

  // 性格标签转换为神态描述
  const moodTags = characterPortrait.personalityTags
    .map((tag) => MOOD_MAP[tag])
    .filter(Boolean)
    .join(', ');

  const prompt = [
    `photorealistic portrait of ${characterPortrait.name}, a character in ${worldview.name} world.`,
    userFeatures ? `IMPORTANT facial features to preserve: ${userFeatures}. ` : '',
    `Detailed appearance: ${charAppearance}.`,
    `Costume: ${imgCfg.costume}.`,
    `Scene: ${imgCfg.scene}.`,
    `Facial expression and mood: ${moodTags || 'compelling and expressive look'}.`,
    `Lighting and atmosphere: ${imgCfg.atmosphere}.`,
    `Art style: ${imgCfg.style}.`,
    `Key requirements: preserve the exact facial features described above, maintain ${imgCfg.costume.split(',')[0]} costume style, keep the ${worldview.name} world setting, high facial detail, natural skin texture, lifelike eyes, photorealistic quality.`,
  ].filter(Boolean).join(' ');

  return prompt;
}

/**
 * 构建图生图（img2img）专用 Prompt
 * 当用户上传了参考图片时使用：保留原图的构图、服饰、风格、背景元素，仅替换人脸特征
 * 与 buildImagePrompt 的区别：强调"保留原图一切，只换脸"
 */
export function buildImg2ImgPrompt({
  worldview,
  characterPortrait,
  userImage,
}: BuildImagePromptParams): string {
  const imgCfg = WORLDVIEW_IMAGE_MAP[worldview.id] ?? WORLDVIEW_IMAGE_MAP.cultivation;

  // 从用户图片描述中解析出人脸特征（用于替换）
  const userFeatures = userImage?.description
    ? parseAppearanceToFeatures(userImage.description)
    : '';

  const charAppearance = characterPortrait.appearance || 'elegant and distinctive appearance';

  const moodTags = characterPortrait.personalityTags
    .map((tag) => MOOD_MAP[tag])
    .filter(Boolean)
    .join(', ');

  const prompt = [
    `Face swap on the reference image.`,
    `Keep EVERYTHING from the reference image unchanged: composition, pose, costume, clothing, accessories, hairstyle color, background, lighting, art style, and color palette.`,
    `ONLY replace the face with a new face that has these features: ${userFeatures || charAppearance}.`,
    `New face expression and mood: ${moodTags || 'natural and lifelike expression'}.`,
    `The new face must blend naturally with the reference image's lighting, skin tone, and style.`,
    `Preserve the ${worldview.name} world setting: ${imgCfg.scene}, ${imgCfg.costume}.`,
    `Art style: ${imgCfg.style}.`,
    `CRITICAL: Do not change the body, clothing, pose, background, or any element except the face. The face must look like it belongs in the original photo.`,
  ].filter(Boolean).join(' ');

  return prompt;
}

/**
 * 性格标签 → 英文神态描述映射（供 buildImagePrompt / buildImg2ImgPrompt 共用）
 */
const MOOD_MAP: Record<string, string> = {
  '谨慎隐忍': 'calm and composed expression, calculating eyes',
    '果断强势': 'confident and determined expression, sharp gaze',
    '心机深沉': 'calculating and mysterious gaze, shrewd eyes',
    '善良单纯': 'gentle and kind expression, warm eyes',
    '野心勃勃': 'ambitious and intense gaze, fierce eyes',
    '重情重义': 'loyal and warm expression, sincere eyes',
    '坚韧不拔': 'resolute and unyielding expression, firm eyes',
    '深谋远虑': 'thoughtful and strategic gaze, wise eyes',
    '外柔内刚': 'soft exterior with inner strength, gentle but firm',
    '善于布局': 'scheming and intelligent look, cunning eyes',
    '果断勇敢': 'bold and courageous expression, fearless eyes',
    '心地善良': 'kind-hearted and warm, compassionate eyes',
    '有领导力': 'commanding and authoritative presence, dominant gaze',
    '剑走偏锋': 'unconventional and sharp gaze, eccentric eyes',
    '步步为营': 'strategic and patient expression, calculating eyes',
    '明哲保身': 'cautious and guarded expression, watchful eyes',
    '静观其变': 'observant and patient expression, alert eyes',
    '韬光养晦': 'modest exterior, hidden depth, subtle intelligence',
    '察言观色': 'perceptive and attentive expression, observant eyes',
    '雷厉风行': 'dynamic and forceful expression, energetic eyes',
    '杀伐决断': 'ruthless and decisive expression, cold eyes',
    '说一不二': 'authoritative and commanding expression, dominant eyes',
    '当机立断': 'decisive and quick expression, alert eyes',
    '铁腕手段': 'tough and uncompromising expression, stern eyes',
    '运筹帷幄': 'masterful and strategic expression, brilliant eyes',
    '工于心计': 'manipulative and cunning expression, sly eyes',
    '暗藏锋芒': 'unassuming exterior, hidden sharpness, subtle power',
    '心怀慈悲': 'compassionate and merciful expression, tender eyes',
    '温柔体贴': 'gentle and considerate expression, soft eyes',
    '纯真无邪': 'innocent and pure expression, naive eyes',
    '以德报怨': 'forgiving and noble expression, magnanimous eyes',
    '不甘人后': 'competitive and driven expression, ambitious eyes',
    '志在巅峰': 'aspiring and determined expression, lofty eyes',
    '步步登高': 'ascendant and ambitious expression, climbing gaze',
    '权势滔天': 'domineering and powerful expression, overwhelming presence',
    '睥睨天下': 'arrogant and superior expression, disdainful eyes',
    '忠贞不渝': 'faithful and devoted expression, loyal eyes',
    '知恩图报': 'grateful and loyal expression, thankful eyes',
    '誓死相随': 'devoted and unwavering expression, committed eyes',
    '情深义重': 'deeply emotional and loyal expression, heartfelt eyes',
    '不离不弃': 'steadfast and loyal expression, devoted eyes',
    '居安思危': 'vigilant and cautious expression, alert eyes',
    '未雨绸缪': 'foresighted and prepared expression, planning eyes',
    '瞻前顾后': 'careful and hesitant expression, cautious eyes',
    '稳扎稳打': 'steady and methodical expression, grounded eyes',
    '一往无前': 'fearless and advancing expression, bold eyes',
    '破釜沉舟': 'desperate and determined expression, do-or-die eyes',
    '老谋深算': 'scheming and experienced expression, calculating eyes',
    '不择手段': 'ruthless and unscrupulous expression, cold eyes',
    '诡计多端': 'deceitful and cunning expression, tricky eyes',
    '舍己为人': 'selfless and altruistic expression, sacrificing eyes',
    '仁心仁术': 'benevolent and skilled expression, kind eyes',
    '逐鹿天下': 'competitive and ambitious expression, conquering eyes',
    '生死与共': 'loyal and shared-fate expression, bonded eyes',
    '肝胆相照': 'honest and loyal expression, sincere eyes',
    '同生共死': 'devoted and fatal expression, committed eyes',
    '一诺千金': 'trustworthy and honorable expression, reliable eyes',
};

/**
 * 将中文外貌描述解析为详细的英文特征词列表
 * 帮助图片生成模型更精准地还原用户外貌
 */
function parseAppearanceToFeatures(description: string): string {
  const features: string[] = [];

  // 脸型
  if (description.match(/鹅蛋脸|瓜子脸|圆脸|方脸|心形脸|长脸|国字脸/)) {
    const faceMap: Record<string, string> = {
      '鹅蛋脸': 'oval face shape',
      '瓜子脸': 'heart-shaped face, pointed chin',
      '圆脸': 'round face, full cheeks',
      '方脸': 'square jaw, angular face',
      '心形脸': 'heart-shaped face',
      '长脸': 'long face shape',
      '国字脸': 'square face, strong jawline',
    };
    for (const [cn, en] of Object.entries(faceMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 眼睛
  if (description.match(/丹凤眼|桃花眼|杏眼|柳叶眼|瑞凤眼|大眼睛|小眼睛|单眼皮|双眼皮/)) {
    const eyeMap: Record<string, string> = {
      '丹凤眼': 'almond-shaped eyes, slightly upturned',
      '桃花眼': 'peach-blossom eyes, alluring',
      '杏眼': 'apricot eyes, round and bright',
      '柳叶眼': 'willow-leaf eyes, slender',
      '瑞凤眼': 'phoenix eyes, majestic',
      '大眼睛': 'large eyes',
      '小眼睛': 'small eyes',
      '单眼皮': 'monolid eyes',
      '双眼皮': 'double eyelid',
    };
    for (const [cn, en] of Object.entries(eyeMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 鼻子
  if (description.match(/高鼻梁|塌鼻梁|鹰钩鼻|小巧鼻子/)) {
    const noseMap: Record<string, string> = {
      '高鼻梁': 'high nose bridge',
      '塌鼻梁': 'flat nose',
      '鹰钩鼻': 'aquiline nose',
      '小巧鼻子': 'small delicate nose',
    };
    for (const [cn, en] of Object.entries(noseMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 嘴唇
  if (description.match(/薄唇|厚唇|樱桃小嘴|丰唇/)) {
    const lipMap: Record<string, string> = {
      '薄唇': 'thin lips',
      '厚唇': 'full lips',
      '樱桃小嘴': 'small cherry-like mouth',
      '丰唇': 'plump lips',
    };
    for (const [cn, en] of Object.entries(lipMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 肤色
  if (description.match(/白皙|小麦色|古铜色|黝黑|苍白/)) {
    const skinMap: Record<string, string> = {
      '白皙': 'fair skin',
      '小麦色': 'wheat-colored skin',
      '古铜色': 'bronze skin',
      '黝黑': 'dark tan skin',
      '苍白': 'pale skin',
    };
    for (const [cn, en] of Object.entries(skinMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 发型
  if (description.match(/长发|短发|卷发|直发|刘海|马尾|丸子头/)) {
    const hairMap: Record<string, string> = {
      '长发': 'long hair',
      '短发': 'short hair',
      '卷发': 'curly hair',
      '直发': 'straight hair',
      '刘海': 'bangs',
      '马尾': 'ponytail',
      '丸子头': 'bun hairstyle',
    };
    for (const [cn, en] of Object.entries(hairMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 性别/年龄
  if (description.match(/年轻|少年|少女|中年|老年|男人|女人|男性|女性/)) {
    const ageMap: Record<string, string> = {
      '年轻': 'young',
      '少年': 'young male',
      '少女': 'young female',
      '中年': 'middle-aged',
      '老年': 'elderly',
      '男人': 'male',
      '女人': 'female',
      '男性': 'male',
      '女性': 'female',
    };
    for (const [cn, en] of Object.entries(ageMap)) {
      if (description.includes(cn)) features.push(en);
    }
  }

  // 如果没有解析出具体特征，使用原始描述
  if (features.length === 0) {
    return description;
  }

  return features.join(', ');
}

// ============================================================================
// 角色生成系统：出身背景 + 天赋 + 性格倾向 → 文生图提示词
// 核心设计：
// 1. 出身背景 → 身份、服饰、社会地位、场景元素
// 2. 天赋词条 → 外貌特征（容貌、体质、气质）
// 3. 性格倾向 → 表情、姿态、神态
// 4. 相同三维度组合 → 确定性 seed → 高度相似图片
// ============================================================================

/** 出身背景 → 图片特征映射（身份 + 服饰 + 社会地位） */
const ORIGIN_BG_IMAGE_MAP: Record<string, { identity: string; costume: string; status: string }> = {
  // 深宫风云
  'palace-medic': {
    identity: 'young medical apprentice in the imperial palace',
    costume: 'simple teal scholar robe with medicinal herb sachet, modest hairpin',
    status: 'humble but skilled, observant posture',
  },
  'palace-maid': {
    identity: 'low-ranking palace maid in the laundry bureau',
    costume: 'plain coarse linen palace uniform, simple bun hairstyle, no jewelry',
    status: 'humble background, cautious and downcast posture',
  },
  'palace-noble': {
    identity: 'elegant daughter of a high-ranking official family',
    costume: 'exquisite embroidered silk hanfu, jade hairpins, gold thread details',
    status: 'noble and dignified bearing, refined posture',
  },
  'palace-criminal': {
    identity: 'daughter of a disgraced and executed official',
    costume: 'plain dark-colored clothing, worn and simple, no adornments',
    status: 'weary but resilient, defiant eyes, restrained posture',
  },
  'palace-merchant': {
    identity: 'daughter of a wealthy merchant family',
    costume: 'elegant silk robe with subtle gold trim, pearl earrings',
    status: 'composed and shrewd, confident bearing',
  },
  // 末日求生
  'apo-student': {
    identity: 'university student caught in the zombie apocalypse',
    costume: 'casual hoodie and jeans, backpack, slightly disheveled',
    status: 'ordinary but determined, alert and tense posture',
  },
  'apo-doctor': {
    identity: 'emergency room doctor during the outbreak',
    costume: 'worn medical scrubs, stethoscope, blood-stained coat',
    status: 'professional and calm under pressure, focused expression',
  },
  'apo-soldier': {
    identity: 'veteran ex-soldier surviving in the wasteland',
    costume: 'tactical military gear, combat boots, weapon holster',
    status: 'disciplined and battle-hardened, vigilant stance',
  },
  'apo-civilian': {
    identity: 'ordinary office worker thrown into the apocalypse',
    costume: 'rumpled business casual clothes, exhausted look',
    status: 'ordinary person driven by survival instinct, anxious posture',
  },
  'apo-prepper': {
    identity: 'doomsday prepper who predicted the collapse',
    costume: 'rugged outdoor gear, utility belt, well-equipped',
    status: 'confident and self-reliant, ready posture',
  },
  // 修仙问道
  'cul-mortal': {
    identity: 'ordinary village youth who stumbled onto the cultivation path',
    costume: 'simple cloth robes, straw sandals, no accessories',
    status: 'humble beginnings, earnest and determined look',
  },
  'cul-sect': {
    identity: 'young master from a prestigious cultivation sect family',
    costume: 'flowing sect robes with clan emblem, jade pendant, sword',
    status: 'cultivated and noble bearing, composed posture',
  },
  'cul-orphan': {
    identity: 'orphaned rogue cultivator wandering alone',
    costume: 'patched and worn traveling robes, cloth bandages, scabbard',
    status: 'lonely and resilient, guarded posture, sharp eyes',
  },
  'cul-scholar': {
    identity: 'failed scholar who turned to cultivation',
    costume: 'scholar robes with ink stains, folding fan, hairpin',
    status: 'thoughtful and learned, contemplative posture',
  },
  'cul-royal': {
    identity: 'mortal prince recruited by a cultivation sect',
    costume: 'ornate royal robes adapted for cultivation, crown ornament',
    status: 'regal and calculating, commanding presence',
  },
};

/** 天赋词条 → 外貌/气质特征映射 */
const TALENT_FEATURE_MAP: Record<string, string> = {
  // 容貌类
  '绝色容颜': 'strikingly beautiful face, perfect features, captivating beauty',
  '容貌平平': 'plain ordinary face, unremarkable looks, average appearance',
  // 体质类
  '体弱多病': 'pale sickly complexion, frail thin build, delicate constitution',
  '力大无穷': 'strong muscular build, powerful physique, robust constitution',
  '深度近视': 'wearing round glasses, squinting slightly, bookish look',
  '旧伤缠身': 'visible old scars, slightly stiff movement, weathered look',
  '体质孱弱': 'thin fragile body, weak constitution, easily tired look',
  // 气质/神态类
  '心思缜密': 'intelligent thoughtful eyes, analytical and observant expression',
  '玲珑七窍': 'clever perceptive gaze, quick-witted and sharp expression',
  '福星高照': 'warm lucky aura, bright optimistic expression, gentle glow',
  '琴棋书画': 'refined cultured bearing, elegant artistic temperament, graceful hands',
  '武学天赋': 'athletic agile build, sharp reflexive eyes, martial bearing',
  '家世显赫': 'confident privileged bearing, well-groomed, aristocratic features',
  '听觉敏锐': 'alert attentive expression, slightly tilted head, keen senses',
  '野外生存': 'weathered rugged features, calloused hands, survivor look',
  '急救精通': 'calm focused expression, steady hands, medical confidence',
  '百步穿杨': 'sharp-eyed and precise, steady hands, hunter focus',
  '物资囤积': 'practical prepared expression, resourceful look',
  '机械精通': 'inventive clever expression, grease-stained hands, tinker build',
  '领袖气质': 'commanding authoritative presence, natural leader charisma',
  '方向感差': 'slightly confused expression, uncertain look',
  '胆小如鼠': 'timid nervous expression, flinching posture',
  '社交恐惧': 'withdrawn anxious expression, avoiding eye contact',
  // 修仙专属
  '天灵根': 'radiant spiritual aura, glowing eyes, celestial temperament',
  '双灵根': 'bright spiritual energy, clear eyes, talented cultivator look',
  '天生道体': 'ethereal body, flowing spiritual light, otherworldly grace',
  '剑心通明': 'sharp sword-like gaze, focused martial cultivator bearing',
  '丹道天赋': 'knowledgeable expression, alchemist bearing, steady hands',
  '气运加身': 'luminous fortune aura, serendipitous glow, blessed look',
  '心境通透': 'serene enlightened expression, peaceful clear eyes',
  '五灵根': 'dim spiritual energy, average cultivation talent, ordinary look',
  '四灵根': 'weak spiritual affinity, slow cultivation look',
  '魔根深种': 'dark swirling aura in eyes, hidden demonic temptation',
  '经脉堵塞': 'strained expression, visible effort in cultivation, weak qi flow',
  '凡心难断': 'turbulent emotional expression, worldly attachments in eyes',
  '口无遮拦': 'blunt outspoken expression, slightly rebellious look',
  '优柔寡断': 'hesitant uncertain expression, indecisive eyes',
  '名声不佳': 'wary guarded expression, people avoid, lone wolf look',
};

/** 性格倾向 → 表情/姿态映射（确定性，不随机） */
const TRAIT_POSE_MAP: Record<string, string> = {
  cautious: 'calm and composed expression, calculating watchful eyes, hands clasped behind back',
  decisive: 'confident and determined expression, sharp firm gaze, upright bold posture',
  scheming: 'calculating and mysterious gaze, shrewd cunning eyes, subtle knowing smile',
  kind: 'gentle and kind expression, warm compassionate eyes, soft open posture',
  ambitious: 'ambitious and intense gaze, fierce determined eyes, chin slightly raised',
  loyal: 'loyal and warm expression, sincere steadfast eyes, dependable upright stance',
};

/**
 * 基于出身设定三维度构建文生图提示词
 * 映射逻辑：出身背景→身份服饰、天赋→外貌特征、性格倾向→表情姿态
 * 相同组合生成相同提示词 → 结合确定性 seed → 高度相似图片
 */
export function buildOriginImagePrompt(worldview: Worldview, origin: OriginSetup): string {
  return buildFinalCharacterPrompt(worldview, origin, []);
}

/**
 * 将出身身份描述按性别改写，确保图片生成的角色性别与玩家选择一致
 * 例如 "daughter of a wealthy merchant family" → 男性时改为 "son of a wealthy merchant family"
 */
function applyGenderToIdentity(identity: string, gender: 'male' | 'female'): string {
  if (gender === 'male') {
    return identity
      .replace(/\bdaughter\b/gi, 'son')
      .replace(/\bmaid\b/gi, 'attendant')
      .replace(/\bgirl\b/gi, 'young man')
      .replace(/\bwoman\b/gi, 'man')
      .replace(/\bfemale\b/gi, 'male')
      .replace(/\bprincess\b/gi, 'prince')
      .replace(/\bconcubine\b/gi, 'courtier');
  }
  return identity;
}

/**
 * 基于出身三维度 + 剧情选择轨迹构建最终角色形象提示词
 * 在出身设定的基础上，叠加整个剧情过程中的抉择轨迹，让角色形象反映玩家的完整人生
 *
 * @param traitHistory 剧情中历次选择的特质轨迹，如 ['cautious', 'decisive', 'kind', ...]
 */
export function buildFinalCharacterPrompt(
  worldview: Worldview,
  origin: OriginSetup,
  traitHistory: PersonalityTrait[],
): string {
  const imgCfg = WORLDVIEW_IMAGE_MAP[worldview.id] ?? WORLDVIEW_IMAGE_MAP.cultivation;
  const bg = ORIGIN_BG_IMAGE_MAP[origin.background.id] ?? {
    identity: 'a unique character',
    costume: imgCfg.costume,
    status: 'distinctive bearing',
  };

  // 性别：确保图片生成的角色性别与玩家选择一致，默认女性
  const gender = origin.gender ?? 'female';
  const genderDescriptor = gender === 'male'
    ? 'a handsome young man, masculine features, male'
    : 'a beautiful young woman, feminine features, female';
  const genderedIdentity = applyGenderToIdentity(bg.identity, gender);

  // 天赋特征
  const talentFeatures = origin.talents
    .map((t) => TALENT_FEATURE_MAP[t.name])
    .filter(Boolean)
    .join(', ');

  // 性格倾向（初始）
  const initialPose = TRAIT_POSE_MAP[origin.initialTrait] ?? TRAIT_POSE_MAP.kind;

  // 剧情轨迹：统计主导特质，用于反映角色经历剧情后的气质变化
  const traitCount: Record<string, number> = {};
  traitHistory.forEach((t) => { traitCount[t] = (traitCount[t] ?? 0) + 1; });
  const dominantTrait = Object.entries(traitCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantPose = dominantTrait ? TRAIT_POSE_MAP[dominantTrait] : null;

  // 组合表情：初始性格 + 剧情主导特质融合（有剧情轨迹时以主导特质为主，体现成长）
  const finalPose = dominantPose && traitHistory.length >= 3
    ? `${dominantPose} (evolved from initial ${origin.initialTrait} nature through life choices)`
    : initialPose;

  // 经历印记：根据剧情长度和选择多样性添加岁月痕迹
  const experienceMark = traitHistory.length >= 5
    ? 'visible signs of life experience, weathered by events, eyes showing the weight of choices made'
    : traitHistory.length >= 2
    ? 'subtle traces of the journey so far'
    : 'fresh and untested look';

  const prompt = [
    `cinematic portrait of ${genderDescriptor}, ${genderedIdentity}, a character in the ${worldview.name} world.`,
    `Costume: ${bg.costume}. Social bearing: ${bg.status}.`,
    talentFeatures ? `Distinctive features from talents: ${talentFeatures}.` : '',
    `Facial expression, pose and temperament: ${finalPose}.`,
    `Life experience: ${experienceMark}.`,
    `Scene background: ${imgCfg.scene}.`,
    `Lighting and atmosphere: ${imgCfg.atmosphere}.`,
    `Art style: ${imgCfg.style}.`,
    `high detail, 8k resolution, professional character concept art, sharp focus, natural skin texture, lifelike eyes, detailed fabric textures.`,
    `Negative: low quality, blurry, distorted, deformed, extra fingers, watermark, text, ugly, duplicate, mutation, bad anatomy, bad proportions, wrong gender.`,
  ].filter(Boolean).join(' ');

  return prompt;
}

/**
 * 基于三维度组合（含剧情轨迹）生成确定性 seed
 * 相同的出身背景 + 天赋组合 + 性格倾向 + 剧情轨迹 → 相同 seed → 高度相似图片
 */
export function hashOriginSeed(origin: OriginSetup, traitHistory?: PersonalityTrait[]): number {
  const talentIds = [...origin.talents].map((t) => t.id).sort().join('|');
  const historyKey = (traitHistory ?? []).join('-');
  const key = `${origin.background.id}::${talentIds}::${origin.initialTrait}::${historyKey}`;

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) % 1000000;
}


