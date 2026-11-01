// 性格特质标签
export type PersonalityTrait =
  | 'cautious'      // 谨慎隐忍
  | 'decisive'      // 果断强势
  | 'scheming'      // 心机深沉
  | 'kind'          // 善良单纯
  | 'ambitious'     // 野心勃勃
  | 'loyal';        // 重情重义

// 性格特质映射（中文）
export const TRAIT_LABELS: Record<PersonalityTrait, string> = {
  cautious: '谨慎隐忍',
  decisive: '果断强势',
  scheming: '心机深沉',
  kind: '善良单纯',
  ambitious: '野心勃勃',
  loyal: '重情重义',
};

// 世界观类型
export type WorldviewId = 'palace' | 'apocalypse' | 'cultivation';

// 分季结构
export interface Season {
  name: string;          // 季名，如「一季·入宫」
  startEpisode: number;  // 该季起始集（含）
  endEpisode: number;    // 该季结束集（含）
}

// 世界观配置
export interface Worldview {
  id: WorldviewId;
  name: string;
  tagline: string;
  description: string;
  coverEmoji: string;
  accentColor: string;
  bgGradient: string;
  episodeMax: number;    // 该世界观的集数上限（不同题材长度不同）
  seasons: Season[];     // 分季结构，用于结果页叙事化展示
}

// 选择题选项
export interface QuizOption {
  id: string;
  text: string;
  trait: PersonalityTrait;
}

// 知识点（核心考核目标）
export interface KnowledgePoint {
  id: string;
  name: string;           // 知识点名称
  description: string;    // 知识点说明
  category: string;       // 分类（如"风险决策""人际博弈"）
  realWorldMapping: string; // 真实应用场景映射
}

// 题目互动类型（多元答题形态）
export type QuestionType =
  | 'choice'           // 经典选择题
  | 'scenario'         // 情景模拟题（带情境描述+多步决策）
  | 'ranking'          // 优先级排序题（拖拽排序）
  | 'timed'            // 限时挑战题（倒计时压力决策）
  | 'exploration';     // 探索式题（多线索发现后综合判断）

// 测验题目（带 primaryTrait 用于动态分支选题）
export interface QuizQuestion {
  id: number;
  text: string;
  primaryTrait: PersonalityTrait; // 该题主要考察的特质，用于分支选题
  type: QuestionType;             // 互动类型
  knowledgePointId: string;       // 关联的核心知识点
  scenario?: string;              // 情景模拟题的情境描述
  timeLimit?: number;             // 限时题的倒计时秒数
  options: QuizOption[];
  feedback?: Record<string, string>; // 每个选项的即时反馈解析（optionId → 解析）
  knowledgeInsight?: string;      // 该题对应的知识点洞察讲解
}

// 性格画像（根据答题计算）
export interface PersonalityProfile {
  primaryTrait: PersonalityTrait;
  secondaryTrait: PersonalityTrait;
  traitScores: Record<PersonalityTrait, number>;
}

// 角色画像（AI 综合答题+图片生成）
export interface CharacterPortrait {
  name: string;              // 角色名
  appearance: string;        // 外貌形象描述
  background: string;        // 人物背景设定
  personalityTags: string[]; // 性格标签数组
}

// AI 生成的剧情结果
export interface StoryResult {
  role: string;              // 角色设定
  story: string[];           // 剧情段落
  ending: string;            // 结局描述
  episodesSurvived: number;  // 活了几集
  personalityAnalysis: string; // 性格分析
  shareColor: string;        // 分享卡主色
  characterPortrait: CharacterPortrait; // 专属角色画像
}

// 用户上传的图片素材
export interface UserImage {
  base64: string;            // base64 数据（含 data URL 前缀）
  description: string;       // AI 视觉分析得到的图片特征描述
}

// ====== 游戏化数据模型 ======

// 成就定义
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;             // emoji 图标
  condition: {
    type: 'level' | 'streak' | 'xp' | 'perfect' | 'worldview' | 'knowledge';
    target: number | string;
  };
  reward: number;           // 成就奖励 XP
}

// 用户学习行为记录（用于个性化路径）
export interface LearningRecord {
  questionId: number;
  worldviewId: WorldviewId;
  knowledgePointId: string;
  selectedTrait: PersonalityTrait;
  isCorrect: boolean;       // 是否为该知识点的"最优解"
  responseTimeMs: number;
  timestamp: number;
}

// 知识点掌握度
export interface KnowledgeMastery {
  knowledgePointId: string;
  correctCount: number;
  totalCount: number;
  mastery: number;          // 0-1 掌握度
}

