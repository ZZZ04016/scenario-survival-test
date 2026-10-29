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

// 世界观配置
export interface Worldview {
  id: WorldviewId;
  name: string;
  tagline: string;
  description: string;
  coverEmoji: string;
  accentColor: string;
  bgGradient: string;
}

// 选择题选项
export interface QuizOption {
  id: string;
  text: string;
  trait: PersonalityTrait;
}

// 测验题目（带 primaryTrait 用于动态分支选题）
export interface QuizQuestion {
  id: number;
  text: string;
  primaryTrait: PersonalityTrait; // 该题主要考察的特质，用于分支选题
  options: QuizOption[];
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

// 应用阶段
export type AppStage =
  | 'worldview-select'   // 选择世界观
  | 'image-upload'       // 上传个人图片素材（可选）
  | 'quiz'               // 答题中
  | 'generating'         // AI 生成中
  | 'result'             // 结果展示
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
