import { create } from 'zustand';
import type {
  AppStage,
  PersonalityProfile,
  PriceTier,
  QuizOption,
  QuizQuestion,
  StoryResult,
  UserImage,
  Worldview,
  WorldviewId,
} from '../types';
import { getQuestions, selectNextQuestion } from '../data/questions';
import { calculatePersonalityProfile } from '../utils/personality';
import { getAIService } from '../services/aiService';
import { saveTestResult } from '../lib/storage';

const TOTAL_QUESTIONS = 10;

interface AppState {
  // 应用状态
  stage: AppStage;
  worldview: Worldview | null;
  tier: PriceTier;

  // 答题状态（动态分支）
  questionSequence: QuizQuestion[]; // 已展示的题目序列
  currentQuestionIndex: number;
  selectedOptions: QuizOption[];

  // 用户上传图片
  userImage: UserImage | null;

  // 结果
  profile: PersonalityProfile | null;
  story: StoryResult | null;
  isGenerating: boolean;
  error: string | null;
  streamingText: string; // AI 流式输出的部分文本（用于 3 秒感知）

  // 角色图片生成
  characterImage: string | null; // 生成的角色图片 URL
  isGeneratingImage: boolean;
  imageError: string | null;
  imageRetryAfter: number | null; // 限流时可重试的时间戳（毫秒）

  // Actions
  setStage: (stage: AppStage) => void;
  selectWorldview: (worldview: Worldview) => void;
  setTier: (tier: PriceTier) => void;
  setUserImage: (image: UserImage | null) => void;
  startQuiz: () => void;
  selectOption: (option: QuizOption) => void;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  generateStory: () => Promise<void>;
  generateCharacterImage: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  stage: 'worldview-select',
  worldview: null,
  tier: 'full',

  questionSequence: [],
  currentQuestionIndex: 0,
  selectedOptions: [],

  userImage: null,

  profile: null,
  story: null,
  isGenerating: false,
  error: null,
  streamingText: '',

  characterImage: null,
  isGeneratingImage: false,
  imageError: null,
  imageRetryAfter: null,

  setStage: (stage) => set({ stage }),

  selectWorldview: (worldview) => {
    // 进入图片上传阶段（可选），再开始答题
    set({
      worldview,
      stage: 'image-upload',
      questionSequence: [],
      currentQuestionIndex: 0,
      selectedOptions: [],
      userImage: null,
      profile: null,
      story: null,
      error: null,
    });
  },

  setTier: (tier) => set({ tier }),

  setUserImage: (image) => set({ userImage: image }),

  startQuiz: () => {
    const { worldview } = get();
    if (!worldview) return;
    // 从题库随机选第一道题
    const pool = getQuestions(worldview.id as WorldviewId);
    const firstQuestion = pool[Math.floor(Math.random() * pool.length)];
    set({
      questionSequence: [firstQuestion],
      currentQuestionIndex: 0,
      selectedOptions: [],
      stage: 'quiz',
    });
  },

  selectOption: (option) => {
    const { currentQuestionIndex, selectedOptions } = get();
    const newOptions = [...selectedOptions];
    newOptions[currentQuestionIndex] = option;
    set({ selectedOptions: newOptions });
  },

  goToNextQuestion: () => {
    const { worldview, currentQuestionIndex, selectedOptions, questionSequence } = get();
    if (!worldview) return;

    const answeredCount = currentQuestionIndex + 1;

    if (answeredCount < TOTAL_QUESTIONS) {
      // 动态选择下一道题
      const pool = getQuestions(worldview.id as WorldviewId);
      const answeredIds = questionSequence.map((q) => q.id);
      // 用已选选项的特质来决定下一题
      const nextQuestion = selectNextQuestion(pool, answeredIds, selectedOptions.slice(0, answeredCount));

      if (nextQuestion) {
        set({
          questionSequence: [...questionSequence, nextQuestion],
          currentQuestionIndex: currentQuestionIndex + 1,
        });
      } else {
        // 题库用完，进入生成阶段
        finishQuiz();
      }
    } else {
      // 答完所有题目
      finishQuiz();
    }

    function finishQuiz() {
      const profile = calculatePersonalityProfile(selectedOptions.slice(0, TOTAL_QUESTIONS));
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
    const { worldview, profile, selectedOptions, questionSequence, userImage } = get();
    if (!worldview || !profile) return;

    set({ isGenerating: true, error: null, stage: 'generating', streamingText: '' });

    try {
      const answerSummary = selectedOptions.slice(0, TOTAL_QUESTIONS).map((option, i) => {
        const question = questionSequence[i];
        return `面对"${question?.text}"，你选择了"${option.text}"`;
      });

      const aiService = getAIService();
      const story = await aiService.generateStory({
        worldview,
        profile,
        answerSummary,
        userImage,
        onProgress: (text) => set({ streamingText: text }),
      });

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

  generateCharacterImage: async () => {
    const { worldview, story, userImage } = get();
    if (!worldview || !story) return;

    set({ isGeneratingImage: true, imageError: null, imageRetryAfter: null });

    try {
      const aiService = getAIService();
      const imageUrl = await aiService.generateCharacterImage({
        worldview,
        characterPortrait: story.characterPortrait,
        userImage,
      });
      set({ characterImage: imageUrl, isGeneratingImage: false });
    } catch (error) {
      const retryAfter = (error as Error & { retryAfter?: number })?.retryAfter;
      set({
        imageError: error instanceof Error ? error.message : '图片生成失败，请重试',
        isGeneratingImage: false,
        imageRetryAfter: retryAfter ? Date.now() + retryAfter * 1000 : null,
      });
    }
  },

  reset: () =>
    set({
      stage: 'worldview-select',
      worldview: null,
      tier: 'full',
      questionSequence: [],
      currentQuestionIndex: 0,
      selectedOptions: [],
      userImage: null,
      profile: null,
      story: null,
      isGenerating: false,
      error: null,
      streamingText: '',
      characterImage: null,
      isGeneratingImage: false,
      imageError: null,
      imageRetryAfter: null,
    }),
}));