// 游戏化全局状态
export interface GameState {
  xp: number;                    // 总经验值
  level: number;                 // 当前等级
  streak: number;                // 连续打卡天数
  lastPlayDate: string | null;   // 上次游戏日期 (YYYY-MM-DD)
  achievements: string[];        // 已解锁成就 ID 列表
  records: LearningRecord[];     // 学习行为记录
  mastery: Record<string, KnowledgeMastery>; // 知识点掌握度
  totalQuestionsAnswered: number;
  perfectRuns: number;           // 全对次数
}

// 等级配置
export interface LevelConfig {
  level: number;
  xpRequired: number;   // 达到该等级所需累计 XP
  title: string;        // 等级称号
  icon: string;
}

// 剧情片段类型（沉浸式叙事体验）
export type StorySegmentType =
  | 'opening'      // 开篇
  | 'scene'        // 场景抉择（情境+选项）
  | 'consequence'  // 选择后果（AI演绎）
  | 'ending';      // 最终结局

export interface StorySegment {
  id: string;
  type: StorySegmentType;
  text: string;                  // 叙事文本
  options?: QuizOption[];        // scene 类型的抉择选项
  questionId?: number;           // 关联的题库题目 ID（scene 类型）
}

// 选择的完整后续演化（4 段式）
export interface ChoiceConsequence {
  /** 立即触发的剧情事件 */
  immediate: string;
  /** 由该事件引发的连锁反应 */
  chainReaction: string;
  /** 因此产生的新人物互动 */
  characterInteraction: string;
  /** 如何自然过渡到下一幕 */
  transition: string;
}

// 分支剧情选项
export interface BranchChoice {
  id: string;
  text: string;                   // 选项文本
  trait: PersonalityTrait;        // 对应决策特质
  consequence: ChoiceConsequence; // 该选择的完整后续演化
  episodeCost?: number;           // 该抉择对存活集数的贡献（可选，不填则按特质权重自动派生）
}

// 角色对话行
export interface DialogueLine {
  speaker: string;   // 说话者
  text: string;      // 台词
}

// 分支剧情场景
export interface BranchScene {
  id: string;
  worldviewId: string;
  act: number;                    // 第几幕（1-8）
  setting: string;                // 场景环境/氛围描述
  dialogue?: DialogueLine[];      // 角色对话（可选）
  situation: string;              // 当前面临的情境与冲突
  choices: BranchChoice[];        // 可采取的行动
}

// 单次闯关结算结果
export interface RunSettlement {
  xpEarned: number;               // 本轮获得的 XP
  leveledUp: boolean;             // 是否升级
  oldLevel: number;               // 闯关前等级
  newLevel: number;               // 闯关后等级
  achievements: Achievement[];    // 本轮解锁的成就
  perfect: boolean;               // 是否全对
  correctCount: number;           // 答对题数
  totalCount: number;             // 总题数
  masterySummary: {               // 本轮涉及的知识点掌握度
    knowledgePointId: string;
    name: string;
    mastery: number;
    improved: boolean;
  }[];
}

// 出身背景（先天随机部分）
export interface OriginBackground {
  id: string;
  name: string;              // 出身名称，如「太医院学徒」
  description: string;       // 出身描述
  episodeBonus: number;      // 对存活集数的初始加成（可正可负）
}

// 天赋词条稀有度
export type TalentRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 天赋词条（先天随机抽取，可换一组）
export interface TalentCard {
  id: string;
  name: string;              // 天赋名称
  description: string;       // 天赋效果描述
  rarity: TalentRarity;      // 稀有度
  episodeBonus: number;      // 对存活集数的加成（可正可负，负面天赋为负）
}

// 性别
export type Gender = 'male' | 'female';

// 完整出身设定（混合模式：先天随机 + 后天选择）
export interface OriginSetup {
  gender: Gender;                       // 玩家选择的性别
  background: OriginBackground;          // 随机出身背景
  talents: TalentCard[];                 // 随机抽取的3个天赋
  initialTrait: PersonalityTrait;        // 玩家选择的初始性格倾向
}

// 应用阶段
export type AppStage =
  | 'worldview-select'   // 选择世界观
  | 'origin-setup'       // 出身设定（混合模式：随机出身+天赋 + 选择性格倾向）
  | 'story'              // 沉浸式剧情推演（选择→AI演绎后果→继续）
  | 'generating'         // AI 生成结局中
  | 'result'             // 结局展示
  | 'share';             // 分享卡

// 付费版本
export type PriceTier = 'trial' | 'full' | 'couple';

// AI 服务配置
export interface AIConfig {
  apiBase: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}
