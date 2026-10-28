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

// 测验题目
export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

// 性格画像（根据答题计算）
export interface PersonalityProfile {
  primaryTrait: PersonalityTrait;
  secondaryTrait: PersonalityTrait;
  traitScores: Record<PersonalityTrait, number>;
}

// AI 生成的剧情结果
export interface StoryResult {
  role: string;              // 角色设定
  story: string[];           // 剧情段落
  ending: string;            // 结局描述
  episodesSurvived: number;  // 活了几集
  personalityAnalysis: string; // 性格分析
  shareColor: string;        // 分享卡主色
}

// 应用阶段
export type AppStage =
  | 'worldview-select'   // 选择世界观
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
