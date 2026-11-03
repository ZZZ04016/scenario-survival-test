import { describe, it, expect } from 'vitest';
import { generateDynamicCharacterPortrait } from '../characterLibrary';
import { generateDynamicStory } from '../storyLibrary';

describe('内容差异化验证', () => {
  it('角色画像每次生成应不同', () => {
    const portraits = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const p = generateDynamicCharacterPortrait('cultivation', {
        primaryTrait: 'cautious',
        secondaryTrait: 'decisive',
      });
      portraits.add(p.name + '|' + p.background);
    }
    // 10次生成至少应有8种不同结果
    expect(portraits.size).toBeGreaterThanOrEqual(8);
  });

  it('不同性格应生成不同角色标签', () => {
    const p1 = generateDynamicCharacterPortrait('palace', { primaryTrait: 'kind', secondaryTrait: 'loyal' });
    const p2 = generateDynamicCharacterPortrait('palace', { primaryTrait: 'scheming', secondaryTrait: 'ambitious' });
    // 标签应该不同
    expect(p1.personalityTags).not.toEqual(p2.personalityTags);
  });

  it('剧情每次生成应不同', () => {
    const openings = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const s = generateDynamicStory({
        worldviewId: 'apocalypse',
        profile: {
          primaryTrait: 'decisive',
          secondaryTrait: 'kind',
          traitScores: { cautious: 1, decisive: 4, scheming: 1, kind: 2, ambitious: 1, loyal: 1, resolute: 0, wise: 0, bold: 0 },
        },
        episodesSurvived: 50,
      });
      openings.add(s.story[0]);
    }
    // 5次生成至少应有4种不同开场
    expect(openings.size).toBeGreaterThanOrEqual(4);
  });

  it('不同存活集数应生成不同结局类型', () => {
    const sLow = generateDynamicStory({
      worldviewId: 'cultivation',
      profile: { primaryTrait: 'cautious', secondaryTrait: 'kind', traitScores: { cautious: 5, decisive: 0, scheming: 0, kind: 3, ambitious: 0, loyal: 2, resolute: 0, wise: 0, bold: 0 } },
      episodesSurvived: 10,
      episodeMax: 120,
    });
    const sHigh = generateDynamicStory({
      worldviewId: 'cultivation',
      profile: { primaryTrait: 'scheming', secondaryTrait: 'ambitious', traitScores: { cautious: 2, decisive: 1, scheming: 4, kind: 0, ambitious: 3, loyal: 0, resolute: 0, wise: 0, bold: 0 } },
      episodesSurvived: 95,
      episodeMax: 120,
    });
    // 结局应不同
    expect(sLow.ending).not.toEqual(sHigh.ending);
  });
});
