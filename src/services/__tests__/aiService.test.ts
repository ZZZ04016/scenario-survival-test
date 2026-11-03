import { describe, it, expect, beforeEach } from 'vitest';
import { AIService } from '../aiService';
import type { PersonalityProfile, Worldview } from '../../types';

const mockWorldview: Worldview = {
  id: 'palace',
  name: '深宫风云',
  tagline: 'test',
  description: 'test',
  coverEmoji: '🏯',
  accentColor: '#c87a35',
  bgGradient: 'from-amber-50 to-orange-100',
  episodeMax: 80,
  seasons: [
    { name: '一季·入宫', startEpisode: 1, endEpisode: 20 },
    { name: '二季·争宠', startEpisode: 21, endEpisode: 45 },
    { name: '三季·夺嫡', startEpisode: 46, endEpisode: 70 },
    { name: '四季·登顶', startEpisode: 71, endEpisode: 80 },
  ],
};

const mockProfile: PersonalityProfile = {
  primaryTrait: 'cautious',
  secondaryTrait: 'scheming',
  traitScores: {
    cautious: 3,
    decisive: 0,
    scheming: 2,
    kind: 0,
    ambitious: 0,
    loyal: 0,
    resolute: 0,
    wise: 0,
    bold: 0,
  },
};

describe('AIService (Mock 模式)', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService({ useMock: true });
  });

  it('应该在 Mock 模式下返回有效的剧情结果', async () => {
    const result = await aiService.generateStory({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: ['test answer'],
    });

    expect(result).toBeDefined();
    expect(result.role).toBeTruthy();
    expect(result.story).toBeInstanceOf(Array);
    expect(result.story.length).toBeGreaterThan(0);
    expect(result.ending).toBeTruthy();
    expect(result.episodesSurvived).toBeGreaterThan(0);
    expect(result.personalityAnalysis).toBeTruthy();
    expect(result.shareColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('不同世界观应返回不同的剧情', async () => {
    const palaceResult = await aiService.generateStory({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: [],
    });

    const apocalypseWorldview = { ...mockWorldview, id: 'apocalypse' as const, name: '末日求生' };
    const apocalypseResult = await aiService.generateStory({
      worldview: apocalypseWorldview,
      profile: mockProfile,
      answerSummary: [],
    });

    expect(palaceResult.story[0]).not.toBe(apocalypseResult.story[0]);
  });

  it('应该有模拟延迟（1-2 秒）', async () => {
    const start = Date.now();
    await aiService.generateStory({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: [],
    });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });
});
