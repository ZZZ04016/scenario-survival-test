import type { StoryResult } from '../types';
import { buildStoryPrompt } from '../utils/promptBuilder';
import type { Worldview, PersonalityProfile } from '../types';

export interface GenerateStoryParams {
  worldview: Worldview;
  profile: PersonalityProfile;
  answerSummary: string[];
}

/**
 * AI 服务模块
 * 负责调用大模型生成剧情，并解析返回的 JSON
 * 支持真实 API 调用和 Mock 模式（用于本地测试）
 */

// Mock 剧情模板库（用于无 API Key 时的本地演示）
const MOCK_STORIES: Record<string, StoryResult> = {
  palace: {
    role: '你是刚入宫的答应沈氏，父亲是六品小官，无依无靠',
    story: [
      '入宫第一天，你就感受到了这座紫禁城的森森寒意。同住的宫女偷走你的玉镯，你没有声张，只是默默观察——你知道，在这深宫里，冲动是活不过第一集的。',
      '皇后宫中的毒茶事件让你第一次直面后宫的险恶。你选择暗中提醒皇后，既没有得罪下毒的宠妃，也博得了皇后的一丝好感。这一步棋，你走得谨慎而聪明。',
      '皇上注意到了你，准备晋你的位分。宠妃的警告没有吓退你，你表面推辞，私下却找皇上哭诉宠妃欺压。皇上大怒，宠妃被禁足，你顺利晋位。',
      '你的贴身宫女竟是别人的眼线。你没有声张，而是给她传递假消息，让她的主子做出错误判断。这一招反间计，让你在后宫站稳了脚跟。',
      '最终决战，你与最大的对手正面交锋。你没有选择硬碰硬，而是布下天罗地网，等她露出破绽。一击必杀，你登上了后宫之巅。',
    ],
    ending: '你在后宫活了 68 集，最终成为母仪天下的皇后。你的谨慎与心机，让你成为了这场权力游戏的最后赢家。',
    episodesSurvived: 68,
    personalityAnalysis: '你是典型的"谨慎心机型"——不轻易出手，但出手必中。在现实中，你适合需要长期布局的工作，善于等待时机、抓住关键。但要注意，过度谨慎可能让你错过一些需要果断的机会。',
    shareColor: '#8B4513',
  },
  apocalypse: {
    role: '你是一名普通大学生，丧尸爆发时被困在宿舍',
    story: [
      '丧尸爆发的第一天，你看着室友变异，果断从窗户跳了下去。膝盖擦破了皮，但你活了下来。你知道，在这个新世界里，犹豫就意味着死亡。',
      '你找到了一个超市，里面已经有一群幸存者。你没有贸然冲进去，而是在外面观察了整整一天。确认他们不是坏人后，你才敲门请求加入。',
      '半夜营地被丧尸围攻，你带头冲锋打开缺口，带着大家逃了出来。从这一刻起，你成了队伍的主心骨。',
      '队伍里有人受伤发烧，可能变异。你没有立刻抛弃他，而是把他绑起来观察。最终他没有变异，成了你最忠诚的伙伴。',
      '最后关头，食物只够一个人活。你选择和同伴平分，一起走到最后。虽然你们最终没能等到救援，但你们死得有尊严。',
    ],
    ending: '你在末世活了 42 集，最终和同伴一起在废墟中迎来了黎明。你的果断与善良，让你成为了末世中少有的温暖。',
    episodesSurvived: 42,
    personalityAnalysis: '你是"果断善良型"——有勇气但不冷血，有原则但不迂腐。在现实中，你适合需要领导力和决策力的岗位，你的团队会因为你而有安全感。但有时你的善良可能被人利用，要学会分辨。',
    shareColor: '#E94560',
  },
  cultivation: {
    role: '你是一个五灵根的废柴修士，被宗门分到杂役峰',
    story: [
      '检测灵根那天，你被判定为五灵根——修仙界最废的资质。所有人都嘲笑你，但你没有放弃。你选择剑走偏锋，寻找偏门功法。',
      '宗门大比，你遇到实力远超你的对手。你用阴招赢了他，虽然不光彩，但你活了下来。在修仙界，结果比过程重要。',
      '你发现了一个上古秘境。你骗同门去错的地方，自己率先到达，得到了上古传承。从这一刻起，你的命运改变了。',
      '师父被陷害，你没有冲动地对抗宗门，而是暗中调查真相。三年后，你掌握了证据，为师父翻案，同时肃清了宗门内的叛徒。',
      '飞升在即，你发现飞升后所有人都会忘记你。你犹豫了，最终放弃了飞升，选择留在人间。对你来说，被人记住比成仙更重要。',
    ],
    ending: '你没有飞升，但你成为了人间最强者。你活了 500 岁，被无数人铭记。你的选择证明了，修仙修的不仅是实力，更是心性。',
    episodesSurvived: 75,
    personalityAnalysis: '你是"心机重情型"——为达目的可以不择手段，但内心有自己的底线。在现实中，你是天生的战略家，善于布局和隐忍。但要注意，不要为了成功失去了最重要的东西。',
    shareColor: '#2D6A4F',
  },
};

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
    this.timeoutMs = config?.timeoutMs ?? 30000;

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
   * Mock 模式：根据性格画像从模板库返回剧情
   */
  private async generateMockStory(
    params: GenerateStoryParams,
  ): Promise<StoryResult> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return MOCK_STORIES[params.worldview.id] ?? MOCK_STORIES.palace;
  }

  /**
   * 真实 API 调用
   */
  private async generateRealStory(
    params: GenerateStoryParams,
  ): Promise<StoryResult> {
    const prompt = buildStoryPrompt(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorMsg = this.getErrorMessage(response.status, await response.text().catch(() => ''));
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
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
   * 解析 AI 返回的 JSON
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
      };
    } catch {
      // 如果 JSON 解析失败，尝试提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return this.parseStoryResponse(jsonMatch[0]);
      }
      throw new Error('AI 返回格式错误，无法解析为 JSON');
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
