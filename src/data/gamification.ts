import type { Achievement, KnowledgePoint, LevelConfig, PersonalityTrait } from '../types';

/**
 * 核心知识点库
 * 每个知识点对应一个可迁移到真实生活/工作的决策能力
 * 所有题目必须锚定某个知识点，确保学习效果不打折扣
 */
export const KNOWLEDGE_POINTS: KnowledgePoint[] = [
  // 通用决策力
  {
    id: 'risk-assessment',
    name: '风险识别与评估',
    description: '在行动前识别潜在风险，评估收益与代价的平衡',
    category: '风险决策',
    realWorldMapping: '职场项目立项前的风险评估、投资决策前的尽职调查',
  },
  {
    id: 'crisis-decision',
    name: '危机快速决策',
    description: '在时间压力和信息不完整的情况下迅速做出合理判断',
    category: '危机管理',
    realWorldMapping: '突发事故现场指挥、业务危机公关、紧急医疗决策',
  },
  {
    id: 'resource-allocation',
    name: '稀缺资源调度',
    description: '在资源有限时进行优先级排序和最优分配',
    category: '资源管理',
    realWorldMapping: '项目预算分配、时间管理、团队人力调度',
  },
  {
    id: 'power-dynamics',
    name: '权力与博弈策略',
    description: '理解组织中的权力结构，运用策略达成目标',
    category: '人际博弈',
    realWorldMapping: '职场晋升博弈、商务谈判、跨部门协作',
  },
  {
    id: 'network-building',
    name: '人际网络经营',
    description: '识别关键人脉，建立和维护互惠关系网络',
    category: '人际博弈',
    realWorldMapping: '职场人脉积累、客户关系维护、社群运营',
  },
  {
    id: 'emotion-regulation',
    name: '情绪管理与隐忍',
    description: '在压力和挑衅下控制情绪，延迟反应以争取最优结果',
    category: '情绪智力',
    realWorldMapping: '高压会议中的情绪控制、冲突调解、客户投诉处理',
  },
  {
    id: 'moral-dilemma',
    name: '道德困境抉择',
    description: '在利益与原则冲突时做出符合价值观的判断',
    category: '价值观',
    realWorldMapping: '商业伦理决策、职场站队选择、利益冲突处理',
  },
  {
    id: 'loyalty-balance',
    name: '情义与利益平衡',
    description: '在人际承诺与个人利益之间找到平衡点',
    category: '价值观',
    realWorldMapping: '合伙创业利益分配、朋友间商业合作、上下级忠诚',
  },
  {
    id: 'opportunity-grasp',
    name: '机遇识别与把握',
    description: '在复杂信息中识别机会窗口并果断行动',
    category: '战略思维',
    realWorldMapping: '创业机会捕捉、职业转型决策、市场风口判断',
  },
  {
    id: 'long-term-planning',
    name: '长期规划与延迟满足',
    description: '放弃短期利益，为长期目标进行战略布局',
    category: '战略思维',
    realWorldMapping: '职业发展规划、财务长期投资、技能打磨',
  },
];

export function getKnowledgePoint(id: string): KnowledgePoint | undefined {
  return KNOWLEDGE_POINTS.find((kp) => kp.id === id);
}

/**
 * 等级体系（阶梯式成长）
 * 每级所需 XP 递增，称号体现决策力成长
 */
export const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: '初入江湖', icon: '🌱' },
  { level: 2, xpRequired: 100, title: '见习谋士', icon: '📜' },
  { level: 3, xpRequired: 250, title: '机敏行者', icon: '⚡' },
  { level: 4, xpRequired: 450, title: '洞察之士', icon: '🔍' },
  { level: 5, xpRequired: 700, title: '谋略新星', icon: '⭐' },
  { level: 6, xpRequired: 1000, title: '决策达人', icon: '🎯' },
  { level: 7, xpRequired: 1400, title: '博弈高手', icon: '♟️' },
  { level: 8, xpRequired: 1900, title: '战略大师', icon: '👑' },
  { level: 9, xpRequired: 2500, title: '传奇智者', icon: '🐉' },
  { level: 10, xpRequired: 3200, title: '决策之神', icon: '🌟' },
];

/**
 * 根据 XP 获取当前等级信息
 */
