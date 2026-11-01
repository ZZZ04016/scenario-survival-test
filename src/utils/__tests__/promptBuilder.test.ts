import { describe, it, expect } from 'vitest';
import { buildStoryPrompt, buildImagePrompt, buildImg2ImgPrompt } from '../promptBuilder';
import type { PersonalityProfile, UserImage, Worldview } from '../../types';

const mockWorldview: Worldview = {
  id: 'palace',
  name: '深宫风云',
  tagline: '测测你在后宫能活几集',
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
  },
};

const mockCharacterPortrait = {
  name: '沈婉宁',
  appearance: '鹅蛋脸，丹凤眼，乌黑长发挽成堕马髻',
  background: '六品文官之女，家族中落被迫入宫',
  personalityTags: ['谨慎隐忍', '步步为营'],
};

const mockUserImage: UserImage = {
  base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD',
  description: '鹅蛋脸，丹凤眼，高鼻梁，薄唇，白皙皮肤，长发，年轻女性',
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

describe('buildImagePrompt', () => {
  it('文生图 prompt 应包含角色名、世界观和外貌特征', () => {
    const prompt = buildImagePrompt({
      worldview: mockWorldview,
      characterPortrait: mockCharacterPortrait,
      userImage: mockUserImage,
    });

    expect(prompt).toContain('沈婉宁');
    expect(prompt).toContain('深宫风云');
    expect(prompt).toContain('oval face shape');
    expect(prompt).toContain('almond-shaped eyes');
    expect(prompt).toContain('hanfu');
  });

  it('无用户图片时仍应生成有效 prompt', () => {
    const prompt = buildImagePrompt({
      worldview: mockWorldview,
      characterPortrait: mockCharacterPortrait,
      userImage: null,
    });

    expect(prompt).toContain('沈婉宁');
    expect(prompt).toContain('photorealistic');
  });
});

describe('buildImg2ImgPrompt', () => {
  it('图生图 prompt 应强调保留原图元素、仅替换人脸', () => {
    const prompt = buildImg2ImgPrompt({
      worldview: mockWorldview,
      characterPortrait: mockCharacterPortrait,
      userImage: mockUserImage,
    });

    expect(prompt).toContain('Face swap');
    expect(prompt).toContain('Keep EVERYTHING from the reference image unchanged');
    expect(prompt).toContain('ONLY replace the face');
    expect(prompt).toContain('oval face shape');
    expect(prompt).toContain('Do not change the body, clothing, pose, background');
  });

  it('图生图与文生图 prompt 应有明显差异', () => {
    const img2img = buildImg2ImgPrompt({
      worldview: mockWorldview,
      characterPortrait: mockCharacterPortrait,
      userImage: mockUserImage,
    });
    const txt2img = buildImagePrompt({
      worldview: mockWorldview,
      characterPortrait: mockCharacterPortrait,
      userImage: mockUserImage,
    });

    expect(img2img).not.toEqual(txt2img);
    expect(img2img).toContain('reference image');
    expect(txt2img).toContain('photorealistic portrait of');
  });
});
