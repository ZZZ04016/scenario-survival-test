import { create } from 'zustand';
import type {
  AppStage,
  BranchChoice,
  BranchScene,
  Gender,
  OriginSetup,
  PersonalityProfile,
  QuizOption,
  StorySegment,
  StoryResult,
  Worldview,
} from '../types';
import { calculatePersonalityProfile, getEpisodeContribution } from '../utils/personality';
import { getAIService } from '../services/aiService';
import { saveTestResult, recordEpisodeMetric, saveLegendaryRun } from '../lib/storage';
import { recordChoice, recordEnding } from '../lib/progress';
import { useGameStore } from './useGameStore';
import { generateOpening } from '../data/storyLibrary';
import { getBranchScenes } from '../data/branchingStory';

interface AppState {
  stage: AppStage;
  worldview: Worldview | null;
  gender: Gender | null;          // 玩家选择的性别（独立步骤）

  // 出身设定（混合模式：先天随机出身+天赋，后天选择性格倾向）
  originSetup: OriginSetup | null;

  // 沉浸式剧情
  storySegments: StorySegment[];   // 已演绎的剧情片段
  currentScene: BranchScene | null; // 当前待抉择的场景
  answeredCount: number;           // 已完成的抉择数
  isGeneratingConsequence: boolean; // 是否正在演绎后果
  selectedTraitHistory: string[];  // 历次选择的特质（用于性格画像）
  episodesSurvived: number;        // 逐抉择累加的存活集数（方案 C：与实际抉择挂钩）

  // 结果
  profile: PersonalityProfile | null;
  story: StoryResult | null;
  isGenerating: boolean;
  error: string | null;
  streamingText: string;
  newlyUnlockedWorldviews: string[]; // 本次结局新解锁的世界观

  // Actions
  setStage: (stage: AppStage) => void;
  selectWorldview: (worldview: Worldview) => void;
  selectGender: (gender: Gender) => void;
  setOriginSetup: (origin: OriginSetup) => void;
  startStory: () => Promise<void>;
  chooseAction: (choice: BranchChoice) => Promise<void>;
  generateEnding: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  stage: 'worldview-select',
  worldview: null,
  gender: null,
  originSetup: null,

  storySegments: [],
  currentScene: null,
  answeredCount: 0,
  isGeneratingConsequence: false,
  selectedTraitHistory: [],
  episodesSurvived: 1,

  profile: null,
  story: null,
  isGenerating: false,
  error: null,
  streamingText: '',
  newlyUnlockedWorldviews: [],

  setStage: (stage) => set({ stage }),

  selectWorldview: (worldview) => {
    set({
      worldview,
      gender: null,
      originSetup: null,
      storySegments: [],
      currentScene: null,
      answeredCount: 0,
      selectedTraitHistory: [],
      episodesSurvived: 1,
      profile: null,
      story: null,
      error: null,
      newlyUnlockedWorldviews: [],
      stage: 'gender-select',
    });
  },

  /**
   * 选择性别后进入出身设定
   */
  selectGender: (gender) => {
    set({ gender, stage: 'origin-setup' });
  },

  /**
   * 设定出身（随机出身背景+天赋 + 玩家选择性格倾向）后进入剧情
   * 天赋与出身的集数加成作为初始基准，后续抉择在此基础上累加
   */
  setOriginSetup: (origin) => {
    const { worldview, gender } = get();
    if (!worldview || !gender) return;

    // 将性别注入出身设定
    const originWithGender: OriginSetup = { ...origin, gender };

    // 计算初始集数基准：出身加成 + 天赋加成之和
    const talentBonus = origin.talents.reduce((sum, t) => sum + t.episodeBonus, 0);
    const baseEpisodes = Math.max(1, worldview.episodeMax * 0.1) + origin.background.episodeBonus + talentBonus;
    const initialEpisodes = Math.max(1, Math.min(worldview.episodeMax, Math.round(baseEpisodes)));

    set({ originSetup: originWithGender, episodesSurvived: initialEpisodes });
    void get().startStory();
  },

  /**
   * 开始剧情：根据出身设定生成开篇叙事 + 加载第一个分支场景
   */
  startStory: async () => {
    const { worldview, originSetup } = get();
    if (!worldview) return;

    // 保留 setOriginSetup 已计算的初始集数（出身+天赋加成），不在此处重置
    set({ stage: 'story', storySegments: [], answeredCount: 0, selectedTraitHistory: [], error: null });

    try {
      // 生成开篇（根据出身背景生成差异化开篇）
      const openingText = generateOpening(worldview.id, originSetup);

      const openingSegment: StorySegment = {
        id: `opening-${Date.now()}`,
        type: 'opening',
        text: openingText,
      };

      // 加载分支剧情的第一幕（根据初始性格倾向筛选选项）
      const scenes = getBranchScenes(worldview.id, originSetup?.initialTrait);
      const firstScene = scenes[0] ?? null;

      set({
        storySegments: [openingSegment],
        currentScene: firstScene,
        answeredCount: 0,
      });
    } catch (error) {
      // 开篇生成失败也不阻塞，用兜底文本
      const fallback = originSetup
        ? `${originSetup.background.name}的身份在${worldview.name}的世界中展开，命运的齿轮开始转动……`
        : `${worldview.name}的世界在你面前展开，命运的齿轮开始转动……`;
      const scenes = getBranchScenes(worldview.id, originSetup?.initialTrait);
      const firstScene = scenes[0] ?? null;
      set({
        storySegments: [{ id: 'opening-fallback', type: 'opening', text: fallback }],
        currentScene: firstScene,
        answeredCount: 0,
        error: null,
      });
    }
  },

