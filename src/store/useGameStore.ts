import { create } from 'zustand';
import type {
  Achievement,
  GameState,
  KnowledgeMastery,
  LearningRecord,
  PersonalityTrait,
  WorldviewId,
} from '../types';
import {
  ACHIEVEMENTS,
  KNOWLEDGE_POINT_OPTIMAL_TRAIT,
  calculateXpReward,
  getLevelInfo,
} from '../data/gamification';

const STORAGE_KEY = 'scenario-survival-game-state';

const INITIAL_STATE: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayDate: null,
  achievements: [],
  records: [],
  mastery: {},
  totalQuestionsAnswered: 0,
  perfectRuns: 0,
};

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略存储错误
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface GameStore extends GameState {
  // 记录单次答题
  recordAnswer: (params: {
    questionId: number;
    worldviewId: WorldviewId;
    knowledgePointId: string;
    selectedTrait: PersonalityTrait;
    questionType: string;
    responseTimeMs: number;
    timeLimit?: number;
  }) => { xpGained: number; isCorrect: boolean; unlocked: Achievement[]; leveledUp: boolean; newLevel: number };

  // 记录一次完整闯关
  recordRunCompletion: (params: { isPerfect: boolean }) => Achievement[];

  // 获取知识点掌握度
  getMastery: (knowledgePointId: string) => KnowledgeMastery;

  // 获取所有已玩过的世界观
  getPlayedWorldviews: () => WorldviewId[];

  // 重置（用于测试）
  _reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // 检查并更新连续打卡
  function updateStreak(state: GameState): GameState {
    const today = todayStr();
    if (state.lastPlayDate === today) return state; // 今天已打卡

    let newStreak = state.streak;
    if (state.lastPlayDate === yesterdayStr()) {
      newStreak = state.streak + 1;
    } else {
      newStreak = 1; // 断签后重新开始
    }
    return { ...state, streak: newStreak, lastPlayDate: today };
  }

  // 检查成就解锁
  function checkAchievements(state: GameState): { state: GameState; unlocked: Achievement[] } {
    const unlocked: Achievement[] = [];
    const newAchievements = [...state.achievements];

    for (const ach of ACHIEVEMENTS) {
      if (newAchievements.includes(ach.id)) continue;
      let satisfied = false;
      switch (ach.condition.type) {
        case 'level':
          satisfied = state.level >= (ach.condition.target as number);
          break;
        case 'streak':
          satisfied = state.streak >= (ach.condition.target as number);
          break;
        case 'xp':
          satisfied = state.xp >= (ach.condition.target as number);
          break;
        case 'perfect':
          satisfied = state.perfectRuns >= (ach.condition.target as number);
          break;
        case 'worldview':
          satisfied = get().getPlayedWorldviews().length >= 3;
          break;
        case 'knowledge':
          // 掌握特定数量知识点
          satisfied = Object.values(state.mastery).filter((m) => m.mastery >= 0.6).length >= (ach.condition.target as number);
          break;
      }
      if (satisfied) {
        newAchievements.push(ach.id);
        unlocked.push(ach);
      }
    }

    if (unlocked.length === 0) return { state, unlocked };

    // 发放成就 XP 奖励
    const rewardXp = unlocked.reduce((sum, a) => sum + a.reward, 0);
    const newXp = state.xp + rewardXp;
    const { level: newLevel } = getLevelInfo(newXp);
    const newState = {
      ...state,
      xp: newXp,
      level: newLevel.level,
      achievements: newAchievements,
    };
    return { state: newState, unlocked };
  }

  return {
    ...loadState(),

    recordAnswer: ({ questionId, worldviewId, knowledgePointId, selectedTrait, questionType, responseTimeMs, timeLimit }) => {
      const state = get();
      const optimalTrait = KNOWLEDGE_POINT_OPTIMAL_TRAIT[knowledgePointId];
      const isCorrect = selectedTrait === optimalTrait;

      // 更新打卡
      let newState = updateStreak(state);

      // 计算 XP
      const xpGained = calculateXpReward({
        questionType,
        isCorrect,
        responseTimeMs,
        timeLimit,
        streakBonus: newState.streak >= 3 ? 3 : 0,
      });

      // 记录学习行为
      const record: LearningRecord = {
        questionId,
        worldviewId,
        knowledgePointId,
        selectedTrait,
        isCorrect,
        responseTimeMs,
        timestamp: Date.now(),
      };

      // 更新知识点掌握度
      const prevMastery = newState.mastery[knowledgePointId] ?? {
        knowledgePointId,
        correctCount: 0,
        totalCount: 0,
        mastery: 0,
      };
      const newMastery: KnowledgeMastery = {
        ...prevMastery,
        correctCount: prevMastery.correctCount + (isCorrect ? 1 : 0),
        totalCount: prevMastery.totalCount + 1,
        mastery: (prevMastery.correctCount + (isCorrect ? 1 : 0)) / (prevMastery.totalCount + 1),
      };

      const newXp = newState.xp + xpGained;
      const { level: levelInfo } = getLevelInfo(newXp);
      const leveledUp = levelInfo.level > newState.level;

      newState = {
        ...newState,
        xp: newXp,
        level: levelInfo.level,
        records: [...newState.records.slice(-199), record], // 保留最近 200 条
        mastery: { ...newState.mastery, [knowledgePointId]: newMastery },
        totalQuestionsAnswered: newState.totalQuestionsAnswered + 1,
      };

      // 检查成就
      const { state: stateWithAch, unlocked } = checkAchievements(newState);
      newState = stateWithAch;

      saveState(newState);
      set(newState);

      return {
        xpGained,
        isCorrect,
        unlocked,
        leveledUp,
        newLevel: newState.level,
      };
    },

    recordRunCompletion: ({ isPerfect }) => {
      const state = get();
      let newState: GameState = { ...state };

      if (isPerfect) {
        newState = { ...newState, perfectRuns: newState.perfectRuns + 1 };
      }

      // 检查世界观成就
      const { state: stateWithAch, unlocked } = checkAchievements(newState);
      newState = stateWithAch;

      saveState(newState);
      set(newState);
      return unlocked;
    },

    getMastery: (knowledgePointId) => {
      return (
        get().mastery[knowledgePointId] ?? {
          knowledgePointId,
          correctCount: 0,
          totalCount: 0,
          mastery: 0,
        }
      );
    },

    getPlayedWorldviews: () => {
      const set = new Set<WorldviewId>();
      for (const r of get().records) {
        set.add(r.worldviewId);
      }
      return Array.from(set);
    },

    _reset: () => {
      saveState(INITIAL_STATE);
      set(INITIAL_STATE);
    },
  };
});
