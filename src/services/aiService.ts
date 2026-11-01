import type { OriginSetup, StoryResult, UserImage, Worldview } from '../types';
import { buildStoryPrompt, buildImagePrompt, buildImg2ImgPrompt, buildFinalCharacterPrompt, hashOriginSeed } from '../utils/promptBuilder';
import type { PersonalityProfile, PersonalityTrait } from '../types';
import { generateOfflineCharacterImage, isOnline } from './offlineImageService';
import { generateDynamicCharacterPortrait } from '../data/characterLibrary';
import { generateDynamicStory, generateConsequence } from '../data/storyLibrary';
import { calculateEpisodesSurvived } from '../utils/personality';
import { detectBot, checkLocalRateLimit, hasUserInteracted } from '../utils/security';

export interface GenerateStoryParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  answerSummary: string[];
  userImage?: UserImage | null;
  onProgress?: (partialText: string) => void;
}

export interface GenerateConsequenceParams {
  worldview: Worldview;
  selectedTrait: PersonalityTrait;
  sceneText: string;
  actionText: string;
  storyHistory: string[];   // 已发生的剧情历史，保持连贯
}

export interface GenerateEndingParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  storyHistory: string[];
  episodesSurvived?: number; // 方案 C：逐抉择累加的集数（若提供则优先使用，否则按性格公式计算）
}

/**
 * AI 服务模块
 * 负责调用大模型生成剧情，并解析返回的 JSON
 * 支持真实 API 调用和 Mock 模式（用于本地测试）
 */

// 占位符值列表（用于判断是否为真实配置）
const PLACEHOLDER_VALUES = new Set([
  '',
  'your-api-key-here',
  'your_api_key_here',
  'YOUR_API_KEY',
  'your-api-base-url',
  'your_api_base_url',
  'sk-xxxxxxxxxxxxxxxx',
]);

function isConfigured(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !PLACEHOLDER_VALUES.has(trimmed.toLowerCase());
}

export class AIService {
  private apiBase: string;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;
  private useMock: boolean;

  constructor(config?: {
    apiBase?: string;
    apiKey?: string;
    model?: string;
    timeoutMs?: number;
    useMock?: boolean;
  }) {
    this.apiBase = (config?.apiBase ?? import.meta.env.VITE_AI_API_BASE ?? '').trim();
    this.apiKey = (config?.apiKey ?? import.meta.env.VITE_AI_API_KEY ?? '').trim();
    this.model = (config?.model ?? import.meta.env.VITE_AI_MODEL ?? 'doubao-pro').trim();
    this.timeoutMs = config?.timeoutMs ?? 60000;

    // Mock 模式判定优先级：
    // 1. 构造参数显式指定 useMock
    // 2. 环境变量 VITE_USE_MOCK === 'true'
    // 3. 自动检测：API 配置不完整则用 Mock
    const envUseMock = (import.meta.env.VITE_USE_MOCK ?? '').trim().toLowerCase() === 'true';
    this.useMock = config?.useMock ?? envUseMock ?? !(isConfigured(this.apiBase) && isConfigured(this.apiKey));
  }

  /**
   * 是否配置了真实 API
   */
  isRealAPIConfigured(): boolean {
    return !this.useMock;
  }

  /**
   * 获取当前模式
   */
  getMode(): 'mock' | 'real' {
    return this.useMock ? 'mock' : 'real';
  }

  /**
   * 获取配置信息（不含密钥）
   */
  getConfigInfo() {
    return {
      mode: this.getMode(),
      apiBase: this.apiBase || '(未配置)',
      model: this.model,
    };
  }

  /**
   * 安全检查：在调用真实 AI 前执行
   * - 检测自动化工具
   * - 前端限流
   * - 用户交互验证
   */
  private performSecurityCheck(): { passed: boolean; message?: string } {
    // 1. 检测自动化工具/无头浏览器
    const botCheck = detectBot();
    if (botCheck.isBot) {
      console.warn('[Security] 检测到自动化工具:', botCheck.reason);
      return { passed: false, message: '检测到异常访问环境，请使用正常浏览器' };
    }

    // 2. 前端限流
    if (!checkLocalRateLimit()) {
      return { passed: false, message: '操作过于频繁，请稍后再试' };
    }

    // 3. 用户交互验证（确保是真人操作）
    if (!hasUserInteracted()) {
      return { passed: false, message: '请先与页面进行交互' };
    }

    return { passed: true };
  }