  /**
   * 用户做出抉择：读取该选择专属的 4 段式后果叙事，推进到下一幕
   */
  chooseAction: async (choice: BranchChoice) => {
    const { worldview, currentScene, storySegments, answeredCount, selectedTraitHistory, episodesSurvived, originSetup } = get();
    if (!worldview || !currentScene) return;

    // 记录玩家选择（用于进度追踪）
    recordChoice();

    set({ isGeneratingConsequence: true });

    try {
      // 模拟叙事演绎的短暂延迟，增强沉浸感
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 构建 4 段式后果叙事（即时事件 → 连锁反应 → 人物互动 → 过渡下一幕）
      const c = choice.consequence;
      const consequenceText = `${c.immediate}\n\n${c.chainReaction}\n\n${c.characterInteraction}\n\n${c.transition}`;

      const consequenceSegment: StorySegment = {
        id: `consequence-${Date.now()}`,
        type: 'consequence',
        text: consequenceText,
      };

      const newSegments = [...storySegments, consequenceSegment];
      const newAnsweredCount = answeredCount + 1;
      const newTraitHistory = [...selectedTraitHistory, choice.trait];

      // 加载下一幕（固定剧情序列，直接取下一幕）
      const scenes = getBranchScenes(worldview.id, originSetup?.initialTrait);
      const nextScene = scenes[newAnsweredCount] ?? null;

      // 方案 C：按本次抉择累加存活集数（与实际抉择挂钩，而非纯性格投影）
      const totalChoices = scenes.length || 8;
      let contribution = getEpisodeContribution(choice, worldview.episodeMax, totalChoices);

      // 契合初始性格倾向的抉择：坚守本心会带来微小的生存加成（不强制，仅鼓励角色一致性）
      const matchesInitialTrait = originSetup?.initialTrait === choice.trait;
      if (matchesInitialTrait) {
        contribution += 1;
      }

      const newEpisodes = Math.max(1, Math.min(worldview.episodeMax, episodesSurvived + contribution));

      set({
        storySegments: newSegments,
        currentScene: nextScene,
        answeredCount: newAnsweredCount,
        selectedTraitHistory: newTraitHistory,
        episodesSurvived: newEpisodes,
        isGeneratingConsequence: false,
      });
    } catch (error) {
      set({
        isGeneratingConsequence: false,
        error: error instanceof Error ? error.message : '剧情演绎失败',
      });
    }
  },

  /**
   * 生成最终结局
   */
  generateEnding: async () => {
    const { worldview, storySegments, selectedTraitHistory, episodesSurvived, originSetup } = get();
    if (!worldview) return;

    set({ isGenerating: true, error: null, stage: 'generating', streamingText: '' });

    try {
      // 构造伪 options 数组用于 calculatePersonalityProfile
      const fakeOptions: QuizOption[] = selectedTraitHistory.map((trait) => ({
        id: 'x',
        text: '',
        trait: trait as never,
      }));
      const profile = calculatePersonalityProfile(fakeOptions);

      const aiService = getAIService();
      const storyHistory = storySegments.map((s) => s.text);

      // 方案 C：使用逐抉择累加的集数（补 +1 基准 + 取整，与 calculateEpisodesSurvived 公式对齐）
      const finalEpisodes = Math.max(
        1,
        Math.min(worldview.episodeMax, Math.round(episodesSurvived)),
      );

      const story = await aiService.generateEnding({
        worldview,
        profile,
        storyHistory,
        episodesSurvived: finalEpisodes,
        originSetup: originSetup ?? undefined,
      });

      set({ profile, story, stage: 'result', isGenerating: false });

      // 记录闯关完成（世界观探索成就）
      useGameStore.getState().recordRunCompletion({ isPerfect: false });

      // 记录结局完成，检查是否解锁新世界观
      const newlyUnlocked = recordEnding(worldview.id);
      set({ newlyUnlockedWorldviews: newlyUnlocked });

      // 集数分布埋点
      recordEpisodeMetric(worldview.id, story.episodesSurvived);

      // 方案 E：集数达到上限 90% 即为「传奇局」，归档供回访
      if (story.episodesSurvived >= worldview.episodeMax * 0.9) {
        saveLegendaryRun({
          worldviewId: worldview.id,
          worldviewName: worldview.name,
          episodesSurvived: story.episodesSurvived,
          episodeMax: worldview.episodeMax,
          ending: story.ending,
          primaryTrait: profile.primaryTrait,
          createdAt: new Date().toISOString(),
        });
      }

      void saveTestResult({ worldview, profile, story });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '生成失败，请重试',
        isGenerating: false,
        stage: 'story',
      });
    }
  },

  reset: () =>
    set({
      stage: 'worldview-select',
      worldview: null,
      gender: null,
      originSetup: null,
      storySegments: [],
      currentScene: null,
      answeredCount: 0,
      isGeneratingConsequence: false,
      selectedTraitHistory: [],
      episodesSurvived: 1,
      profile: null,
      story: null,
      isGenerating: false,
      error: null,
      streamingText: '',
      newlyUnlockedWorldviews: [],
    }),
}));
