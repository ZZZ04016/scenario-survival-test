import { create } from 'zustand';
import type {
  AppStage,
  PersonalityProfile,
  PriceTier,
  QuizOption,
  StoryResult,
  Worldview,
  WorldviewId,
} from '../types';
import { getQuestions } from '../data/questions';
import { calculatePersonalityProfile, calculateEpisodesSurvived } from '../utils/personality';
import { getAIService } from '../services/aiService';
import { saveTestResult } from '../lib/storage';

interface AppState {
  // 应用状态
  stage: AppStage;
  worldview: Worldview | null;
  tier: PriceTier;

  // 答题状态
  currentQuestionIndex: number;
  selectedOptions: QuizOption[];

  // 结果
  profile: PersonalityProfile | null;
  story: StoryResult | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setStage: (stage: AppStage) => void;
  selectWorldview: (worldview: Worldview) => void;
  setTier: (tier: PriceTier) => void;
  selectOption: (option: QuizOption) => void;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  generateStory: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  stage: 'worldview-select',
  worldview: null,
  tier: 'trial',

  currentQuestionIndex: 0,
  selectedOptions: [],

  profile: null,
  story: null,
  isGenerating: false,
  error: null,

  setStage: (stage) => set({ stage }),

  selectWorldview: (worldview) => {
    set({
      worldview,
      stage: 'quiz',
      currentQuestionIndex: 0,
      selectedOptions: [],
      profile: null,
      story: null,
      error: null,
    });
  },

  setTier: (tier) => set({ tier }),

  selectOption: (option) => {
    const { currentQuestionIndex, selectedOptions } = get();
    const newOptions = [...selectedOptions];
    newOptions[currentQuestionIndex] = option;
    set({ selectedOptions: newOptions });
  },

  goToNextQuestion: () => {
    const { worldview, currentQuestionIndex, selectedOptions } = get();
    if (!worldview) return;

    const questions = getQuestions(worldview.id as WorldviewId);
    // 体验版只显示前 5 题
    const totalQuestions = get().tier === 'trial' ? 5 : questions.length;

    if (currentQuestionIndex < totalQuestions - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      // 答题完成，计算性格画像
      const profile = calculatePersonalityProfile(selectedOptions.slice(0, totalQuestions));
      set({ profile, stage: 'generating' });
    }
  },

  goToPrevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  generateStory: async () => {
    const { worldview, profile, selectedOptions, tier } = get();
    if (!worldview || !profile) return;

    set({ isGenerating: true, error: null, stage: 'generating' });

    try {
      const questions = getQuestions(worldview.id as WorldviewId);
      const totalQuestions = tier === 'trial' ? 5 : questions.length;
      const usedQuestions = questions.slice(0, totalQuestions);

      const answerSummary = selectedOptions.slice(0, totalQuestions).map(
        (option, i) => {
          const question = usedQuestions[i];
          return `面对"${question?.text}"，你选择了"${option.text}"`;
        },
      );

      const aiService = getAIService();
      const story = await aiService.generateStory({
        worldview,
        profile,
        answerSummary,
      });

      // 体验版用计算的集数覆盖 AI 返回的
      if (tier === 'trial') {
        story.episodesSurvived = calculateEpisodesSurvived(profile);
      }

      set({ story, stage: 'result', isGenerating: false });

      // 异步上报测试结果到 Supabase（不阻塞 UI，失败也不影响）
      void saveTestResult({ worldview, profile, story });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '生成失败，请重试',
        isGenerating: false,
        stage: 'quiz',
      });
    }
  },

  reset: () =>
    set({
      stage: 'worldview-select',
      worldview: null,
      tier: 'trial',
      currentQuestionIndex: 0,
      selectedOptions: [],
      profile: null,
      story: null,
      isGenerating: false,
      error: null,
    }),
}));