  /**
   * 生成剧情
   * 优先调用真实 AI（通过 Netlify 代理函数避免跨域问题）
   * 失败时自动降级到 Mock 模式，保证用户体验不中断
   */
  async generateStory(params: GenerateStoryParams): Promise<StoryResult> {
    if (this.useMock) {
      return this.generateMockStory(params);
    }
    try {
      return await this.generateRealStory(params);
    } catch (error) {
      console.warn('[AIService] 真实 AI 生成失败，降级到 Mock 模式:', error);
      return this.generateMockStory(params);
    }
  }

  /**
   * 生成单个抉择的后果叙事
   * 沉浸式剧情体验的核心：用户做选择后，AI 演绎"因为这个选择发生了什么"
   * 不判定对错，只推进故事
   */
  async generateConsequence(params: GenerateConsequenceParams): Promise<string> {
    if (this.useMock) {
      // 模拟叙事演绎的短暂延迟，增强沉浸感
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));
      return generateConsequence({
        worldviewId: params.worldview.id,
        selectedTrait: params.selectedTrait,
        sceneText: params.sceneText,
        actionText: params.actionText,
      });
    }
    try {
      return await this.generateRealConsequence(params);
    } catch (error) {
      console.warn('[AIService] 后果叙事生成失败，降级到本地模板:', error);
      return generateConsequence({
        worldviewId: params.worldview.id,
        selectedTrait: params.selectedTrait,
        sceneText: params.sceneText,
        actionText: params.actionText,
      });
    }
  }

  /**
   * 生成最终结局（根据整个故事历史）
   */
  async generateEnding(params: GenerateEndingParams): Promise<StoryResult> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const worldviewId = params.worldview.id;
      const { primaryTrait, secondaryTrait } = params.profile;
      const characterPortrait = generateDynamicCharacterPortrait(worldviewId, {
        primaryTrait,
        secondaryTrait,
      });
      // 方案 C：优先使用逐抉择累加的集数，回退到性格公式
      const episodesSurvived = params.episodesSurvived ?? calculateEpisodesSurvived(params.profile, params.worldview.episodeMax);
      const { story, ending, personalityAnalysis } = generateDynamicStory({
        worldviewId,
        profile: params.profile,
        episodesSurvived,
        episodeMax: params.worldview.episodeMax,
      });
      const role = this.buildRoleDescription(worldviewId, characterPortrait);
      const shareColorMap: Record<string, string> = {
        palace: '#8B4513',
        apocalypse: '#E94560',
        cultivation: '#2D6A4F',
      };
      return {
        role,
        story: [...params.storyHistory.slice(0, 3), ...story].slice(0, 6),
        ending,
        episodesSurvived,
        personalityAnalysis,
        shareColor: shareColorMap[worldviewId] ?? '#c87a35',
        characterPortrait,
      };
    }
    try {
      return await this.generateRealEnding(params);
    } catch (error) {
      console.warn('[AIService] 结局生成失败，降级到本地模板:', error);
      // 降级到 mock
      const worldviewId = params.worldview.id;
      const { primaryTrait, secondaryTrait } = params.profile;
      const characterPortrait = generateDynamicCharacterPortrait(worldviewId, {
        primaryTrait,
        secondaryTrait,
      });
      const episodesSurvived = params.episodesSurvived ?? calculateEpisodesSurvived(params.profile, params.worldview.episodeMax);
      const { story, ending, personalityAnalysis } = generateDynamicStory({
        worldviewId,
        profile: params.profile,
        episodesSurvived,
        episodeMax: params.worldview.episodeMax,
      });
      const role = this.buildRoleDescription(worldviewId, characterPortrait);
      const shareColorMap: Record<string, string> = {
        palace: '#8B4513',
        apocalypse: '#E94560',
        cultivation: '#2D6A4F',
      };
      return {
        role,
        story: [...params.storyHistory.slice(0, 3), ...story].slice(0, 6),
        ending,
        episodesSurvived,
        personalityAnalysis,
        shareColor: shareColorMap[worldviewId] ?? '#c87a35',
        characterPortrait,
      };
    }
  }

  /**
   * AI 视觉分析：根据用户上传的图片生成人物特征描述
   * 失败时返回通用描述，不阻塞主流程
   */
  async analyzeImage(base64Image: string): Promise<string> {
    if (this.useMock) {
      return '一位气质独特的年轻人，眼神中透着故事感';
    }

    try {
      const proxyUrl = '/.netlify/functions/ai-proxy';
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '请用 80 字以内描述这张图片中人物的外貌特征、气质风格和给人的整体感觉。只输出描述文字，不要其他内容。',
                },
                { type: 'image_url', image_url: { url: base64Image } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('视觉分析请求失败');

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      let content = '';
      if (typeof message?.content === 'string') {
        content = message.content;
      } else if (Array.isArray(message?.content)) {
        content = message.content
          .map((part: any) => part?.text ?? part?.content ?? '')
          .join('');
      }

      return content.trim() || '一位气质独特的年轻人，眼神中透着故事感';
    } catch (error) {
      console.warn('[AIService] 图片视觉分析失败，使用通用描述:', error);
      return '一位气质独特的年轻人，眼神中透着故事感';
    }
  }

  /**
   * 生成专属角色图片
   * 在线模式：
   *   - 有用户参考图：调用 Pollinations 图生图（img2img），保留原图构图/服饰/风格/背景，仅替换人脸
   *   - 无参考图：调用 Pollinations 文生图（txt2img）
   * 离线模式：使用 Canvas 程序化绘制角色形象（完全离线）
   * 在线失败时自动降级到离线 Canvas 生成
   *
   * @param seed 可选确定性种子，传入则保证相同提示词生成高度相似图片
   */
  async generateCharacterImage(params: {
    worldview: Worldview;
    characterPortrait: StoryResult['characterPortrait'];
    userImage?: UserImage | null;
    seed?: number;
  }): Promise<string> {
    // 离线时直接使用 Canvas 生成
    if (!isOnline()) {
      return generateOfflineCharacterImage(params);
    }

    // 优先使用传入的确定性 seed，否则随机
    const seed = params.seed ?? Math.floor(Math.random() * 1000000);

    // 有用户参考图：使用图生图（img2img），保留原图一切元素，仅替换人脸
    if (params.userImage?.base64) {
      const img2imgResult = await this.generateImg2Img(
        {
          worldview: params.worldview,
          characterPortrait: params.characterPortrait,
          userImage: params.userImage,
        },
        seed,
      );
      if (img2imgResult) return img2imgResult;
      // img2img 失败时降级到文生图
      console.warn('[AIService] 图生图失败，降级到文生图');
    }

    // 无参考图或 img2img 失败：使用文生图
    const prompt = buildImagePrompt({
      worldview: params.worldview,
      characterPortrait: params.characterPortrait,
      userImage: params.userImage,
    });

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true&seed=${seed}`;

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        console.warn(`[AIService] 图片生成失败 (${response.status})${retryAfter ? `, 建议等待 ${retryAfter}s` : ''}，降级到离线 Canvas`);
        return generateOfflineCharacterImage(params);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('[AIService] 图片生成网络错误，降级到离线 Canvas:', error);
      return generateOfflineCharacterImage(params);
    }
  }

  /**
   * 基于出身设定三维度生成角色形象图片
   * 核心链路：originSetup + traitHistory → buildFinalCharacterPrompt + hashOriginSeed → Pollinations 文生图
   *
   * @param traitHistory 剧情选择轨迹，用于反映角色经历剧情后的气质变化
   */
  async generateOriginImage(params: {
    worldview: Worldview;
    origin: OriginSetup;
    traitHistory?: PersonalityTrait[];
  }): Promise<string> {
    const { worldview, origin, traitHistory = [] } = params;

    // 离线时使用 Canvas 生成兜底图
    if (!isOnline()) {
      const offlinePortrait = {
        name: origin.background.name,
        appearance: origin.talents.map((t) => t.name).join('、'),
        background: origin.background.description,
        personalityTags: [origin.initialTrait, ...traitHistory].slice(0, 4),
      };
      return generateOfflineCharacterImage({ worldview, characterPortrait: offlinePortrait });
    }

    // 确定性 seed：相同出身+天赋+性格+剧情轨迹 → 相同 seed
    const seed = hashOriginSeed(origin, traitHistory);

    // 三维度 + 剧情轨迹映射到结构化提示词
    const prompt = buildFinalCharacterPrompt(worldview, origin, traitHistory);

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true&seed=${seed}`;

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.warn(`[AIService] 出身角色图生成失败 (${response.status})，降级到离线 Canvas`);
        const offlinePortrait = {
          name: origin.background.name,
          appearance: origin.talents.map((t) => t.name).join('、'),
          background: origin.background.description,
          personalityTags: [origin.initialTrait, ...traitHistory].slice(0, 4),
        };
        return generateOfflineCharacterImage({ worldview, characterPortrait: offlinePortrait });
      }

      const blob = await response.blob();
      if (blob.size < 1000) {
        console.warn('[AIService] 出身角色图返回内容过小，降级到离线 Canvas');
        const offlinePortrait = {
          name: origin.background.name,
          appearance: origin.talents.map((t) => t.name).join('、'),
          background: origin.background.description,
          personalityTags: [origin.initialTrait, ...traitHistory].slice(0, 4),
        };
        return generateOfflineCharacterImage({ worldview, characterPortrait: offlinePortrait });
      }
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('[AIService] 出身角色图网络错误，降级到离线 Canvas:', error);
      const offlinePortrait = {
        name: origin.background.name,
        appearance: origin.talents.map((t) => t.name).join('、'),
        background: origin.background.description,
        personalityTags: [origin.initialTrait, ...traitHistory].slice(0, 4),
      };
      return generateOfflineCharacterImage({ worldview, characterPortrait: offlinePortrait });
    }
  }

  /**
   * 图生图（img2img）：将用户参考图作为输入，替换人脸特征
   * Pollinations 支持通过 image 参数传入参考图 URL（支持 base64 data URL）
   * 保留原图的构图、服饰、风格、背景，仅替换人脸
   */
  private async generateImg2Img(
    params: {
      worldview: Worldview;
      characterPortrait: StoryResult['characterPortrait'];
      userImage: UserImage;
    },
    seed: number,
  ): Promise<string | null> {
    const prompt = buildImg2ImgPrompt({
      worldview: params.worldview,
      characterPortrait: params.characterPortrait,
      userImage: params.userImage,
    });

    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations image 参数支持 base64 data URL
    const refImage = encodeURIComponent(params.userImage.base64);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?image=${refImage}&width=512&height=768&nologo=true&seed=${seed}&strength=0.55`;

    // 防止 URL 过长（base64 图片可能很大），超过 8000 字符则不尝试 img2img
    if (imageUrl.length > 8000) {
      console.warn('[AIService] 参考图过大，跳过图生图，使用文生图');
      return null;
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.warn(`[AIService] 图生图请求失败 (${response.status})`);
        return null;
      }

      const blob = await response.blob();
      // 空响应或过小图片视为失败
      if (blob.size < 1000) {
        console.warn('[AIService] 图生图返回内容过小，视为失败');
        return null;
      }
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('[AIService] 图生图网络错误:', error);
      return null;
    }
  }

  /**
   * Mock 模式：使用动态知识库生成剧情
   * - 角色画像：从角色库动态组合（名字/外貌/背景/标签）
   * - 剧情：从剧情片段库按性格特质动态串联
   * - 结局：根据存活集数和性格特质生成
   * 确保每次生成内容独特，避免同质化
   */
  private async generateMockStory(
    params: GenerateStoryParams,
  ): Promise<StoryResult> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const worldviewId = params.worldview.id;
    const { primaryTrait, secondaryTrait } = params.profile;

    // 1. 动态生成角色画像
    const characterPortrait = generateDynamicCharacterPortrait(worldviewId, {
      primaryTrait,
      secondaryTrait,
    });

    // 2. 计算存活集数（根据性格特质 + 世界观集数上限）
    const episodesSurvived = calculateEpisodesSurvived(params.profile, params.worldview.episodeMax);

    // 3. 动态生成剧情（开场→中段→结局）
    const { story, ending, personalityAnalysis } = generateDynamicStory({
      worldviewId,
      profile: params.profile,
      episodesSurvived,
      episodeMax: params.worldview.episodeMax,
    });

    // 4. 角色设定
    const role = this.buildRoleDescription(worldviewId, characterPortrait);

    // 5. 分享色（根据世界观）
    const shareColorMap: Record<string, string> = {
      palace: '#8B4513',
      apocalypse: '#E94560',
      cultivation: '#2D6A4F',
    };

    return {
      role,
      story,
      ending,
      episodesSurvived,
      personalityAnalysis,
      shareColor: shareColorMap[worldviewId] ?? '#c87a35',
      characterPortrait,
    };
  }

  /**
   * 根据世界观和角色画像构建角色设定描述
   */
  private buildRoleDescription(
    worldviewId: string,
    portrait: { name: string; background: string },
  ): string {
    const rolePrefix: Record<string, string> = {
      palace: '你是刚入宫的妃嫔',
      apocalypse: '你是一名末世幸存者',
      cultivation: '你是一个刚踏入修仙路的修士',
    };
    return `${rolePrefix[worldviewId] ?? '你是一个平凡的人'}，名叫${portrait.name}。${portrait.background}`;
  }

  /**
   * 真实 API 调用（流式 SSE，通过 Netlify 代理函数）
   * 边生成边回调 onProgress，实现 3 秒内首字呈现的实时体验
   */
  private async generateRealStory(
    params: GenerateStoryParams,
  ): Promise<StoryResult> {
    // 安全检查
    const security = this.performSecurityCheck();
    if (!security.passed) {
      throw new Error(security.message || '安全检查未通过');
    }

    const prompt = buildStoryPrompt({
      worldview: params.worldview,
      profile: params.profile,
      answerSummary: params.answerSummary,
      imageDescription: params.userImage?.description,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const proxyUrl = '/.netlify/functions/ai-proxy';
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData?.message || this.getErrorMessage(response.status, '');
        throw new Error(errorMsg);
      }

      // 流式读取 SSE 响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 按行解析 SSE（每行格式: data: {...}）
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留未完成的行

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const chunk = JSON.parse(jsonStr);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                content += delta;
                params.onProgress?.(content);
              }
            } catch {
              // 忽略无法解析的 chunk
            }
          }
        }
      }

      if (!content || content.trim().length === 0) {
        throw new Error('AI 返回内容为空，请检查模型名称是否正确');
      }

      return this.parseStoryResponse(content);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('AI 生成超时，请重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 真实 AI：生成抉择后果叙事
   */
  private async generateRealConsequence(params: GenerateConsequenceParams): Promise<string> {
    // 安全检查
    const security = this.performSecurityCheck();
    if (!security.passed) {
      throw new Error(security.message || '安全检查未通过');
    }

    const historyText = params.storyHistory.slice(-3).join('\n');
    const prompt = `你是一位沉浸式互动小说的叙事引擎。以下是已发生的剧情：

${historyText}

当前情境：${params.sceneText}
玩家选择了行动：「${params.actionText}」

请用 80-120 字演绎这个选择带来的故事后果，要体现该行动风格（${params.selectedTrait}）的影响，推动剧情发展，不要评判对错，只叙事。直接输出叙事文本，不要任何前缀或解释。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const proxyUrl = '/.netlify/functions/ai-proxy';
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || this.getErrorMessage(response.status, ''));
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content.trim()) throw new Error('AI 返回内容为空');
      return content.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('叙事生成超时，请重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 真实 AI：生成最终结局
   */
  private async generateRealEnding(params: GenerateEndingParams): Promise<StoryResult> {
    // 安全检查
    const security = this.performSecurityCheck();
    if (!security.passed) {
      throw new Error(security.message || '安全检查未通过');
    }

    const historyText = params.storyHistory.join('\n');
    const prompt = `你是一位沉浸式互动小说的叙事引擎。以下是玩家经历的完整剧情：

${historyText}

请根据玩家的决策风格，为这个故事生成一个结局。输出 JSON 格式：
{
  "role": "角色设定一句话",
  "story": ["剧情片段1", "剧情片段2"],
  "ending": "结局描述",
  "episodesSurvived": 存活集数(数字),
  "personalityAnalysis": "性格分析",
  "shareColor": "#颜色",
  "characterPortrait": {
    "name": "名字",
    "appearance": "外貌",
    "background": "背景",
    "personalityTags": ["标签1","标签2"]
  }
}
世界观：${params.worldview.name}。直接输出 JSON。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const proxyUrl = '/.netlify/functions/ai-proxy';
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || this.getErrorMessage(response.status, ''));
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content.trim()) throw new Error('AI 返回内容为空');
      const result = this.parseStoryResponse(content);
      // 将 AI 返回的集数收敛到世界观上限内，避免与分季结构脱节
      result.episodesSurvived = Math.max(1, Math.min(params.worldview.episodeMax, result.episodesSurvived));
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('结局生成超时，请重试');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 根据 HTTP 状态码生成友好的错误提示
   */
  private getErrorMessage(status: number, body: string): string {
    switch (status) {
      case 401:
        return 'API Key 无效，请检查 VITE_AI_API_KEY 配置';
      case 403:
        return 'API Key 无权限访问该模型';
      case 404:
        return 'API 地址或模型名称不存在，请检查 VITE_AI_API_BASE 和 VITE_AI_MODEL';
      case 429:
        return '请求过于频繁或额度已用完，请稍后重试';
      default:
        return `AI API 请求失败 (${status})${body ? `: ${body.slice(0, 200)}` : ''}`;
    }
  }

  /**
   * 解析角色画像（兼容缺失字段）
   */
  private parseCharacterPortrait(data: any): {
    name: string;
    appearance: string;
    background: string;
    personalityTags: string[];
  } {
    if (!data || typeof data !== 'object') {
      return {
        name: '无名之人',
        appearance: '气质神秘，令人难以捉摸',
        background: '身世成谜的旅人',
        personalityTags: ['神秘莫测'],
      };
    }
    return {
      name: data.name || '无名之人',
      appearance: data.appearance || '气质神秘，令人难以捉摸',
      background: data.background || '身世成谜的旅人',
      personalityTags: Array.isArray(data.personalityTags)
        ? data.personalityTags
        : typeof data.personalityTags === 'string'
          ? data.personalityTags.split(/[,，、]/).map((t: string) => t.trim()).filter(Boolean)
          : ['独一无二'],
    };
  }

  /**
   * 解析 AI 返回的 JSON（兼容 markdown 代码块、多余文字等情况）
   */
  private parseStoryResponse(content: string): StoryResult {
    try {
      const parsed = JSON.parse(content);
      return {
        role: parsed.role ?? '',
        story: Array.isArray(parsed.story) ? parsed.story : [parsed.story ?? ''],
        ending: parsed.ending ?? '',
        episodesSurvived: Number(parsed.episodesSurvived) || 1,
        personalityAnalysis: parsed.personalityAnalysis ?? '',
        shareColor: parsed.shareColor ?? '#c87a35',
        characterPortrait: this.parseCharacterPortrait(parsed.characterPortrait),
      };
    } catch {
      // 尝试去除 markdown 代码块标记
      let cleaned = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // 尝试直接解析清理后的内容
      try {
        const parsed = JSON.parse(cleaned);
        return {
          role: parsed.role ?? '',
          story: Array.isArray(parsed.story) ? parsed.story : [parsed.story ?? ''],
          ending: parsed.ending ?? '',
          episodesSurvived: Number(parsed.episodesSurvived) || 1,
          personalityAnalysis: parsed.personalityAnalysis ?? '',
          shareColor: parsed.shareColor ?? '#c87a35',
          characterPortrait: this.parseCharacterPortrait(parsed.characterPortrait),
        };
      } catch {
        // 尝试提取第一个 JSON 对象
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              role: parsed.role ?? '',
              story: Array.isArray(parsed.story) ? parsed.story : [parsed.story ?? ''],
              ending: parsed.ending ?? '',
              episodesSurvived: Number(parsed.episodesSurvived) || 1,
              personalityAnalysis: parsed.personalityAnalysis ?? '',
              shareColor: parsed.shareColor ?? '#c87a35',
              characterPortrait: this.parseCharacterPortrait(parsed.characterPortrait),
            };
          } catch {
            // 最后尝试：修复常见 JSON 格式问题（单引号转双引号、尾逗号等）
            const fixed = jsonMatch[0]
              .replace(/'/g, '"')
              .replace(/,\s*([}\]])/g, '$1');
            try {
              const parsed = JSON.parse(fixed);
              return {
                role: parsed.role ?? '',
                story: Array.isArray(parsed.story) ? parsed.story : [parsed.story ?? ''],
                ending: parsed.ending ?? '',
                episodesSurvived: Number(parsed.episodesSurvived) || 1,
                personalityAnalysis: parsed.personalityAnalysis ?? '',
                shareColor: parsed.shareColor ?? '#c87a35',
                characterPortrait: this.parseCharacterPortrait(parsed.characterPortrait),
              };
            } catch {
              throw new Error('AI 返回格式错误，无法解析为 JSON');
            }
          }
        }
        throw new Error('AI 返回格式错误，无法解析为 JSON');
      }
    }
  }
}

// 单例
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}