export function getLevelInfo(xp: number): { level: LevelConfig; nextLevel: LevelConfig | null; progress: number } {
  let current = LEVEL_CONFIG[0];
  for (const cfg of LEVEL_CONFIG) {
    if (xp >= cfg.xpRequired) current = cfg;
  }
  const idx = LEVEL_CONFIG.findIndex((c) => c.level === current.level);
  const nextLevel = idx < LEVEL_CONFIG.length - 1 ? LEVEL_CONFIG[idx + 1] : null;
  const progress = nextLevel
    ? (xp - current.xpRequired) / (nextLevel.xpRequired - current.xpRequired)
    : 1;
  return { level: current, nextLevel, progress: Math.min(1, Math.max(0, progress)) };
}

/**
 * 成就系统（阶梯式荣誉感）
 * 覆盖等级、连续打卡、完美答题、世界观探索、知识点掌握等维度
 */
export const ACHIEVEMENTS: Achievement[] = [
  // 等级成就
  { id: 'level-3', name: '初露锋芒', description: '达到 3 级', icon: '🌿', condition: { type: 'level', target: 3 }, reward: 50 },
  { id: 'level-5', name: '崭露头角', description: '达到 5 级', icon: '🌟', condition: { type: 'level', target: 5 }, reward: 100 },
  { id: 'level-8', name: '决策大师', description: '达到 8 级', icon: '👑', condition: { type: 'level', target: 8 }, reward: 200 },
  // 连续打卡
  { id: 'streak-3', name: '三日不辍', description: '连续打卡 3 天', icon: '🔥', condition: { type: 'streak', target: 3 }, reward: 30 },
  { id: 'streak-7', name: '坚持不懈', description: '连续打卡 7 天', icon: '💪', condition: { type: 'streak', target: 7 }, reward: 80 },
  // 完美答题
  { id: 'perfect-1', name: '完美首秀', description: '完成一次全对闯关', icon: '💯', condition: { type: 'perfect', target: 1 }, reward: 60 },
  { id: 'perfect-3', name: '三连满分', description: '完成 3 次全对闯关', icon: '🏆', condition: { type: 'perfect', target: 3 }, reward: 150 },
  // 世界观探索
  { id: 'worldview-all', name: '三界行者', description: '体验全部 3 个世界观', icon: '🗺️', condition: { type: 'worldview', target: 'all' }, reward: 120 },
  // XP 里程碑
  { id: 'xp-500', name: '经验积累者', description: '累计获得 500 XP', icon: '📈', condition: { type: 'xp', target: 500 }, reward: 40 },
  { id: 'xp-2000', name: '学富五车', description: '累计获得 2000 XP', icon: '📚', condition: { type: 'xp', target: 2000 }, reward: 150 },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * 答题 XP 奖励规则
 * 基础分 + 题型加成 + 速度加成
 */
export function calculateXpReward(params: {
  questionType: string;
  isCorrect: boolean;
  responseTimeMs?: number;
  timeLimit?: number;
  streakBonus?: number;
}): number {
  if (!params.isCorrect) return 5; // 答错也有少量参与 XP

  let base = 10;
  // 题型加成
  const typeBonus: Record<string, number> = {
    choice: 0,
    scenario: 5,
    ranking: 5,
    timed: 8,
    exploration: 10,
  };
  base += typeBonus[params.questionType] ?? 0;

  // 速度加成（限时题）
  if (params.questionType === 'timed' && params.responseTimeMs && params.timeLimit) {
    const speedRatio = 1 - params.responseTimeMs / (params.timeLimit * 1000);
    if (speedRatio > 0.5) base += 5;
  }

  // 连续答题加成
  base += params.streakBonus ?? 0;

  return base;
}

/**
 * 知识点 → 特质 映射
 * 每个知识点有一个"最优特质"，选择该特质视为掌握该知识点
 */
export const KNOWLEDGE_POINT_OPTIMAL_TRAIT: Record<string, PersonalityTrait> = {
  'risk-assessment': 'cautious',
  'crisis-decision': 'decisive',
  'resource-allocation': 'scheming',
  'power-dynamics': 'scheming',
  'network-building': 'kind',
  'emotion-regulation': 'cautious',
  'moral-dilemma': 'kind',
  'loyalty-balance': 'loyal',
  'opportunity-grasp': 'ambitious',
  'long-term-planning': 'ambitious',
};
