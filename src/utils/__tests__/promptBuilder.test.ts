import { describe, it, expect } from 'vitest';
import { buildStoryPrompt } from '../promptBuilder';
import type { PersonalityProfile, Worldview } from '../../types';

const mockWorldview: Worldview = {
  id: 'palace',
  name: '深宫风云',
  tagline: '测测你在后宫能活几集',
  description: 'test',
  coverEmoji: '🏯',
  accentColor: '#c87a35',
  bgGradient: 'from-amber-50 to-orange-100',
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
  },
};

describe('buildStoryPrompt', () => {
  it('应该生成包含世界观、性格画像和答题摘要的 prompt', () => {
    const prompt = buildStoryPrompt({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: ['你选择了忍气吞声', '你选择了暗中观察'],
    });

    expect(prompt).toContain('深宫风云');
    expect(prompt).toContain('谨慎隐忍');
    expect(prompt).toContain('心机深沉');
    expect(prompt).toContain('忍气吞声');
    expect(prompt).toContain('暗中观察');
  });

  it('应该包含 JSON 输出格式要求', () => {
    const prompt = buildStoryPrompt({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: [],
    });

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('role');
    expect(prompt).toContain('story');
    expect(prompt).toContain('ending');
    expect(prompt).toContain('episodesSurvived');
    expect(prompt).toContain('personalityAnalysis');
  });

  it('应该包含不使用真实 IP 角色名的要求', () => {
    const prompt = buildStoryPrompt({
      worldview: mockWorldview,
      profile: mockProfile,
      answerSummary: [],
    });

    expect(prompt).toContain('不要使用真实人物名或真实 IP 角色名');
  });
});
